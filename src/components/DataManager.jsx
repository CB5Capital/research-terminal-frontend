import { useState, useEffect } from 'react'
import backendService from '../services/backendService'
import './DataManager.css'

function DataManager({ isOpen, onClose, cases, initialCaseId = null }) {
  const [selectedCaseId, setSelectedCaseId] = useState(initialCaseId)
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false)
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(-1)
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const [uploadStep, setUploadStep] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [noteInput, setNoteInput] = useState('')

  useEffect(() => {
    if (isOpen && !selectedCaseId && cases.length > 0) {
      setSelectedCaseId(cases[0].id)
    }
  }, [isOpen, selectedCaseId, cases])



  const handleProjectSelect = (caseItem) => {
    setSelectedCaseId(caseItem.id)
    setUploadMessage('')
    setIsProjectDropdownOpen(false)
    setSelectedProjectIndex(-1)
  }

  const toggleProjectDropdown = () => {
    setIsProjectDropdownOpen(!isProjectDropdownOpen)
    if (!isProjectDropdownOpen) {
      // When opening, highlight current selection
      const activeIndex = cases.findIndex(c => c.id === selectedCaseId)
      setSelectedProjectIndex(activeIndex >= 0 ? activeIndex : 0)
    } else {
      setSelectedProjectIndex(-1)
    }
  }

  const handleFileUpload = async (event) => {
    const files = event.target.files
    if (!files || files.length === 0 || !selectedCaseId) return

    setIsUploading(true)
    setUploadMessage('')
    setUploadStep('Uploading files...')

    try {
      const uploadPromises = Array.from(files).map(file => 
        backendService.uploadFile(selectedCaseId, file)
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
    if (!urlInput.trim() || !selectedCaseId) return

    setIsUploading(true)
    setUploadMessage('')
    setUploadStep('Scraping webpage...')

    try {
      console.log('Starting URL scrape for:', urlInput.trim())
      setUploadStep('Generating dashboard items...')
      const result = await backendService.uploadUrl(selectedCaseId, urlInput.trim())
      console.log('Scrape result:', result)
      
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
      
      // Clear input
      setUrlInput('')
      
    } catch (err) {
      console.error('URL scrape error:', err)
      setUploadMessage(`❌ Failed to scrape URL: ${err.message}`)
    } finally {
      setIsUploading(false)
      setUploadStep('')
    }
  }

  const handleNoteInsert = async () => {
    if (!noteInput.trim() || !selectedCaseId) return

    setIsUploading(true)
    setUploadMessage('')
    setUploadStep('Inserting note...')

    try {
      setUploadStep('Generating dashboard items...')
      const result = await backendService.insertNote(selectedCaseId, noteInput.trim())
      
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
      
      // Clear input
      setNoteInput('')
      
    } catch (err) {
      setUploadMessage(`❌ Failed to insert note: ${err.message}`)
    } finally {
      setIsUploading(false)
      setUploadStep('')
    }
  }



  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Keyboard navigation for project dropdown
  useEffect(() => {
    if (!isProjectDropdownOpen) return

    const handleProjectKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedProjectIndex(prev => 
            prev < cases.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedProjectIndex(prev => prev > 0 ? prev - 1 : 0)
          break
        case 'Enter':
          event.preventDefault()
          if (selectedProjectIndex >= 0 && selectedProjectIndex < cases.length) {
            handleProjectSelect(cases[selectedProjectIndex])
          }
          break
        case 'Escape':
          event.preventDefault()
          setIsProjectDropdownOpen(false)
          break
      }
    }

    document.addEventListener('keydown', handleProjectKeyDown)
    return () => document.removeEventListener('keydown', handleProjectKeyDown)
  }, [isProjectDropdownOpen, selectedProjectIndex, cases])

  if (!isOpen) return null

  const selectedCase = cases.find(c => c.id === selectedCaseId)

  return (
    <div className="data-manager-overlay" onClick={handleOverlayClick}>
      <div className="data-manager-popup">
        <div className="data-manager-header">
          <h2>Data Manager</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        <div className="data-manager-content">
          <div className="case-selector-section">
            <label htmlFor="project-select">Project:</label>
            <div className="project-selector">
              <button 
                className="project-selector-trigger"
                onClick={toggleProjectDropdown}
                id="project-select"
              >
                <span className="project-selector-text">
                  {selectedCase ? `${selectedCase.id} - ${selectedCase.name}` : 'Select Project'}
                </span>
                <span className={`project-selector-arrow ${isProjectDropdownOpen ? 'open' : ''}`}>
                  ▼
                </span>
              </button>
              
              {isProjectDropdownOpen && (
                <>
                  <div className="project-dropdown">
                    <div className="dropdown-content">
                      {cases.map((caseItem, index) => (
                        <div
                          key={caseItem.id}
                          className={`project-item ${
                            selectedProjectIndex === index ? 'highlighted' : ''
                          } ${
                            selectedCaseId === caseItem.id ? 'active' : ''
                          }`}
                          onClick={() => handleProjectSelect(caseItem)}
                          onMouseEnter={() => setSelectedProjectIndex(index)}
                        >
                          <span className="project-item-id">{caseItem.id} - {caseItem.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div 
                    className="dropdown-overlay" 
                    onClick={() => setIsProjectDropdownOpen(false)} 
                  />
                </>
              )}
            </div>
          </div>

          {/* Upload Section */}
          <div className="upload-section">
            <div className="upload-header">
              <h3>Upload Content to DataLib/{selectedCaseId}/</h3>
            </div>

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

            {/* File Upload */}
            <div className="upload-method">
              <div className="method-header">
                <h4>📁 Upload Files</h4>
                <p>Upload documents, PDFs, images, or any file type</p>
              </div>
              <div className="file-upload-container">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileUpload}
                  disabled={isUploading || !selectedCaseId}
                  className="file-input"
                />
                <label htmlFor="file-upload" className={`file-upload-button ${isUploading ? 'uploading' : ''}`}>
                  {isUploading ? 'Processing...' : 'Choose Files'}
                </label>
              </div>
            </div>

            {/* URL Upload */}
            <div className="upload-method">
              <div className="method-header">
                <h4>🌐 Scrape URL</h4>
                <p>Extract text content from a webpage and save as a file</p>
              </div>
              <div className="url-upload-container">
                <input
                  type="url"
                  placeholder="https://example.com/article"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={isUploading || !selectedCaseId}
                  className="url-input"
                />
                <button
                  onClick={handleUrlUpload}
                  disabled={isUploading || !selectedCaseId || !urlInput.trim()}
                  className="upload-button"
                >
                  {isUploading ? 'Processing...' : 'Scrape URL'}
                </button>
              </div>
            </div>

            {/* Note Insert */}
            <div className="upload-method">
              <div className="method-header">
                <h4>📝 Insert Note</h4>
                <p>Add a timestamped note to the project</p>
              </div>
              <div className="note-upload-container">
                <textarea
                  placeholder="Enter your note here..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  disabled={isUploading || !selectedCaseId}
                  className="note-input"
                  rows={6}
                />
                <button
                  onClick={handleNoteInsert}
                  disabled={isUploading || !selectedCaseId || !noteInput.trim()}
                  className="upload-button"
                >
                  {isUploading ? 'Processing...' : 'Insert Note'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default DataManager