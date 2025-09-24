import { useState, useEffect } from 'react'
import backendService from '../services/backendService'
import './AIQueryInput.css'

function AIQueryInput({ activeCase, onQuerySubmit, isLoading, disabled }) {
  const [query, setQuery] = useState('')
  const [queryHistory, setQueryHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [recentQueries, setRecentQueries] = useState([])

  // Load query history when active case changes
  useEffect(() => {
    if (activeCase) {
      loadQueryHistory()
      loadRecentQueries()
    }
  }, [activeCase])

  const loadQueryHistory = async () => {
    try {
      const history = await backendService.getQueryHistory(activeCase.id, 20) // Last 20 queries
      setQueryHistory(history.queries || [])
    } catch (error) {
      console.error('Failed to load query history:', error)
    }
  }

  const loadRecentQueries = async () => {
    try {
      const queries = await backendService.getRecentQueries(activeCase.id, 10)
      setRecentQueries(queries)
    } catch (error) {
      console.error('Failed to load recent queries:', error)
    }
  }

  const handleHistorySelect = async (historyEntry) => {
    // Load the saved dashboard from history
    setQuery(historyEntry.query)
    setShowHistory(false)
    
    // Call the onQuerySubmit with the saved dashboard instead of generating new one
    if (onQuerySubmit) {
      onQuerySubmit(historyEntry.query, historyEntry.dashboard)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim() && !isLoading) {
      onQuerySubmit(query.trim())
      setQuery('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }


  if (disabled) {
    return (
      <div className="ai-query-bar disabled">
        <div className="query-message">Select a case to start analysis</div>
      </div>
    )
  }

  return (
    <div className="ai-query-bar">
      
      <form onSubmit={handleSubmit} className="query-form">
        <div className="query-input-container">
          <div className="query-input-wrapper">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask the AI to generate a dashboard... (e.g., 'Show me market analysis for robotics cleaning industry')"
              className="query-input"
              disabled={isLoading}
              rows={1}
            />
            {queryHistory.length > 0 && (
              <button
                type="button"
                className="history-toggle"
                onClick={() => setShowHistory(!showHistory)}
                disabled={isLoading}
                title="View query history"
              >
                📋
              </button>
            )}
          </div>
          
          {showHistory && queryHistory.length > 0 && (
            <div className="query-history-dropdown">
              <div className="history-header">
                <span>Previous Queries</span>
                <button
                  type="button"
                  className="close-history"
                  onClick={() => setShowHistory(false)}
                >
                  ✕
                </button>
              </div>
              <div className="history-list">
                {queryHistory.map((historyEntry) => (
                  <div
                    key={historyEntry.id}
                    className="history-item"
                    onClick={() => handleHistorySelect(historyEntry)}
                  >
                    <div className="history-query">{historyEntry.query}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <button 
            type="submit" 
            className={`query-submit ${isLoading ? 'loading' : ''}`}
            disabled={!query.trim() || isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner">⟳</div>
            ) : (
              'GENERATE'
            )}
          </button>
        </div>
      </form>
      
      
      {isLoading && (
        <div className="ai-status">
          <div className="status-indicator">
            <div className="status-dot pulsing"></div>
            <span>Generating...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIQueryInput