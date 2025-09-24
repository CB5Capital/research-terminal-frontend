import { useState, useRef, useEffect, useImperativeHandle } from 'react'
import './DashboardQuery.css'

function DashboardQuery({ activeCase, currentQuery, onQuerySubmit, existingDashboards, queryHistory, inputRef }) {
  const [queryText, setQueryText] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)
  const dropdownRef = useRef(null)
  const internalInputRef = useRef(null)

  // Extract user question from context queries
  const extractUserQuestion = (query) => {
    if (!query) return query
    
    // Check if this is a context query (contains "Context:" and "User Question:")
    if (query.includes('Context:') && query.includes('User Question:')) {
      const userQuestionMatch = query.match(/User Question:\s*(.+)$/s)
      if (userQuestionMatch && userQuestionMatch[1]) {
        return userQuestionMatch[1].trim()
      }
    }
    
    return query
  }

  // Update input field when currentQuery changes
  useEffect(() => {
    if (currentQuery && queryText !== currentQuery) {
      const displayText = extractUserQuestion(currentQuery)
      setQueryText(displayText)
    }
  }, [currentQuery])

  // Clear input when case changes (currentQuery becomes empty)
  useEffect(() => {
    if (!currentQuery && queryText !== '') {
      setQueryText('')
    }
  }, [currentQuery])

  // Expose methods to parent component
  useImperativeHandle(inputRef, () => ({
    focus: () => {
      internalInputRef.current?.focus()
    },
    clearAndFocus: () => {
      console.log('clearAndFocus called - focusing input')
      setQueryText('')
      setShowDropdown(true)
      setSelectedIndex(-1)
      if (internalInputRef.current) {
        internalInputRef.current.focus()
      }
    }
  }))


  const filteredDashboards = (existingDashboards || []).filter(dashboard =>
    queryText.trim() === '' || 
    dashboard.name.toLowerCase().includes(queryText.toLowerCase()) ||
    dashboard.description.toLowerCase().includes(queryText.toLowerCase())
  )

  const filteredHistory = (queryHistory || []).filter(item => {
    if (queryText.trim() === '') return true
    const displayQuery = extractUserQuestion(item.query)
    return displayQuery.toLowerCase().includes(queryText.toLowerCase())
  })

  const totalItems = filteredDashboards.length + filteredHistory.length

  const handleInputChange = (e) => {
    const value = e.target.value
    setQueryText(value)
    setShowDropdown(true) // Always show dropdown when typing
    setSelectedIndex(-1)
  }

  const handleFocus = () => {
    console.log('Input focused - clearing text')
    setQueryText('')
    setShowDropdown(true)
  }

  const handleBlur = () => {
    console.log('Input blurred - restoring title')
    // Add a small delay to allow clicks to be processed first
    setTimeout(() => {
      if (currentQuery && queryText === '') {
        const displayText = extractUserQuestion(currentQuery)
        setQueryText(displayText)
      }
      setShowDropdown(false)
    }, 150)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0) {
        if (selectedIndex < filteredHistory.length) {
          // Select from history
          const selected = filteredHistory[selectedIndex]
          handleHistorySelect(selected)
        } else if (selectedIndex < filteredHistory.length + filteredDashboards.length) {
          // Select existing dashboard
          const dashboardIndex = selectedIndex - filteredHistory.length
          const selected = filteredDashboards[dashboardIndex]
          handleDashboardSelect(selected)
        }
      } else if (queryText.trim()) {
        // Submit AI query
        handleQuerySubmit(queryText.trim())
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < totalItems - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > -1 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setSelectedIndex(-1)
      // Restore the current query text and defocus
      const displayText = extractUserQuestion(currentQuery || '')
      setQueryText(displayText)
      internalInputRef.current?.blur()
    }
  }

  const handleDashboardSelect = (dashboard) => {
    setQueryText('')
    setShowDropdown(false)
    setSelectedIndex(-1)
    // Blur the input to defocus
    if (internalInputRef.current) {
      internalInputRef.current.blur()
    }
    onQuerySubmit(`Load ${dashboard.name} dashboard`, dashboard.id)
  }

  const handleHistorySelect = (historyItem) => {
    setQueryText('')
    setShowDropdown(false)
    setSelectedIndex(-1)
    // Blur the input to defocus
    if (internalInputRef.current) {
      internalInputRef.current.blur()
    }
    onQuerySubmit(historyItem.query, null, true)
  }

  const handleQuerySubmit = (query) => {
    setQueryText('')
    setShowDropdown(false)
    setSelectedIndex(-1)
    // Blur the input to defocus
    if (internalInputRef.current) {
      internalInputRef.current.blur()
    }
    onQuerySubmit(query)
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setShowDropdown(false)
      setSelectedIndex(-1)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="dashboard-query" ref={dropdownRef}>
      <div className="query-input-container">
        <input
          ref={internalInputRef}
          type="text"
          value={queryText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Select dashboard or ask AI..."
          className="query-input"
        />
      </div>

      {showDropdown && (
        (queryText.trim() === '' && (queryHistory?.length > 0 || existingDashboards?.length > 0)) ||
        filteredHistory.length > 0 || 
        filteredDashboards.length > 0 || 
        queryText.trim()
      ) && (
        <div className="dashboard-dropdown">
          {filteredHistory.length > 0 && (
            <>
              <div className="dropdown-header">Previous Queries</div>
              {filteredHistory.map((historyItem, index) => (
                <div
                  key={historyItem.id}
                  className={`history-option ${selectedIndex === index ? 'selected' : ''}`}
                  onClick={() => handleHistorySelect(historyItem)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="history-query">{extractUserQuestion(historyItem.query)}</div>
                  <div className="history-timestamp">{formatTimestamp(historyItem.created_at)}</div>
                </div>
              ))}
              
              {filteredDashboards.length > 0 && <div className="dropdown-divider"></div>}
            </>
          )}

          {filteredDashboards.length > 0 && (
            <>
              <div className="dropdown-header">Dashboard Templates</div>
              {filteredDashboards.map((dashboard, index) => (
                <div
                  key={dashboard.id}
                  className={`dashboard-option ${selectedIndex === (filteredHistory.length + index) ? 'selected' : ''}`}
                  onClick={() => handleDashboardSelect(dashboard)}
                  onMouseEnter={() => setSelectedIndex(filteredHistory.length + index)}
                >
                  <div className="dashboard-name">{dashboard.name}</div>
                  <div className="dashboard-description">{dashboard.description}</div>
                </div>
              ))}
            </>
          )}
          
          {queryText.trim() && (
            <>
              <div className="dropdown-divider"></div>
              <div className="ai-query-option">
                <div className="ai-query-text">
                  Ask AI: "{queryText}"
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default DashboardQuery