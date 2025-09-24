import { useState } from 'react'
import SourceViewer from '../SourceViewer'
import './DashboardComponents.css'

function CompetitorAnalysis({ title, competitors, sources, className, onClick, showDetails = false, activeCase }) {
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
    <div className={`${className} competitor-analysis-component`} onClick={onClick}>
      {title && <h3>{title}</h3>}
      <div className="competitors-list">
        {competitors.map((competitor, index) => (
          <div key={index} className="competitor-item">
            <div className="competitor-header">
              <span className="competitor-name">{competitor.name}</span>
              <span className="competitor-value">{competitor.value || competitor.market_share}</span>
            </div>
            <div className="competitor-metric">{competitor.metric || competitor.key_strength}</div>
            {competitor.description && (
              <div className="competitor-description">{competitor.description}</div>
            )}
            {competitor.position && (
              <div className="competitor-position">{competitor.position}</div>
            )}
          </div>
        ))}
      </div>
      
      {shouldShowDetails && sources && sources.length > 0 && (
        <div className="competitor-analysis-sources">
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

export default CompetitorAnalysis