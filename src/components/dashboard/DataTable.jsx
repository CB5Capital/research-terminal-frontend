import { useState } from 'react'
import SourceViewer from '../SourceViewer'
import './DashboardComponents.css'

function DataTable({ title, headers = [], rows = [], highlightColumn, sources, className, onClick, showDetails = false, activeCase }) {
  // Ensure we have valid data
  if (!headers.length && !rows.length) {
    return (
      <div className={`${className} data-table-component`} onClick={onClick}>
        {title && <h3>{title}</h3>}
        <div className="no-data">No data available</div>
      </div>
    )
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
    <div className={`${className} data-table-component`} onClick={onClick}>
      {title && <h3>{title}</h3>}
      <div className="table-container">
        <table className="data-table">
          {headers.length > 0 && (
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th 
                    key={index}
                    className={highlightColumn === index ? 'highlighted' : ''}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Array.isArray(row) ? row.map((cell, cellIndex) => (
                  <td 
                    key={cellIndex}
                    className={highlightColumn === cellIndex ? 'highlighted' : ''}
                  >
                    {cell}
                  </td>
                )) : (
                  <td>{row}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {shouldShowDetails && sources && sources.length > 0 && (
        <div className="data-table-sources">
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

export default DataTable