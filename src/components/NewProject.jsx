import { useState, useEffect } from 'react'
import backendService from '../services/backendService'
import './NewProject.css'

function NewProject({ isOpen, onClose, onProjectCreated }) {
  const [projectName, setProjectName] = useState('')
  const [projectId, setProjectId] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isOpen) {
      setProjectName('')
      setProjectId('')
      setError('')
      setSuccess('')
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Auto-generate project ID from name
  useEffect(() => {
    if (projectName) {
      const id = generateProjectId(projectName)
      setProjectId(id)
    } else {
      setProjectId('')
    }
  }, [projectName])

  const generateProjectId = (name) => {
    // Generate a simple ID from the project name
    // Remove special characters, convert to uppercase, take first few letters + number
    const cleanName = name.replace(/[^a-zA-Z0-9\s]/g, '').trim()
    if (!cleanName) return ''
    
    const words = cleanName.split(/\s+/)
    const initials = words.map(word => word.charAt(0).toUpperCase()).join('')
    
    // Add a random number to make it more unique
    const randomNum = Math.floor(Math.random() * 99) + 1
    
    return `${initials}${randomNum}`
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (!isCreating) {
        onClose()
      }
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleCreateProject()
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isCreating) {
      onClose()
    }
  }

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      setError('Project name is required')
      return
    }

    if (!projectId.trim()) {
      setError('Project ID is required')
      return
    }

    // Validate project ID format
    if (!/^[A-Z0-9]+$/.test(projectId)) {
      setError('Project ID must contain only uppercase letters and numbers')
      return
    }

    setIsCreating(true)
    setError('')
    setSuccess('')

    try {
      const result = await backendService.createNewProject({
        project_id: projectId,
        project_name: projectName.trim()
      })

      setSuccess(`✅ Project "${projectName}" created successfully!`)
      
      // Wait a moment to show success message
      setTimeout(() => {
        onProjectCreated(result.project)
        onClose()
      }, 1500)

    } catch (error) {
      console.error('Failed to create project:', error)
      setError(`❌ Failed to create project: ${error.message}`)
    } finally {
      setIsCreating(false)
    }
  }

  const handleProjectIdChange = (e) => {
    // Force uppercase and remove invalid characters
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    setProjectId(value)
  }

  if (!isOpen) return null

  return (
    <div className="new-project-overlay" onClick={handleOverlayClick}>
      <div className="new-project-popup">
        <div className="new-project-header">
          <h2>Create New Project</h2>
          <button className="close-button" onClick={onClose} disabled={isCreating}>
            ✕
          </button>
        </div>
        
        <div className="new-project-content">
          <div className="project-form">
            <div className="form-field">
              <label htmlFor="project-name">Project Name:</label>
              <input
                id="project-name"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name (e.g., 'AI in Healthcare')"
                className="project-input"
                disabled={isCreating}
                autoFocus
              />
              <div className="field-help">
                A descriptive name for your research project
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="project-id">Project ID:</label>
              <input
                id="project-id"
                type="text"
                value={projectId}
                onChange={handleProjectIdChange}
                placeholder="AUTO-GENERATED"
                className="project-input project-id-input"
                disabled={isCreating}
                maxLength="10"
              />
              <div className="field-help">
                Unique identifier (uppercase letters and numbers only, auto-generated from name)
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                {success}
              </div>
            )}

            <div className="project-structure-info">
              <h4>This will create:</h4>
              <ul>
                <li>📁 <strong>ProjectLib/{projectId}.json</strong> - Project metadata and research questions</li>
                <li>📁 <strong>DataLib/{projectId}/</strong> - Data storage directory</li>
                <li>📁 <strong>QueryLib/{projectId}/</strong> - Dashboard and query history</li>
                <li>📁 <strong>DashboardLib/{projectId}/</strong> - Dashboard items and templates</li>
              </ul>
            </div>

            <div className="form-actions">
              <button 
                className="create-button"
                onClick={handleCreateProject}
                disabled={!projectName.trim() || !projectId.trim() || isCreating}
              >
                {isCreating ? 'Creating Project...' : 'Create Project'}
              </button>
              <button 
                className="cancel-button"
                onClick={onClose}
                disabled={isCreating}
              >
                Cancel
              </button>
            </div>

            <div className="form-help">
              <small>Press Ctrl+Enter to create project, Escape to cancel</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewProject