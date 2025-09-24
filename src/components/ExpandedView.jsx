import { useEffect, useState, useRef } from 'react'
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
import './ExpandedView.css'

function ExpandedView({ component, onClose, activeCase, onQuerySubmit }) {
  const [queryText, setQueryText] = useState('')
  const [isQuerying, setIsQuerying] = useState(false)
  const queryInputRef = useRef(null)

  const handleQuerySubmit = async (e) => {
    e.preventDefault()
    if (!queryText.trim() || !activeCase || !onQuerySubmit) return
    
    setIsQuerying(true)
    try {
      // Create a detailed context with all component data
      const componentContext = `
Component Type: ${component.type.replace('_', ' ')}
Component Title: ${component.title || component.label || 'Untitled'}
Component Data: ${JSON.stringify(component, null, 2)}
      `.trim()
      
      // Create a contextual query that includes the component data but shows user's query
      const fullContextQuery = `Context: I am viewing a dashboard component with the following data:

${componentContext}

User Question: ${queryText.trim()}`
      
      // The user only sees their simple query, but AI gets full context
      await onQuerySubmit(fullContextQuery, null, false, queryText.trim())
      setQueryText('') // Clear the input after successful submission
      onClose() // Close the expanded view and show the new results
    } catch (error) {
      console.error('Failed to submit query from expanded view:', error)
    } finally {
      setIsQuerying(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleQuerySubmit(e)
    }
  }

  // Auto-focus query input when component opens
  useEffect(() => {
    if (queryInputRef.current) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        queryInputRef.current.focus()
      }, 100)
    }
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [onClose])

  const renderExpandedComponent = () => {
    const expandedProps = {
      ...component,
      className: 'expanded-component',
      activeCase: activeCase
    }

    switch (component.type) {
      case 'metric_card':
        return <MetricCard {...expandedProps} />
      case 'data_table':
        return <DataTable {...expandedProps} />
      case 'progress_bar':
        return <ProgressBar {...expandedProps} />
      case 'list_items':
        return <ListItems {...expandedProps} />
      case 'competitor_analysis':
        return <CompetitorAnalysis {...expandedProps} />
      case 'risk_assessment':
        return <RiskAssessment {...expandedProps} />
      case 'financial_chart':
        return <FinancialChart {...expandedProps} />
      case 'text_analysis':
        return <TextAnalysis {...expandedProps} />
      case 'short_text':
        return <ShortText {...expandedProps} />
      case 'long_text':
        return <LongText {...expandedProps} />
      default:
        return (
          <div className="expanded-component unknown">
            <h4>Unknown Component: {component.type}</h4>
            <pre>{JSON.stringify(component, null, 2)}</pre>
          </div>
        )
    }
  }

  return (
    <div className="expanded-view-overlay" onClick={onClose}>
      <div className="expanded-view-container" onClick={(e) => e.stopPropagation()}>
        <div className="expanded-view-header">
          <div className="expanded-view-title">
            <span className="component-type">{component.type.replace('_', ' ').toUpperCase()}</span>
            <span className="component-title">{component.title || component.label}</span>
          </div>
          <button className="close-button" onClick={onClose}>
            <span className="close-icon">×</span>
          </button>
        </div>
        
        <div className="expanded-view-content">
          {renderExpandedComponent()}
        </div>
        
        {activeCase && onQuerySubmit && (
          <div className="expanded-view-query">
            <form onSubmit={handleQuerySubmit} className="query-form">
              <div className="query-input-container">
                <input
                  ref={queryInputRef}
                  type="text"
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask a question about this ${component.type.replace('_', ' ')}...`}
                  className="query-input"
                  disabled={isQuerying}
                />
                <button 
                  type="submit" 
                  className="query-submit-btn"
                  disabled={!queryText.trim() || isQuerying}
                >
                  {isQuerying ? '...' : '→'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="expanded-view-footer">
          <div className="navigation-hint">
            <span className="key-hint">ESC</span> to close
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpandedView