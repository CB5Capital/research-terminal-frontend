import { useState, useEffect, useRef } from 'react'
import TopNavBar from './components/TopNavBar'
import DynamicDashboard from './components/DynamicDashboard'
import backendService from './services/backendService'
import './App.css'

function App() {
  console.log('App component rendering...') // Debug log
  
  const [activeCase, setActiveCase] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [currentQuery, setCurrentQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [queryHistory, setQueryHistory] = useState({})
  const [cases, setCases] = useState([])
  const [casesLoading, setCasesLoading] = useState(true)
  const queryInputRef = useRef(null)
  const caseSelectorRef = useRef(null)
  const topNavBarRef = useRef(null)


  const updateCurrentProject = async (projectId) => {
    try {
      await backendService.updateSettings({ current_project: projectId })
      console.log('Updated current project in settings:', projectId)
    } catch (error) {
      console.error('Failed to update current project in settings:', error)
    }
  }

  const handleCaseSelect = async (selectedCase) => {
    setActiveCase(selectedCase)
    setDashboardData(null) // Clear previous dashboard when case changes
    setCurrentQuery('') // Clear current query when case changes
    setError(null)
    
    // Update browser title
    document.title = selectedCase.name
    
    // Update settings with new current project
    updateCurrentProject(selectedCase.id)
    
    // Fetch query history for the selected case from QueryLib
    try {
      const historyResponse = await backendService.getQueryHistory(selectedCase.id, 10)
      const queries = historyResponse.queries || []
      
      setQueryHistory(prev => ({
        ...prev,
        [selectedCase.id]: queries
      }))
      
      // Auto-load the first query if available
      if (queries.length > 0) {
        const firstQuery = queries[0]
        console.log('Auto-loading first query:', firstQuery.query)
        
        // Load the first dashboard automatically
        try {
          const dashboardResult = await backendService.getDashboardById(selectedCase.id, firstQuery.dashboard_id)
          if (dashboardResult && dashboardResult.dashboard) {
            setDashboardData(dashboardResult.dashboard)
            setCurrentQuery(firstQuery.query)
            console.log('Auto-loaded first dashboard successfully')
          }
        } catch (error) {
          console.error('Failed to auto-load first dashboard:', error)
          // Don't show error to user, just leave dashboard empty
        }
      }
    } catch (error) {
      console.error('Failed to fetch query history:', error)
      // Keep existing history or empty array if first time
    }
  }

  const handleQuerySubmit = async (query, dashboardId = null, fromHistory = false, displayQuery = null) => {
    if (!activeCase) return

    setIsLoading(true)
    setError(null)

    try {
      let result
      
      if (fromHistory) {
        // Loading from query history - load dashboard from QueryLib
        const historyItem = getQueryHistory().find(item => item.query === query)
        if (historyItem && historyItem.dashboard_id) {
          console.log('Loading dashboard from QueryLib:', historyItem.dashboard_id)
          const dashboardResult = await backendService.getDashboardById(activeCase.id, historyItem.dashboard_id)
          if (dashboardResult && dashboardResult.dashboard) {
            setDashboardData(dashboardResult.dashboard)
            // For history items, always show the original query
            setCurrentQuery(query)
            setIsLoading(false)
            return
          }
        }
      }

      if (dashboardId) {
        // Loading existing dashboard template - use query-based approach
        console.log(`Loading existing dashboard: ${dashboardId}`)
        const queryText = `Show me the ${dashboardId} dashboard`
        result = await backendService.generateDashboardFromQuery(activeCase.id, queryText)
        // For dashboard templates, show the template name
        setCurrentQuery(queryText)
      } else {
        // Generate new dashboard from AI query using existing dashboard items
        console.log('Generating new dashboard from AI query:', query)
        result = await backendService.generateDashboardFromQuery(activeCase.id, query)
        // Store the full query, frontend will extract user question if needed
        setCurrentQuery(query)
      }

      setDashboardData(result.dashboard)

      // Dashboard saved automatically to QueryLib by backend
      console.log('Dashboard generated and saved:', result.dashboard_id)
      
      // Refresh query history to include the new query
      try {
        const historyResponse = await backendService.getQueryHistory(activeCase.id, 10)
        setQueryHistory(prev => ({
          ...prev,
          [activeCase.id]: historyResponse.queries || []
        }))
      } catch (error) {
        console.error('Failed to refresh query history:', error)
        // Don't block the UI if history refresh fails
      }

    } catch (err) {
      setError(`Backend error: ${err.message}`)
      console.error('Dashboard generation failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getQueryHistory = () => {
    if (!activeCase) return []
    return queryHistory[activeCase.id] || []
  }

  // Load cases and settings from backend on component mount
  useEffect(() => {
    const loadCasesAndSettings = async () => {
      try {
        setCasesLoading(true)
        
        // Set default title
        document.title = 'Research Dashboard'
        
        // Load cases and settings in parallel
        const [casesResult, settingsResult] = await Promise.all([
          backendService.getAllCases(),
          backendService.getSettings()
        ])
        
        setCases(casesResult.cases)
        console.log('Loaded cases from backend:', casesResult.cases)
        
        // Auto-load current project from settings
        if (settingsResult.success && settingsResult.settings.current_project) {
          const currentProject = casesResult.cases.find(
            caseItem => caseItem.id === settingsResult.settings.current_project
          )
          
          if (currentProject) {
            console.log('Auto-loading current project from settings:', currentProject.id)
            handleCaseSelect(currentProject)
          }
        }
        
      } catch (error) {
        console.error('Failed to load cases and settings:', error)
        setCases([]) // Fallback to empty array
      } finally {
        setCasesLoading(false)
      }
    }

    loadCasesAndSettings()
  }, [])

  // Global keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Skip if we're in an input field (except for Shift+7 which should work anywhere)
      if (['INPUT', 'TEXTAREA'].includes(event.target.tagName) && !(event.key === '7' && event.shiftKey)) {
        return
      }

      // Check if '/' key is pressed to focus query input
      if (event.key === '/' && activeCase && queryInputRef.current) {
        event.preventDefault()
        queryInputRef.current.focus()
      }

      // Check if Shift+C is pressed to open case selector
      if (event.key === 'C' && event.shiftKey && caseSelectorRef.current) {
        event.preventDefault()
        caseSelectorRef.current.openSelector()
      }

      // Check if Shift+7 is pressed to focus query input and show all queries
      if ((event.key === '7' || event.key === '&' || event.key === '/') && event.shiftKey && activeCase && queryInputRef.current) {
        console.log('Shift+7 detected in App.jsx')
        event.preventDefault()
        queryInputRef.current.clearAndFocus()
      }


    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeCase])

  // Get existing dashboard templates for the selected case
  const getExistingDashboards = () => {
    if (!activeCase) return []
    // This could be populated from backend API in the future
    return []
  }

  return (
    <div className="bloomberg-terminal">
      <TopNavBar 
        ref={topNavBarRef}
        cases={cases}
        casesLoading={casesLoading}
        activeCase={activeCase}
        currentQuery={currentQuery}
        onCaseSelect={handleCaseSelect}
        onQuerySubmit={handleQuerySubmit}
        existingDashboards={getExistingDashboards()}
        queryHistory={getQueryHistory()}
        queryInputRef={queryInputRef}
        caseSelectorRef={caseSelectorRef}
      />
      
      <div className="terminal-content">
        {activeCase ? (
          <DynamicDashboard 
            dashboardData={dashboardData}
            isLoading={isLoading}
            error={error}
            activeCase={activeCase}
            cases={cases}
            onQuerySubmit={handleQuerySubmit}
          />
        ) : (
          <div className="no-case-selected">
          </div>
        )}
      </div>
    </div>
  )
}

export default App
