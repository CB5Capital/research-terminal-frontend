import { useState } from 'react'
import SourceViewer from '../SourceViewer'
import './DashboardComponents.css'

function FinancialChart({ title, data, chartType = 'bar', sources, className, onClick, showDetails = false, activeCase }) {
  const maxValue = Math.max(...data.map(item => parseFloat(item.value) || 0))
  const [selectedSource, setSelectedSource] = useState(null)

  const handleSourceClick = (source, event) => {
    event.stopPropagation()
    setSelectedSource(source)
  }

  const handleCloseSourceViewer = () => {
    setSelectedSource(null)
  }

  const renderBarChart = () => (
    <div className="chart-container">
      <div className="bar-chart">
        {data.map((item, index) => {
          const height = maxValue > 0 ? (parseFloat(item.value) / maxValue) * 100 : 0
          return (
            <div key={index} className="bar-item">
              <div className="bar-value">{item.value}</div>
              <div className="bar-container">
                <div 
                  className="bar-fill"
                  style={{ height: `${Math.max(height, 2)}%` }}
                  title={`${item.label}: ${item.value}`}
                />
              </div>
              <div className="bar-label">{item.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderLineChart = () => (
    <div className="chart-container line-chart">
      <div className="line-chart-info">
        <p>Line chart visualization</p>
        {data.map((item, index) => (
          <div key={index} className="line-data-point">
            <span>{item.label}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const renderPieChart = () => (
    <div className="chart-container pie-chart">
      <div className="pie-chart-info">
        <p>Pie chart visualization</p>
        {data.map((item, index) => (
          <div key={index} className="pie-data-point">
            <span className="pie-indicator" style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}></span>
            <span>{item.label}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const renderChart = () => {
    switch (chartType) {
      case 'line': return renderLineChart()
      case 'pie': return renderPieChart()
      case 'bar':
      default: return renderBarChart()
    }
  }

  const isExpanded = className && className.includes('expanded-component')
  const shouldShowDetails = showDetails || isExpanded

  return (
    <div className={`${className} financial-chart-component`} onClick={onClick}>
      {title && <h3>{title}</h3>}
      {renderChart()}
      
      {shouldShowDetails && sources && sources.length > 0 && (
        <div className="financial-chart-sources">
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

export default FinancialChart