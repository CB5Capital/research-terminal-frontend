import { useState } from 'react'
import SourceViewer from '../SourceViewer'
import './DashboardComponents.css'

function ProgressBar({ title, label, value, percentage, max_value = 100, color = 'blue', showValue = true, sources, className, onClick, showDetails = false, activeCase }) {
  const getColorClass = () => {
    switch (color) {
      case 'green': return 'progress-green'
      case 'red': return 'progress-red'
      case 'yellow': return 'progress-yellow'
      case 'blue': return 'progress-blue'
      default: return 'progress-blue'
    }
  }

  // Calculate percentage from value and max_value if percentage not provided
  const calculatedPercentage = percentage !== undefined 
    ? percentage 
    : (value !== undefined && max_value > 0) 
      ? (value / max_value) * 100 
      : 0
      
  const clampedPercentage = Math.max(0, Math.min(100, calculatedPercentage))
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
    <div className={`${className} progress-bar-component`} onClick={onClick}>
      {title && <h3>{title}</h3>}
      <div className="progress-header">
        <span className="progress-label">{label || title}</span>
        {showValue && <span className="progress-value">{clampedPercentage.toFixed(1)}%</span>}
      </div>
      <div className="progress-track">
        <div 
          className={`progress-fill ${getColorClass()}`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      
      {shouldShowDetails && sources && sources.length > 0 && (
        <div className="progress-bar-sources">
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

export default ProgressBar