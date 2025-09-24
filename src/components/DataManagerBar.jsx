import { useState, useEffect } from 'react'
import backendService from '../services/backendService'
import './DataManagerBar.css'

function DataManagerBar({ activeCase, cases, onClose }) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [noteInput, setNoteInput] = useState('')
  const [activeTab, setActiveTab] = useState('files')

  const handleFileUpload = async (event) => {
    const files = event.target.files
    if (!files || files.length === 0 || !activeCase) return

    setIsUploading(true)
    setUploadMessage('')

    try {
      const uploadPromises = Array.from(files).map(file => 
        backendService.uploadFile(activeCase.id, file)
      )
      
      await Promise.all(uploadPromises)
      setUploadMessage(`✅ Successfully uploaded ${files.length} file(s)!`)
      
      // Clear input
      event.target.value = ''
      
    } catch (err) {
      setUploadMessage(`❌ Failed to upload files: ${err.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlUpload = async () => {
    if (!urlInput.trim() || !activeCase) return

    setIsUploading(true)
    setUploadMessage('')

    try {
      const result = await backendService.uploadUrl(activeCase.id, urlInput.trim())
      setUploadMessage(`✅ Successfully scraped webpage content! (${result.filename})`)
      setUrlInput('')
    } catch (err) {
      setUploadMessage(`❌ Failed to scrape URL: ${err.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleNoteInsert = async () => {
    if (!noteInput.trim() || !activeCase) return

    setIsUploading(true)
    setUploadMessage('')

    try {
      await backendService.insertNote(activeCase.id, noteInput.trim())
      setUploadMessage('✅ Successfully inserted note!')
      setNoteInput('')
    } catch (err) {
      setUploadMessage(`❌ Failed to insert note: ${err.message}`)
    } finally {
      setIsUploading(false)
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
                {isUploading ? 'Uploading...' : 'Choose Files'}
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
                {isUploading ? 'Scraping...' : 'Scrape'}
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
                {isUploading ? 'Inserting...' : 'Insert Note'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DataManagerBar