import { useState, useEffect } from 'react'
import backendService from '../services/backendService'
import './ResearchQuestions.css'

function ResearchQuestions({ isOpen, onClose, activeCase }) {
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingIndex, setEditingIndex] = useState(-1)
  const [editingType, setEditingType] = useState('') // 'question' or 'notes'
  const [newQuestion, setNewQuestion] = useState('')
  const [newNotes, setNewNotes] = useState('')
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

  const startEdit = (index, type = 'question') => {
    setEditingIndex(index)
    setEditingType(type)
    
    const questionObj = questions[index]
    if (typeof questionObj === 'string') {
      // Handle legacy format
      setNewQuestion(questionObj)
      setNewNotes('')
    } else {
      // Handle new format
      setNewQuestion(questionObj.question || '')
      setNewNotes(questionObj.notes || '')
    }
    
    setIsEditing(true)
  }

  const startAdd = () => {
    setEditingIndex(-1)
    setEditingType('question')
    setNewQuestion('')
    setNewNotes('')
    setIsEditing(true)
  }

  const saveEdit = () => {
    if (editingType === 'question' && !newQuestion.trim()) return

    const updatedQuestions = [...questions]
    
    if (editingIndex === -1) {
      // Adding new question
      const newQuestionObj = {
        id: `q${Date.now()}`,
        question: newQuestion.trim(),
        notes: newNotes.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      updatedQuestions.push(newQuestionObj)
    } else {
      // Editing existing question or notes
      const existingQuestion = updatedQuestions[editingIndex]
      
      if (typeof existingQuestion === 'string') {
        // Convert legacy format to new format
        updatedQuestions[editingIndex] = {
          id: `q${Date.now()}`,
          question: editingType === 'question' ? newQuestion.trim() : existingQuestion,
          notes: editingType === 'notes' ? newNotes.trim() : '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      } else {
        // Update existing question object
        updatedQuestions[editingIndex] = {
          ...existingQuestion,
          question: editingType === 'question' ? newQuestion.trim() : existingQuestion.question,
          notes: editingType === 'notes' ? newNotes.trim() : existingQuestion.notes,
          updated_at: new Date().toISOString()
        }
      }
    }
    
    setQuestions(updatedQuestions)
    cancelEdit()
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditingIndex(-1)
    setEditingType('')
    setNewQuestion('')
    setNewNotes('')
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
                    {questions.map((questionObj, index) => {
                      const isLegacyFormat = typeof questionObj === 'string'
                      const question = isLegacyFormat ? questionObj : questionObj.question
                      const notes = isLegacyFormat ? '' : (questionObj.notes || '')
                      const updatedAt = isLegacyFormat ? null : questionObj.updated_at

                      return (
                        <div key={index} className="question-item">
                          <div className="question-number">{index + 1}.</div>
                          <div className="question-content">
                            <div className="question-text">
                              <h4>{question}</h4>
                              {updatedAt && (
                                <div className="question-meta">
                                  Last updated: {new Date(updatedAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            
                            <div className="question-notes">
                              <div className="notes-header">
                                <span className="notes-label">Research Notes:</span>
                                <button 
                                  className="edit-notes-btn"
                                  onClick={() => startEdit(index, 'notes')}
                                  disabled={isEditing}
                                  title="Edit notes/answer"
                                >
                                  {notes ? 'Edit Notes' : 'Add Notes'}
                                </button>
                              </div>
                              {notes ? (
                                <div className="notes-content">
                                  <p>{notes}</p>
                                </div>
                              ) : (
                                <div className="notes-empty">
                                  <em>No research notes yet. Click "Add Notes" to document your findings.</em>
                                </div>
                              )}
                            </div>

                            <div className="question-actions">
                              <button 
                                className="edit-btn"
                                onClick={() => startEdit(index, 'question')}
                                disabled={isEditing}
                              >
                                Edit Question
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
                      )
                    })}
                    
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
                  <h4>
                    {editingIndex === -1 
                      ? 'Add New Question' 
                      : editingType === 'question' 
                        ? 'Edit Question' 
                        : 'Edit Research Notes'
                    }
                  </h4>
                  
                  {(editingIndex === -1 || editingType === 'question') && (
                    <div className="form-field">
                      <label>Question:</label>
                      <textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        placeholder="Enter your research question here..."
                        className="question-textarea"
                        autoFocus={editingType === 'question' || editingIndex === -1}
                        rows={3}
                      />
                    </div>
                  )}
                  
                  {(editingIndex === -1 || editingType === 'notes') && (
                    <div className="form-field">
                      <label>Research Notes / Answer:</label>
                      <textarea
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        placeholder="Document your research findings, answers, insights, and conclusions here..."
                        className="notes-textarea"
                        autoFocus={editingType === 'notes' && editingIndex !== -1}
                        rows={6}
                      />
                    </div>
                  )}
                  
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