import { useState } from 'react'
import SourceViewer from '../SourceViewer'
import './DashboardComponents.css'

function MetricCard({ label, value, trend, color = 'white', subtitle, sources, className, onClick, showDetails = false, activeCase }) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗'
      case 'down': return '↘'
      case 'neutral': return '→'
      default: return null
    }
  }

  const getTrendClass = () => {
    switch (trend) {
      case 'up': return 'trend-up'
      case 'down': return 'trend-down'
      case 'neutral': return 'trend-neutral'
      default: return ''
    }
  }

  const getColorClass = () => {
    switch (color) {
      case 'green': return 'color-green'
      case 'red': return 'color-red'
      case 'yellow': return 'color-yellow'
      case 'blue': return 'color-blue'
      default: return 'color-white'
    }
  }

  const isExpanded = className && className.includes('expanded-component')
  const shouldShowDetails = showDetails || isExpanded
  const [selectedSource, setSelectedSource] = useState(null)

  const handleSourceClick = (source, event) => {
    event.stopPropagation()
    setSelectedSource(source)
  }

  const handleCloseSourceViewer = () => {
    setSelectedSource(null)
  }

  return (
    <div className={`${className} metric-card`} onClick={onClick}>
      <div className="metric-content">
        <div className="metric-label">{label}</div>
        <div className={`metric-value ${getColorClass()}`}>
          {value}
          {trend && (
            <span className={`metric-trend ${getTrendClass()}`}>
              {getTrendIcon()}
            </span>
          )}
        </div>
        {subtitle && <div className="metric-subtitle">{subtitle}</div>}
        
        {shouldShowDetails && sources && sources.length > 0 && (
          <div className="metric-sources">
            <div className="sources-header">Sources:</div>
            <div className="sources-list">
              {sources.map((source, index) => (
                <span 
                  key={index} 
                  className={`source-tag relevance-${source.relevance?.toLowerCase()} clickable-source`}
                  onClick={(event) => handleSourceClick(source, event)}
                  title="Click to view full source content"
                >
                  {source.filename}
                  <span className="expand-source-icon">🔍</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedSource && activeCase && (
        <SourceViewer
          source={selectedSource}
          activeCase={activeCase}
          onClose={handleCloseSourceViewer}
        />
      )}
    </div>
  )
}

export default MetricCard