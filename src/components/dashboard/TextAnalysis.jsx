import { useState } from 'react'
import SourceViewer from '../SourceViewer'
import './DashboardComponents.css'

function TextAnalysis({ title, content, insights, conclusion, sources, className, onClick, showDetails = false, activeCase }) {
  const isExpanded = className && className.includes('expanded-component')
  const shouldShowDetails = showDetails || isExpanded
  const [selectedSource, setSelectedSource] = useState(null)

  const handleSourceClick = (source, event) => {
    event.stopPropagation() // Prevent component expansion
    setSelectedSource(source)
  }

  const handleCloseSourceViewer = () => {
    setSelectedSource(null)
  }
  
  return (
    <div className={`${className} text-analysis-component`} onClick={onClick}>
      {title && <h3>{title}</h3>}
      
      {content && (
        <div className="analysis-content">
          <p>{content}</p>
        </div>
      )}
      
      {shouldShowDetails && insights && insights.length > 0 && (
        <div className="analysis-insights">
          <h4>Key Insights</h4>
          <ul>
            {insights.map((insight, index) => (
              <li key={index} className="insight-item">
                <span className="insight-bullet">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {shouldShowDetails && conclusion && (
        <div className="analysis-conclusion">
          <h4>Conclusion</h4>
          <p>{conclusion}</p>
        </div>
      )}

      {shouldShowDetails && sources && sources.length > 0 && (
        <div className="text-analysis-sources">
          <h4>Sources</h4>
          <div className="sources-list">
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

export default TextAnalysis