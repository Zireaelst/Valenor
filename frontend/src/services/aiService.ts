// AI Service for proposal analysis
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000'

export interface AIAnalysisRequest {
  text: string
}

export interface AIAnalysisResponse {
  score: 'low' | 'medium' | 'high'
  confidence: number
  reasoning: string
}

export class AIService {
  private baseUrl: string

  constructor(baseUrl: string = AI_SERVICE_URL) {
    this.baseUrl = baseUrl
  }

  async analyzeProposal(text: string): Promise<AIAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze_proposal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('AI analysis error:', error)
      throw error
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      return response.ok
    } catch (error) {
      console.error('AI service health check failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const aiService = new AIService()
