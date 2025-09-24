import { useState } from 'react'
import SourceViewer from '../SourceViewer'
import './DashboardComponents.css'

function RiskAssessment({ title, risks, sources, className, onClick, showDetails = false, activeCase }) {
  const getRiskLevelClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'risk-low'
      case 'medium': return 'risk-medium'
      case 'high': return 'risk-high'
      default: return 'risk-medium'
    }
  }

  const getRiskIcon = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return '✓'
      case 'medium': return '⚠'
      case 'high': return '⚠'
      default: return '⚠'
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
    <div className={`${className} risk-assessment-component`} onClick={onClick}>
      {title && <h3>{title}</h3>}
      <div className="risks-list">
        {risks.map((risk, index) => (
          <div key={index} className={`risk-item ${getRiskLevelClass(risk.level)}`}>
            <div className="risk-header">
              <span className="risk-icon">{getRiskIcon(risk.level)}</span>
              <span className="risk-description">{risk.description || risk.title}</span>
              <span className="risk-level">{risk.level}</span>
            </div>
            {risk.mitigation && (
              <div className="risk-mitigation">
                <strong>Mitigation:</strong> {risk.mitigation}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {shouldShowDetails && sources && sources.length > 0 && (
        <div className="risk-assessment-sources">
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

export default RiskAssessment