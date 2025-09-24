import { useState, useRef, useEffect, useMemo } from 'react'
import MetricCard from './dashboard/MetricCard'
import DataTable from './dashboard/DataTable'
import ProgressBar from './dashboard/ProgressBar'
import ListItems from './dashboard/ListItems'
import CompetitorAnalysis from './dashboard/CompetitorAnalysis'
import RiskAssessment from './dashboard/RiskAssessment'
import FinancialChart from './dashboard/FinancialChart'
import TextAnalysis from './dashboard/TextAnalysis'
import ShortText from './dashboard/ShortText'
import LongText from './dashboard/LongText'
import ExpandedView from './ExpandedView'
import AIChat from './AIChat'
import DataManagerBar from './DataManagerBar'
import './DynamicDashboard.css'

function DynamicDashboard({ dashboardData, isLoading, error, activeCase, cases, onQuerySubmit }) {
  const [expandedComponent, setExpandedComponent] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isDataManagerBarOpen, setIsDataManagerBarOpen] = useState(false)
  const containerRef = useRef(null)

  // Calculate components for navigation (memoized to prevent constant re-creation)
  const componentsToRenderForNav = useMemo(() => {
    const rawComponents = dashboardData?.components || []
    return rawComponents.filter(component => {
      if (!component.type) return false
      if (typeof component === 'string') return false
      if (component.type === 'title' || component.type === 'header' || component.type === 'subtitle') return false
      if (component.content && typeof component.content === 'string' && 
          component.content.includes('Dashboard') && !component.type.includes('text')) return false
      return true
    })
  }, [dashboardData?.components])

  // Keyboard navigation - must be at top level to follow hooks rules
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Handle Shift+D to toggle data manager bar
      if (event.key === 'D' && event.shiftKey) {
        event.preventDefault()
        setIsDataManagerBarOpen(prev => !prev)
        return
      }
      
      // Allow Shift+7 to pass through to App component for query clearing
      if ((event.key === '7' || event.key === '&' || event.key === '/') && event.shiftKey) {
        return
      }
      
      // Handle Shift+Enter key to open selected component
      if (event.key === 'Enter' && event.shiftKey && !expandedComponent && !isLoading && !error && dashboardData?.components) {
        event.preventDefault()
        const totalComponents = componentsToRenderForNav.length
        if (selectedIndex >= 0 && selectedIndex < totalComponents) {
          const selectedComponent = componentsToRenderForNav[selectedIndex]
          setExpandedComponent(selectedComponent)
        }
        return
      }
      
      // Only handle navigation when not in expanded view and Shift is held
      if (expandedComponent || !event.shiftKey || isLoading || error || !dashboardData?.components) {
        return
      }

      const totalComponents = componentsToRenderForNav.length
      if (totalComponents === 0) {
        return
      }

      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % totalComponents)
          break
        case 'ArrowLeft':
          event.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + totalComponents) % totalComponents)
          break
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex((prev) => {
            const cols = Math.ceil(Math.sqrt(totalComponents))
            const newIndex = Math.min(prev + cols, totalComponents - 1)
            return newIndex
          })
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex((prev) => {
            const cols = Math.ceil(Math.sqrt(totalComponents))
            const newIndex = Math.max(prev - cols, 0)
            return newIndex
          })
          break
        default:
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [expandedComponent, componentsToRenderForNav.length, isLoading, error, dashboardData])

  // Reset selected index when dashboard data changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [dashboardData])

  if (isLoading) {
    return (
      <div className="dynamic-dashboard loading">
        <div className="dashboard-loading">
          <div className="loading-animation">
            <div className="loading-spinner large">⟳</div>
            <h3>AI Agent Generating Dashboard...</h3>
            <p>Analyzing knowledge base and processing your query</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dynamic-dashboard error">
        <div className="dashboard-error">
          <div className="error-icon">⚠️</div>
          <h3>Dashboard Generation Failed</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData || !dashboardData.components || dashboardData.components.length === 0) {
    return (
      <div className="dynamic-dashboard empty">
        <div className="dashboard-empty">
          <div className="empty-icon">📊</div>
          <h3>No Dashboard Data</h3>
          <p>No components available to display</p>
        </div>
      </div>
    )
  }

  const handleComponentClick = (component) => {
    setExpandedComponent(component)
  }

  const handleCloseExpanded = () => {
    setExpandedComponent(null)
  }

  const renderComponent = (component, index) => {
    const key = `${component.type}-${index}`
    const isSelected = index === selectedIndex
    
    const componentProps = {
      ...component,
      className: `dashboard-component ${component.type.replace('_', '-')} clickable ${isSelected ? 'keyboard-selected' : ''}`,
      onClick: () => handleComponentClick(component),
      activeCase: activeCase
    }

    switch (component.type) {
      case 'metric_card':
        return <MetricCard key={key} {...componentProps} />
      case 'data_table':
        return <DataTable key={key} {...componentProps} />
      case 'progress_bar':
        return <ProgressBar key={key} {...componentProps} />
      case 'list_items':
        return <ListItems key={key} {...componentProps} />
      case 'competitor_analysis':
        return <CompetitorAnalysis key={key} {...componentProps} />
      case 'risk_assessment':
        return <RiskAssessment key={key} {...componentProps} />
      case 'financial_chart':
        return <FinancialChart key={key} {...componentProps} />
      case 'text_analysis':
        return <TextAnalysis key={key} {...componentProps} />
      case 'short_text':
        return <ShortText key={key} {...componentProps} />
      case 'long_text':
        return <LongText key={key} {...componentProps} />
      default:
        return (
          <div 
            className={`dashboard-component unknown clickable ${isSelected ? 'keyboard-selected' : ''}`}
            key={key} 
            onClick={() => handleComponentClick(component)}
            activeCase={activeCase}
          >
            <div className="unknown-component">
              <h4>Unknown Component: {component.type}</h4>
              <pre>{JSON.stringify(component, null, 2)}</pre>
            </div>
          </div>
        )
    }
  }

  // Use the same filtered components for rendering
  const componentsToRender = componentsToRenderForNav

  // Extract the user's query from dashboard data
  const getUserQuery = () => {
    if (!dashboardData) return null
    
    // Try different possible fields where the query might be stored
    return dashboardData.query || 
           dashboardData.user_query || 
           dashboardData.original_query ||
           null
  }

  const userQuery = getUserQuery()

  return (
    <div className="dynamic-dashboard" ref={containerRef}>
      {userQuery && (
        <div className="dashboard-header">
          <h2 className="dashboard-title">{userQuery}</h2>
        </div>
      )}
      
      <div className={`dashboard-layout ${isDataManagerBarOpen ? 'with-data-manager' : ''}`}>
        {/* Left Column - Dashboard Components */}
        <div className="dashboard-components">
          <div className="dashboard-grid">
            {componentsToRender && componentsToRender.length > 0 ? (
              componentsToRender.map((component, index) => 
                renderComponent(component, index)
              )
            ) : (
              <div className="dashboard-empty">
                <h3>No Components Found</h3>
                <p>Dashboard data exists but no components to render</p>
              </div>
            )}
          </div>
        </div>

        {/* Middle Column - AI Chat */}
        <div className="dashboard-chat">
          <AIChat 
            dashboardData={dashboardData}
            activeCase={activeCase}
            onQuerySubmit={onQuerySubmit}
          />
        </div>

        {/* Right Column - Data Manager Bar (conditionally rendered) */}
        {isDataManagerBarOpen && (
          <div className="dashboard-data-manager">
            <DataManagerBar 
              activeCase={activeCase}
              cases={cases || []}
              onClose={() => setIsDataManagerBarOpen(false)}
            />
          </div>
        )}
      </div>
      
      {expandedComponent && (
        <ExpandedView 
          component={expandedComponent} 
          onClose={handleCloseExpanded}
          activeCase={activeCase}
          onQuerySubmit={onQuerySubmit}
        />
      )}
    </div>
  )
}

export default DynamicDashboard