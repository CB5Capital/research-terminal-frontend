import { useState, useEffect } from 'react'
import backendService from '../services/backendService'
import './ResearchQuestions.css'

function ResearchQuestions({ isOpen, onClose, activeCase }) {
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingIndex, setEditingIndex] = useState(-1)
  const [newQuestion, setNewQuestion] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    if (isOpen && activeCase) {
      loadQuestions()
    }
  }, [isOpen, activeCase])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (isEditing) {
        cancelEdit()
      } else {
        onClose()
      }
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isEditing) {
      onClose()
    }
  }

  const loadQuestions = async () => {
    if (!activeCase) return
    
    setIsLoading(true)
    try {
      const result = await backendService.getResearchQuestions(activeCase.id)
      setQuestions(result.research_questions || [])
    } catch (error) {
      console.error('Failed to load research questions:', error)
      setQuestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const saveQuestions = async () => {
    if (!activeCase) return
    
    setIsLoading(true)
    setSaveMessage('')
    
    try {
      await backendService.updateResearchQuestions(activeCase.id, questions)
      setSaveMessage('✅ Research questions saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Failed to save research questions:', error)
      setSaveMessage('❌ Failed to save research questions')
      setTimeout(() => setSaveMessage(''), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const startEdit = (index) => {
    setEditingIndex(index)
    setNewQuestion(questions[index])
    setIsEditing(true)
  }

  const startAdd = () => {
    setEditingIndex(-1)
    setNewQuestion('')
    setIsEditing(true)
  }

  const saveEdit = () => {
    if (!newQuestion.trim()) return

    const updatedQuestions = [...questions]
    
    if (editingIndex === -1) {
      // Adding new question
      updatedQuestions.push(newQuestion.trim())
    } else {
      // Editing existing question
      updatedQuestions[editingIndex] = newQuestion.trim()
    }
    
    setQuestions(updatedQuestions)
    cancelEdit()
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditingIndex(-1)
    setNewQuestion('')
  }

  const deleteQuestion = (index) => {
    if (window.confirm('Are you sure you want to delete this research question?')) {
      const updatedQuestions = questions.filter((_, i) => i !== index)
      setQuestions(updatedQuestions)
    }
  }

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  if (!isOpen) return null

  return (
    <div className="research-questions-overlay" onClick={handleOverlayClick}>
      <div className="research-questions-popup">
        <div className="research-questions-header">
          <h2>Research Questions</h2>
          <div className="header-actions">
            {questions.length > 0 && !isEditing && (
              <button 
                className="save-button" 
                onClick={saveQuestions}
                disabled={isLoading}
              >
                Save Changes
              </button>
            )}
            <button className="close-button" onClick={onClose}>✕</button>
          </div>
        </div>
        
        <div className="research-questions-content">
          {!activeCase ? (
            <div className="no-case">
              <p>No active project selected</p>
            </div>
          ) : (
            <>
              <div className="project-info">
                <h3>{activeCase.id} - {activeCase.name}</h3>
              </div>

              {saveMessage && (
                <div className={`save-message ${saveMessage.startsWith('✅') ? 'success' : 'error'}`}>
                  {saveMessage}
                </div>
              )}

              {isLoading && (
                <div className="loading">Loading research questions...</div>
              )}

              <div className="questions-list">
                {questions.length === 0 && !isLoading ? (
                  <div className="no-questions">
                    <p>No research questions defined yet.</p>
                    <button className="add-first-button" onClick={startAdd}>
                      Add First Question
                    </button>
                  </div>
                ) : (
                  <>
                    {questions.map((question, index) => (
                      <div key={index} className="question-item">
                        <div className="question-number">{index + 1}.</div>
                        <div className="question-content">
                          <p>{question}</p>
                          <div className="question-actions">
                            <button 
                              className="edit-btn"
                              onClick={() => startEdit(index)}
                              disabled={isEditing}
                            >
                              Edit
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => deleteQuestion(index)}
                              disabled={isEditing}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {!isEditing && (
                      <button className="add-question-button" onClick={startAdd}>
                        + Add New Question
                      </button>
                    )}
                  </>
                )}
              </div>

              {isEditing && (
                <div className="edit-form">
                  <h4>{editingIndex === -1 ? 'Add New Question' : 'Edit Question'}</h4>
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    placeholder="Enter your research question here..."
                    className="question-textarea"
                    autoFocus
                    rows={4}
                  />
                  <div className="edit-actions">
                    <button className="save-edit-button" onClick={saveEdit}>
                      {editingIndex === -1 ? 'Add Question' : 'Save Changes'}
                    </button>
                    <button className="cancel-button" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                  <div className="edit-help">
                    <small>Press Ctrl+Enter to save, Escape to cancel</small>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResearchQuestions