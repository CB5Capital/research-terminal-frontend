import { useState } from 'react'
import SourceViewer from '../SourceViewer'
import './DashboardComponents.css'

function ListItems({ title, items, ordered = false, sources, className, onClick, showDetails = false, activeCase }) {
  const getItemColorClass = (color) => {
    switch (color) {
      case 'green': return 'item-green'
      case 'red': return 'item-red'
      case 'yellow': return 'item-yellow'
      case 'blue': return 'item-blue'
      default: return 'item-default'
    }
  }

  const ListTag = ordered ? 'ol' : 'ul'
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
    <div className={`${className} list-items-component`} onClick={onClick}>
      {title && <h3>{title}</h3>}
      <ListTag className="items-list">
        {items.map((item, index) => (
          <li key={index} className={`list-item ${getItemColorClass(item.color)}`}>
            {item.icon && <span className="item-icon">{item.icon}</span>}
            <span className="item-text">{typeof item === 'string' ? item : item.text}</span>
          </li>
        ))}
      </ListTag>
      
      {shouldShowDetails && sources && sources.length > 0 && (
        <div className="list-items-sources">
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

export default ListItems