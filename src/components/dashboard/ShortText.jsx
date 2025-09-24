import { useState } from 'react'
import SourceViewer from '../SourceViewer'
import './DashboardComponents.css'

function ShortText({ title, content, sources, className, onClick, showDetails = false, activeCase }) {
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
    <div className={`short-text ${className || ''}`} onClick={onClick}>
      <h3 className="short-text-title">{title}</h3>
      <p className="short-text-content">{content}</p>
      
      {shouldShowDetails && sources && sources.length > 0 && (
        <div className="short-text-sources">
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

export default ShortText