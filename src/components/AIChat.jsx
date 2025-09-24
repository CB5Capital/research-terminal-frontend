import { useState, useEffect, useRef } from 'react'
import backendService from '../services/backendService'
import SourceViewer from './SourceViewer'
import './AIChat.css'

function AIChat({ dashboardData, activeCase, onQuerySubmit }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSource, setSelectedSource] = useState(null)
  const [dashboardId, setDashboardId] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize with existing conversation history or initial AI response
  useEffect(() => {
    if (dashboardData) {
      // Extract dashboard ID from metadata or generate from timestamp
      const extractedDashboardId = dashboardData.metadata?.dashboard_id || 
                                   dashboardData.dashboard_id ||
                                   null
      setDashboardId(extractedDashboardId)
      
      // Check if there's existing conversation history
      const existingConversation = dashboardData.conversation_history || []
      
      if (existingConversation.length > 0) {
        // Load existing conversation
        setMessages(existingConversation)
      } else {
        // Create initial AI message for new dashboard
        const aiResponse = dashboardData.ai_response || 
                          dashboardData.response || 
                          dashboardData.summary ||
                          `Dashboard generated successfully with ${dashboardData.components?.length || 0} components.`
        
        const sources = dashboardData.sources || 
                       dashboardData.source_files || 
                       []
        
        const initialMessage = {
          id: Date.now(),
          type: 'ai',
          content: aiResponse,
          sources: sources,
          timestamp: new Date().toISOString()
        }
        setMessages([initialMessage])
      }
    }
  }, [dashboardData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || !activeCase || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Call backend for follow-up conversation (not dashboard generation)
      const result = await backendService.continueChat(
        activeCase.id, 
        inputValue.trim(), 
        messages,
        dashboardId
      )
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: result.response,
        sources: result.sources || [],
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        sources: [],
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSourceClick = async (source) => {
    try {
      const content = await backendService.getSourceContent(activeCase.id, source)
      setSelectedSource({
        filename: source,
        content: content.content,
        case_name: activeCase.id
      })
    } catch (error) {
      console.error('Error loading source:', error)
      // Could add error handling here
    }
  }

  const formatSources = (sources) => {
    if (!sources || sources.length === 0) return null
    
    return (
      <div className="message-sources">
        <div className="sources-header">
          <span className="sources-icon">📄</span>
          Sources Referenced:
        </div>
        <div className="sources-grid">
          {sources.map((source, index) => (
            <button
              key={index}
              className="source-chip"
              onClick={() => handleSourceClick(source)}
              title={`Click to view ${source}`}
            >
              <span className="source-icon">📄</span>
              <span className="source-name">{source}</span>
              <span className="source-expand">↗</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="ai-chat">
        <div className="chat-empty">
          <div className="empty-icon">🤖</div>
          <h3>AI Assistant</h3>
          <p>Generate a dashboard to start chatting with the AI about your data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ai-chat">

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-content">
              {message.content}
            </div>
            {message.sources && formatSources(message.sources)}
            <div className="message-time">
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai loading">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <div className="chat-input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a follow-up question..."
            disabled={isLoading}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="chat-send-button"
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </div>
      </form>

      {selectedSource && (
        <SourceViewer
          source={selectedSource}
          onClose={() => setSelectedSource(null)}
        />
      )}
    </div>
  )
}

export default AIChat