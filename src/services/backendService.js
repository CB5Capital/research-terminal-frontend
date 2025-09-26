/**
 * Backend API Service for CB5 Capital Research Terminal
 * Connects React frontend to FastAPI backend with LangChain knowledge base
 */

class BackendService {
  constructor() {
    console.log('Environment VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
    // Hardcoded for now to test
    this.baseUrl = 'https://research-terminal-backend.onrender.com'
    this.apiUrl = `${this.baseUrl}/api`
    console.log('BackendService initialized with baseUrl:', this.baseUrl)
    console.log('BackendService apiUrl:', this.apiUrl)
  }

  async generateDashboard(query, caseInfo) {
    try {
      console.log('Sending dashboard generation request to backend...')
      
      const response = await fetch(`${this.apiUrl}/dashboard/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          case_id: caseInfo.id,
          case_info: {
            id: caseInfo.id,
            name: caseInfo.name,
            sector: caseInfo.sector,
            stage: caseInfo.stage,
            funding_amount: caseInfo.fundingAmount,
            analyst: caseInfo.analyst,
            last_updated: caseInfo.lastUpdated,
            priority: caseInfo.priority
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Backend API error: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error_message || 'Dashboard generation failed')
      }

      console.log('Dashboard generated successfully:', data)
      return {
        dashboard: data.dashboard,
        knowledgeSources: data.knowledge_sources,
        confidence: data.confidence_score
      }

    } catch (error) {
      console.error('Backend service error:', error)
      throw new Error(`Failed to generate dashboard: ${error.message}`)
    }
  }

  async getKnowledgeStatus(caseId) {
    try {
      const response = await fetch(`${this.apiUrl}/cases/${caseId}/knowledge-status`)
      
      if (!response.ok) {
        throw new Error(`Failed to get knowledge status: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Failed to get knowledge status:', error)
      return {
        case_id: caseId,
        total_documents: 0,
        total_chunks: 0,
        file_types: [],
        is_ready: false
      }
    }
  }

  async uploadFiles(caseId, files) {
    try {
      const formData = new FormData()
      
      for (const file of files) {
        formData.append('files', file)
      }

      const response = await fetch(`${this.apiUrl}/cases/${caseId}/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`File upload failed: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('File upload error:', error)
      throw error
    }
  }

  async reindexCase(caseId) {
    try {
      const response = await fetch(`${this.apiUrl}/cases/${caseId}/reindex`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error(`Reindex failed: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Reindex error:', error)
      throw error
    }
  }

  async getKnowledgeBaseStats() {
    try {
      const response = await fetch(`${this.apiUrl}/knowledge-base/stats`)
      
      if (!response.ok) {
        throw new Error(`Failed to get stats: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Failed to get knowledge base stats:', error)
      return {
        total_cases: 0,
        total_documents: 0,
        total_chunks: 0,
        status: 'error'
      }
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      
      if (!response.ok) {
        return { status: 'error', message: `HTTP ${response.status}` }
      }

      return await response.json()

    } catch (error) {
      console.error('Health check failed:', error)
      return { 
        status: 'error', 
        message: 'Backend unavailable',
        details: error.message 
      }
    }
  }

  // Check if backend is available
  async isBackendAvailable() {
    try {
      const health = await this.healthCheck()
      return health.status === 'healthy'
    } catch (error) {
      return false
    }
  }

  // Query History Methods - Updated for QueryLib
  async getQueryHistory(caseName, limit = null) {
    try {
      const response = await fetch(`${this.apiUrl}/cases/${caseName}/queries`)
      
      if (!response.ok) {
        throw new Error(`Failed to get query history: ${response.status}`)
      }

      const data = await response.json()
      
      // Apply limit if specified
      if (limit && data.queries) {
        data.queries = data.queries.slice(0, limit)
      }
      
      return data

    } catch (error) {
      console.error('Failed to get query history:', error)
      return {
        case_name: caseName,
        queries: [],
        total_count: 0
      }
    }
  }

  async getDashboardById(caseName, dashboardId) {
    try {
      const response = await fetch(`${this.apiUrl}/cases/${caseName}/queries/${dashboardId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to get dashboard: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Failed to get dashboard by ID:', error)
      return null
    }
  }

  // Legacy method - redirects to getDashboardById
  async getQueryById(caseName, dashboardId) {
    return this.getDashboardById(caseName, dashboardId)
  }

  async getRecentQueries(caseId, limit = 10) {
    try {
      const response = await fetch(`${this.apiUrl}/cases/${caseId}/queries/recent?limit=${limit}`)
      
      if (!response.ok) {
        throw new Error(`Failed to get recent queries: ${response.status}`)
      }

      const data = await response.json()
      return data.queries || []

    } catch (error) {
      console.error('Failed to get recent queries:', error)
      return []
    }
  }

  async searchQueries(caseId, searchTerm) {
    try {
      const response = await fetch(`${this.apiUrl}/cases/${caseId}/queries/search?q=${encodeURIComponent(searchTerm)}`)
      
      if (!response.ok) {
        throw new Error(`Failed to search queries: ${response.status}`)
      }

      const data = await response.json()
      return data.queries || []

    } catch (error) {
      console.error('Failed to search queries:', error)
      return []
    }
  }

  async deleteQuery(caseId, queryId) {
    try {
      const response = await fetch(`${this.apiUrl}/cases/${caseId}/queries/${queryId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete query: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Failed to delete query:', error)
      throw error
    }
  }


  async getQueryHistoryStats() {
    try {
      const response = await fetch(`${this.apiUrl}/query-history/stats`)
      
      if (!response.ok) {
        throw new Error(`Failed to get query stats: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Failed to get query history stats:', error)
      return {
        total_cases: 0,
        total_queries: 0,
        cases: {}
      }
    }
  }

  async getCaseFiles(caseId) {
    try {
      const response = await fetch(`${this.apiUrl}/cases/${caseId}/files`)
      
      if (!response.ok) {
        throw new Error(`Failed to get case files: ${response.status}`)
      }

      const data = await response.json()
      return data.files || []

    } catch (error) {
      console.error('Failed to get case files:', error)
      return []
    }
  }

  async getCaseFilesByCaseName(caseName) {
    try {
      const response = await fetch(`${this.apiUrl}/cases/${caseName}/files`)
      
      if (!response.ok) {
        throw new Error(`Failed to get case files: ${response.status}`)
      }

      const data = await response.json()
      return data.files || []

    } catch (error) {
      console.error('Failed to get case files:', error)
      return []
    }
  }

  async getSourceContent(caseName, filename) {
    try {
      const response = await fetch(`${this.apiUrl}/cases/${caseName}/sources/${encodeURIComponent(filename)}`)
      
      if (!response.ok) {
        throw new Error(`Failed to get source content: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Failed to get source content:', error)
      throw error
    }
  }

  async analyzeFileForDashboard(caseId, filename) {
    try {
      const response = await fetch(`${this.apiUrl}/cases/${caseId}/files/${encodeURIComponent(filename)}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to analyze file: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Failed to analyze file:', error)
      throw error
    }
  }

  async generateDashboardFromFile(caseName, filename) {
    try {
      const response = await fetch(`${this.apiUrl}/cases/${caseName}/files/${encodeURIComponent(filename)}/generate-dashboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to generate dashboard: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Failed to generate dashboard from file:', error)
      throw error
    }
  }

  async generateDashboardFromQuery(caseName, query) {
    try {
      const response = await fetch(`${this.apiUrl}/cases/${caseName}/generate-dashboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to generate dashboard from query: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Failed to generate dashboard from query:', error)
      throw error
    }
  }

  async getAllCases() {
    try {
      const response = await fetch(`${this.apiUrl}/cases`)
      
      if (!response.ok) {
        throw new Error(`Failed to get cases: ${response.status}`)
      }

      const data = await response.json()
      
      // Transform the response to match the expected frontend format
      const cases = data.cases.map(caseData => ({
        id: caseData.project_id,
        name: caseData.project_name,
        // Add any additional fields if needed
        createdAt: caseData.created_at,
        modifiedAt: caseData.modified_at
      }))
      
      return {
        cases: cases,
        total_count: data.total_count
      }

    } catch (error) {
      console.error('Failed to get all cases:', error)
      return {
        cases: [],
        total_count: 0
      }
    }
  }

  async optimizeDashboardItems(caseName) {
    try {
      const response = await fetch(`${this.apiUrl}/cases/${caseName}/optimize-dashboard-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to optimize dashboard items: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Failed to optimize dashboard items:', error)
      throw error
    }
  }

  async getSettings() {
    try {
      const response = await fetch(`${this.apiUrl}/settings`)
      
      if (!response.ok) {
        throw new Error(`Failed to get settings: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Failed to get settings:', error)
      return {
        success: false,
        settings: {
          current_project: null,
          theme: "dark"
        }
      }
    }
  }

  async updateSettings(settings) {
    try {
      const response = await fetch(`${this.apiUrl}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update settings: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Failed to update settings:', error)
      throw error
    }
  }

  // Upload methods
  async uploadFile(caseName, file) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch(`${this.apiUrl}/cases/${caseName}/upload/file`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Failed to upload file:', error)
      throw error
    }
  }

  async uploadUrl(caseName, url) {
    try {
      const response = await fetch(`${this.apiUrl}/cases/${caseName}/upload/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to upload URL: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Failed to upload URL:', error)
      throw error
    }
  }

  async insertNote(caseName, content) {
    try {
      const response = await fetch(`${this.apiUrl}/cases/${caseName}/upload/note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to insert note: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Failed to insert note:', error)
      throw error
    }
  }

  async continueChat(caseName, message, conversationHistory = [], dashboardId = null) {
    try {
      const response = await fetch(`${this.apiUrl}/cases/${caseName}/chat/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message, 
          conversation_history: conversationHistory,
          dashboard_id: dashboardId
        })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to continue chat: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Failed to continue chat:', error)
      throw error
    }
  }

  // Research Questions methods
  async getResearchQuestions(caseName) {
    try {
      const response = await fetch(`${this.apiUrl}/cases/${caseName}/research-questions`)
      
      if (!response.ok) {
        throw new Error(`Failed to get research questions: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Failed to get research questions:', error)
      return { research_questions: [] }
    }
  }

  async updateResearchQuestions(caseName, questions) {
    try {
      const response = await fetch(`${this.apiUrl}/cases/${caseName}/research-questions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ research_questions: questions })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update research questions: ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Failed to update research questions:', error)
      throw error
    }
  }

  // Project creation method
  async createNewProject(projectData) {
    try {
      const response = await fetch(`${this.apiUrl}/projects/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData)
      })
      
      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to create project: ${response.status} - ${errorData}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  }
}

export default new BackendService()