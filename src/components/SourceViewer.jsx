import { useState, useEffect } from 'react'
import backendService from '../services/backendService'
import './SourceViewer.css'

function SourceViewer({ source, activeCase, onClose }) {
  const [sourceContent, setSourceContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (source && source.filename && activeCase) {
      loadSourceContent()
    }
  }, [source, activeCase])

  const loadSourceContent = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await backendService.getSourceContent(activeCase.id, source.filename)
      setSourceContent(result)
    } catch (err) {
      setError(`Failed to load source: ${err.message}`)
      console.error('Error loading source content:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const highlightSearchTerm = (text) => {
    if (!searchTerm || !text) return text
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark class="search-highlight">$1</mark>')
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const getFileTypeLabel = (fileType) => {
    const typeLabels = {
      'word_document': 'Word Document',
      'text_file': 'Text File',
      'unknown_text': 'Text File',
      'pdf': 'PDF Document'
    }
    return typeLabels[fileType] || 'Unknown'
  }

  return (
    <div className="source-viewer-overlay" onClick={onClose}>
      <div className="source-viewer-container" onClick={(e) => e.stopPropagation()}>
        <div className="source-viewer-header">
          <div className="source-info">
            <div className="source-title">
              <span className="source-icon">📄</span>
              <span className="source-filename">{source.filename}</span>
            </div>
            <div className="source-meta">
              <span className="relevance-badge relevance-{source.relevance?.toLowerCase()}">
                {source.relevance} Relevance
              </span>
              {sourceContent && (
                <span className="file-stats">
                  {formatFileSize(sourceContent.file_size)} • Modified {formatDate(sourceContent.modified_time)} • {getFileTypeLabel(sourceContent.file_type)}
                </span>
              )}
            </div>
          </div>
          <div className="source-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search in document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="source-search"
              />
            </div>
            <button className="close-button" onClick={onClose}>
              <span className="close-icon">×</span>
            </button>
          </div>
        </div>

        <div className="source-viewer-content">
          {loading && (
            <div className="source-loading">
              <div className="loading-spinner">⟳</div>
              <p>Loading source content...</p>
            </div>
          )}

          {error && (
            <div className="source-error">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
              <button onClick={loadSourceContent} className="retry-btn">
                Retry
              </button>
            </div>
          )}

          {sourceContent && !loading && !error && (
            <div className="source-content-wrapper">
              <div className="source-insight-section">
                <h4>Key Insight</h4>
                <p className="source-key-insight">{source.key_insight}</p>
              </div>
              
              <div className="source-full-content">
                <h4>Full Document Content</h4>
                <div 
                  className="source-text-content"
                  dangerouslySetInnerHTML={{
                    __html: highlightSearchTerm(sourceContent.content.replace(/\n/g, '<br>'))
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="source-viewer-footer">
          <div className="navigation-hint">
            <span className="key-hint">ESC</span> to close
            <span className="key-hint">Ctrl+F</span> to search
          </div>
        </div>
      </div>
    </div>
  )
}

export default SourceViewer