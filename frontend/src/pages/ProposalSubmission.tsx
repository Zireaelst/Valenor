import { useState } from 'react'
import { useAccount, useWaitForTransactionReceipt } from 'wagmi'
import { 
  FileText, 
  DollarSign, 
  MapPin, 
  User, 
  Send,
  Brain,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react'
import toast from 'react-hot-toast'
import { 
  useGovernanceContract, 
  useVotingPower,
  useMinVotingPowerToPropose,
  useMinProposalAmount,
  useProjectAvailable,
  formatUSDC, 
  parseUSDC 
} from '../hooks/useContracts'
import { aiService, AIAnalysisResponse } from '../services/aiService'

interface AIAnalysis {
  score: 'low' | 'medium' | 'high'
  confidence: number
  reasoning: string
}

const ProposalSubmission = () => {
  const { address, isConnected } = useAccount()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()

  const { createProposal } = useGovernanceContract()

  // Get user's voting power
  const { data: userVotingPower } = useVotingPower(address)
  
  // Get minimum requirements
  const { data: minVotingPower } = useMinVotingPowerToPropose()
  const { data: minProposalAmount } = useMinProposalAmount()
  
  // Get project available funds for all projects
  const { data: project1Available } = useProjectAvailable(1)
  const { data: project2Available } = useProjectAvailable(2)
  const { data: project3Available } = useProjectAvailable(3)
  const { data: project4Available } = useProjectAvailable(4)

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '1',
    amount: '',
    recipient: '',
    category: 'education',
    timeline: '',
    impact: '',
    budget: ''
  })

  const projectCategories = [
    { id: 'education', name: 'Education', description: 'Educational programs and initiatives' },
    { id: 'healthcare', name: 'Healthcare', description: 'Medical and health-related projects' },
    { id: 'environment', name: 'Environment', description: 'Environmental protection and sustainability' },
    { id: 'social', name: 'Social Impact', description: 'Community and social welfare programs' },
    { id: 'technology', name: 'Technology', description: 'Tech solutions for social good' },
    { id: 'other', name: 'Other', description: 'Other social impact initiatives' }
  ]

  const mockProjects = [
    { id: '1', name: 'Education Initiative', description: 'Supporting local schools' },
    { id: '2', name: 'Healthcare Access', description: 'Medical supplies for communities' },
    { id: '3', name: 'Environmental Cleanup', description: 'Ocean plastic removal' },
    { id: '4', name: 'Food Security', description: 'Community gardens and food banks' },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const analyzeProposal = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Please fill in the title and description before analyzing')
      return
    }

    setIsAnalyzing(true)
    try {
      // Combine title and description for analysis
      const proposalText = `${formData.title}. ${formData.description}`
      
      // Call real AI service
      const analysisResult: AIAnalysisResponse = await aiService.analyzeProposal(proposalText)
      
      // Convert to our interface
      const analysis: AIAnalysis = {
        score: analysisResult.score,
        confidence: analysisResult.confidence,
        reasoning: analysisResult.reasoning
      }
      
      setAiAnalysis(analysis)
      toast.success('AI analysis completed!')
    } catch (error: any) {
      console.error('AI analysis error:', error)
      toast.error(`AI analysis failed: ${error.message || 'Please try again.'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!formData.title || !formData.description || !formData.amount || !formData.recipient) {
      toast.error('Please fill in all required fields')
      return
    }

    // Check voting power
    if (!userVotingPower || userVotingPower < (minVotingPower || 0n)) {
      toast.error(`You need at least ${formatUSDC(minVotingPower || 0n)} USDC in donations to create proposals`)
      return
    }

    // Check minimum proposal amount
    const proposalAmountWei = parseUSDC(formData.amount)
    if (proposalAmountWei < (minProposalAmount || 0n)) {
      toast.error(`Minimum proposal amount is ${formatUSDC(minProposalAmount || 0n)} USDC`)
      return
    }

    // Check if project has enough available funds
    const projectId = parseInt(formData.projectId)
    let projectAvailable: bigint | undefined
    
    switch (projectId) {
      case 1:
        projectAvailable = project1Available as bigint
        break
      case 2:
        projectAvailable = project2Available as bigint
        break
      case 3:
        projectAvailable = project3Available as bigint
        break
      case 4:
        projectAvailable = project4Available as bigint
        break
      default:
        projectAvailable = 0n
    }
    
    if (projectAvailable && projectAvailable < proposalAmountWei) {
      toast.error(`Project only has ${formatUSDC(projectAvailable)} USDC available`)
      return
    }

    setIsSubmitting(true)
    try {
      toast.loading('Creating proposal...', { id: 'proposal' })
      const proposalHash = await createProposal(
        formData.description,
        parseInt(formData.projectId),
        formData.amount,
        formData.recipient as `0x${string}`
      )
      setTxHash(proposalHash)
      toast.success('Proposal submitted successfully!', { id: 'proposal' })
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        projectId: '1',
        amount: '',
        recipient: '',
        category: 'education',
        timeline: '',
        impact: '',
        budget: ''
      })
      setAiAnalysis(null)
    } catch (error: any) {
      console.error('Proposal submission error:', error)
      toast.error(error.message || 'Proposal submission failed. Please try again.', { id: 'proposal' })
    } finally {
      setIsSubmitting(false)
      setTxHash(undefined)
    }
  }

  const getScoreColor = (score: 'low' | 'medium' | 'high') => {
    switch (score) {
      case 'high':
        return 'text-green-600 bg-green-100 border-green-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'low':
        return 'text-red-600 bg-red-100 border-red-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getScoreLabel = (score: 'low' | 'medium' | 'high') => {
    switch (score) {
      case 'high':
        return 'High Impact'
      case 'medium':
        return 'Medium Impact'
      case 'low':
        return 'Low Impact'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Submit Proposal
          </h1>
          <p className="text-gray-600">
            Create a proposal for community funding. Use AI analysis to improve your proposal quality.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Proposal Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Proposal Details
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proposal Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter a clear, descriptive title"
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={6}
                      placeholder="Describe your project in detail. Include objectives, methodology, expected outcomes, and community impact."
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Project
                      </label>
                      <select
                        name="projectId"
                        value={formData.projectId}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        {mockProjects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        {projectCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Funding Details
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Requested Amount (USDC) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="Enter amount in USDC"
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Address *
                    </label>
                    <input
                      type="text"
                      name="recipient"
                      value={formData.recipient}
                      onChange={handleInputChange}
                      placeholder="0x..."
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Breakdown
                    </label>
                    <textarea
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Break down how the funds will be used"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Project Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeline
                    </label>
                    <input
                      type="text"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleInputChange}
                      placeholder="e.g., 6 months, 1 year"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Impact
                    </label>
                    <textarea
                      name="impact"
                      value={formData.impact}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Describe the expected social impact and beneficiaries"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={analyzeProposal}
                  disabled={isAnalyzing}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      <span>AI Analysis</span>
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Proposal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* AI Analysis Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                AI Analysis
              </h3>

              {!aiAnalysis ? (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Get AI-powered feedback on your proposal to improve its chances of approval.
                  </p>
                  <button
                    onClick={analyzeProposal}
                    disabled={isAnalyzing || !formData.title || !formData.description}
                    className="btn-primary w-full"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Proposal'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Score */}
                  <div className="text-center">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold border-2 ${getScoreColor(aiAnalysis.score)}`}>
                      {getScoreLabel(aiAnalysis.score)}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Impact Assessment</p>
                    <p className="text-xs text-gray-500">Confidence: {Math.round(aiAnalysis.confidence * 100)}%</p>
                  </div>

                  {/* Reasoning */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Brain className="w-4 h-4 text-blue-500 mr-2" />
                      Analysis Reasoning
                    </h4>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {aiAnalysis.reasoning}
                    </div>
                  </div>

                  <button
                    onClick={analyzeProposal}
                    disabled={isAnalyzing}
                    className="btn-outline w-full"
                  >
                    Re-analyze
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProposalSubmission
