import { useState, useEffect } from 'react'
import backendService from '../services/backendService'
import './DataManagerBar.css'

function DataManagerBar({ activeCase, cases, onClose }) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const [uploadStep, setUploadStep] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [noteInput, setNoteInput] = useState('')
  const [activeTab, setActiveTab] = useState('files')

  const handleFileUpload = async (event) => {
    const files = event.target.files
    if (!files || files.length === 0 || !activeCase) return

    setIsUploading(true)
    setUploadMessage('')
    setUploadStep('Uploading files...')

    try {
      const uploadPromises = Array.from(files).map(file => 
        backendService.uploadFile(activeCase.id, file)
      )
      
      setUploadStep('Generating dashboard items...')
      const results = await Promise.all(uploadPromises)
      
      // Count successful dashboard generations
      let totalDashboardItems = 0
      let failedGenerations = 0
      
      results.forEach(result => {
        if (result.dashboard_generation) {
          if (result.dashboard_generation.success) {
            totalDashboardItems += result.dashboard_generation.items_created || 0
          } else {
            failedGenerations++
          }
        }
      })
      
      let message = `✅ Successfully uploaded ${files.length} file(s)`
      if (totalDashboardItems > 0) {
        message += ` and generated ${totalDashboardItems} dashboard items`
      }
      if (failedGenerations > 0) {
        message += ` (${failedGenerations} dashboard generation(s) failed)`
      }
      message += '!'
      
      setUploadMessage(message)
      
      // Clear input
      event.target.value = ''
      
    } catch (err) {
      setUploadMessage(`❌ Failed to upload files: ${err.message}`)
    } finally {
      setIsUploading(false)
      setUploadStep('')
    }
  }

  const handleUrlUpload = async () => {
    if (!urlInput.trim() || !activeCase) return

    setIsUploading(true)
    setUploadMessage('')
    setUploadStep('Scraping webpage...')

    try {
      setUploadStep('Generating dashboard items...')
      const result = await backendService.uploadUrl(activeCase.id, urlInput.trim())
      
      let message = `✅ Successfully scraped webpage content! (${result.filename})`
      if (result.dashboard_generation) {
        if (result.dashboard_generation.success) {
          const itemsCreated = result.dashboard_generation.items_created || 0
          message += ` Generated ${itemsCreated} dashboard items.`
        } else {
          message += ` Dashboard generation failed.`
        }
      }
      
      setUploadMessage(message)
      setUrlInput('')
    } catch (err) {
      setUploadMessage(`❌ Failed to scrape URL: ${err.message}`)
    } finally {
      setIsUploading(false)
      setUploadStep('')
    }
  }

  const handleNoteInsert = async () => {
    if (!noteInput.trim() || !activeCase) return

    setIsUploading(true)
    setUploadMessage('')
    setUploadStep('Inserting note...')

    try {
      setUploadStep('Generating dashboard items...')
      const result = await backendService.insertNote(activeCase.id, noteInput.trim())
      
      let message = '✅ Successfully inserted note!'
      if (result.dashboard_generation) {
        if (result.dashboard_generation.success) {
          const itemsCreated = result.dashboard_generation.items_created || 0
          message += ` Generated ${itemsCreated} dashboard items.`
        } else {
          message += ` Dashboard generation failed.`
        }
      }
      
      setUploadMessage(message)
      setNoteInput('')
    } catch (err) {
      setUploadMessage(`❌ Failed to insert note: ${err.message}`)
    } finally {
      setIsUploading(false)
      setUploadStep('')
    }
  }

  if (!activeCase) {
    return (
      <div className="data-manager-bar">
        <div className="bar-header">
          <h3>Data Manager</h3>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        <div className="bar-empty">
          <p>No active case selected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="data-manager-bar">
      <div className="bar-header">
        <h3>Data Manager</h3>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>

      <div className="project-info">
        <div className="project-name">{activeCase.id} - {activeCase.name}</div>
        <div className="project-path">DataLib/{activeCase.id}/</div>
      </div>

      <div className="bar-tabs">
        <button 
          className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          📁 Files
        </button>
        <button 
          className={`tab-button ${activeTab === 'url' ? 'active' : ''}`}
          onClick={() => setActiveTab('url')}
        >
          🌐 URL
        </button>
        <button 
          className={`tab-button ${activeTab === 'note' ? 'active' : ''}`}
          onClick={() => setActiveTab('note')}
        >
          📝 Note
        </button>
      </div>

      <div className="bar-content">
        {uploadStep && isUploading && (
          <div className="upload-step">
            {uploadStep}
          </div>
        )}
        {uploadMessage && (
          <div className={`upload-message ${uploadMessage.startsWith('✅') ? 'success' : 'error'}`}>
            {uploadMessage}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="upload-section">
            <h4>Upload Files</h4>
            <p>Upload documents, PDFs, images, or any file type</p>
            <div className="file-upload-container">
              <input
                type="file"
                id="bar-file-upload"
                multiple
                onChange={handleFileUpload}
                disabled={isUploading}
                className="file-input"
              />
              <label htmlFor="bar-file-upload" className={`file-upload-button ${isUploading ? 'uploading' : ''}`}>
                {isUploading ? 'Processing...' : 'Choose Files'}
              </label>
            </div>
          </div>
        )}

        {activeTab === 'url' && (
          <div className="upload-section">
            <h4>Scrape URL</h4>
            <p>Extract text content from a webpage</p>
            <div className="url-upload-container">
              <input
                type="url"
                placeholder="https://example.com/article"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={isUploading}
                className="url-input"
              />
              <button
                onClick={handleUrlUpload}
                disabled={isUploading || !urlInput.trim()}
                className="upload-button"
              >
                {isUploading ? 'Processing...' : 'Scrape'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'note' && (
          <div className="upload-section">
            <h4>Insert Note</h4>
            <p>Add a timestamped note to the project</p>
            <div className="note-upload-container">
              <textarea
                placeholder="Enter your note here..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                disabled={isUploading}
                className="note-input"
                rows={6}
              />
              <button
                onClick={handleNoteInsert}
                disabled={isUploading || !noteInput.trim()}
                className="upload-button"
              >
                {isUploading ? 'Processing...' : 'Insert Note'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DataManagerBar