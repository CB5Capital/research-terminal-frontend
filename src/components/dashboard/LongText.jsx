import { useState } from 'react'
import SourceViewer from '../SourceViewer'
import './DashboardComponents.css'

function LongText({ title, content, sources, className, onClick, showDetails = false, activeCase }) {
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
    <div className={`long-text ${className || ''}`} onClick={onClick}>
      <h3 className="long-text-title">{title}</h3>
      <div className="long-text-content">
        {content.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      
      {shouldShowDetails && sources && sources.length > 0 && (
        <div className="long-text-sources">
          <div className="sources-header">Sources & Insights:</div>
          <div className="sources-detailed">
            {sources.map((source, index) => (
              <div 
                key={index} 
                className={`source-item relevance-${source.relevance?.toLowerCase()} clickable-source`}
                onClick={(event) => handleSourceClick(source, event)}
                title="Click to view full source content"
              >
                <div className="source-filename">
                  {source.filename}
                  <span className="expand-source-icon">🔍</span>
                </div>
                <div className="source-insight">{source.key_insight}</div>
              </div>
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

export default LongText