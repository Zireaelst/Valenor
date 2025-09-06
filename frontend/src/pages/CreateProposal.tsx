import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, AlertCircle } from 'lucide-react'

export function CreateProposal() {
  const { isConnected } = useAccount()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    recipient: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters'
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required'
    } else {
      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Amount must be a positive number'
      } else if (amount < 0.01) {
        newErrors.amount = 'Minimum amount is 0.01 ETH'
      }
    }

    if (!formData.recipient.trim()) {
      newErrors.recipient = 'Recipient address is required'
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.recipient)) {
      newErrors.recipient = 'Invalid Ethereum address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // In a real app, this would interact with the smart contract
      // For now, we'll simulate the transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('Proposal created successfully!')
      navigate('/proposals')
    } catch (error) {
      console.error('Error creating proposal:', error)
      alert('Failed to create proposal. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 mb-8">
            You need to connect your wallet to create a proposal.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/proposals')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Proposal</h1>
          <p className="text-gray-600 mt-1">
            Submit a new proposal for community funding
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="label">
                Proposal Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`input-field ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter a clear, descriptive title for your proposal"
                maxLength={100}
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="label">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`input-field min-h-[120px] resize-none ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Provide a detailed description of your proposal, including goals, timeline, and expected impact..."
                maxLength={2000}
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                {formData.description.length}/2000 characters
              </p>
            </div>

            {/* Amount */}
            <div>
              <label className="label">
                Funding Amount (ETH) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`input-field ${errors.amount ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-red-600 text-sm mt-1">{errors.amount}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                Minimum amount: 0.01 ETH
              </p>
            </div>

            {/* Recipient */}
            <div>
              <label className="label">
                Recipient Address *
              </label>
              <input
                type="text"
                value={formData.recipient}
                onChange={(e) => handleInputChange('recipient', e.target.value)}
                className={`input-field font-mono ${errors.recipient ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="0x..."
              />
              {errors.recipient && (
                <p className="text-red-600 text-sm mt-1">{errors.recipient}</p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                The address that will receive the funding if the proposal passes
              </p>
            </div>
          </div>
        </div>

        {/* Guidelines */}
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">Proposal Guidelines</h3>
          <ul className="text-blue-800 text-sm space-y-2">
            <li>• Proposals should focus on social impact and community benefit</li>
            <li>• Provide clear goals, timeline, and expected outcomes</li>
            <li>• Include detailed budget breakdown if applicable</li>
            <li>• Be transparent about how funds will be used</li>
            <li>• Proposals will be reviewed by AI for quality scoring</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/proposals')}
            className="btn-secondary flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Create Proposal
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
