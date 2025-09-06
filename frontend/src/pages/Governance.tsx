import { useState, useEffect } from 'react'
import { useAccount, useWaitForTransactionReceipt } from 'wagmi'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  Users, 
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useGovernanceContract, formatUSDC } from '../hooks/useContracts'

const Governance = () => {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState('active')
  const [votingOnProposal, setVotingOnProposal] = useState<number | null>(null)
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()

  const { 
    getNextProposalId, 
    getProposal, 
    vote, 
    executeProposal,
    getVotingPower 
  } = useGovernanceContract()

  // Get next proposal ID to know how many proposals exist
  const { data: nextProposalId } = getNextProposalId()
  
  // Get user's voting power
  const { data: userVotingPower } = getVotingPower(address || '0x0')
  
  // Type-safe data extraction with fallbacks
  const safeUserVotingPower = (userVotingPower as bigint) || 0n

  // Wait for transaction receipt
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Use transaction status for UI feedback
  useEffect(() => {
    if (isConfirmed) {
      toast.success('Transaction confirmed!')
    }
  }, [isConfirmed])

  // Fetch all proposals
  const [proposals, setProposals] = useState<any[]>([])
  
  useEffect(() => {
    const fetchProposals = async () => {
      if (!nextProposalId) return
      
      const proposalPromises = []
      for (let i = 0; i < Number(nextProposalId); i++) {
        proposalPromises.push(getProposal(i))
      }
      
      try {
        const proposalResults = await Promise.all(proposalPromises)
        const formattedProposals = proposalResults.map((result, index) => {
          if (!result.data) return null
          
          // Type-safe destructuring with fallbacks
          const proposalData = result.data as any[]
          const [description, targetProjectId, amount, recipient, votesFor, votesAgainst, deadline, executed, proposer, createdAt] = proposalData || []
          
          const now = Math.floor(Date.now() / 1000)
          const isActive = now <= Number(deadline) && !executed
          const isPassed = !isActive && !executed && Number(votesFor) > Number(votesAgainst)
          const isRejected = !isActive && !executed && Number(votesFor) <= Number(votesAgainst)
          
          let status = 'active'
          if (executed) status = 'executed'
          else if (isPassed) status = 'passed'
          else if (isRejected) status = 'rejected'
          
          return {
            id: index,
            title: description.length > 50 ? description.substring(0, 50) + '...' : description,
            description,
            proposer,
            targetProjectId: Number(targetProjectId),
            amount: formatUSDC(amount),
            recipient,
            votesFor: formatUSDC(votesFor),
            votesAgainst: formatUSDC(votesAgainst),
            deadline: new Date(Number(deadline) * 1000).toISOString().split('T')[0],
            status,
            executed,
            createdAt: new Date(Number(createdAt) * 1000).toISOString().split('T')[0]
          }
        }).filter(Boolean)
        
        setProposals(formattedProposals)
      } catch (error) {
        console.error('Error fetching proposals:', error)
      }
    }
    
    fetchProposals()
  }, [nextProposalId])

  // Mock data - in real app, this would come from contracts/API
  const mockProposals = [
    // Active Proposals
    {
      id: 1,
      title: 'Fund Education Initiative Phase 2',
      description: 'Continue funding the education initiative to support 500 more students in underserved communities.',
      proposer: '0x1234...5678',
      targetProjectId: 1,
      amount: '10,000',
      recipient: '0xabcd...efgh',
      votesFor: '15,000',
      votesAgainst: '5,000',
      deadline: '2024-01-20',
      status: 'active',
      executed: false,
      createdAt: '2024-01-13'
    },
    {
      id: 2,
      title: 'Digital Literacy Program',
      description: 'Launch a comprehensive digital literacy program for elderly citizens to bridge the technology gap.',
      proposer: '0x2468...1357',
      targetProjectId: 1,
      amount: '8,500',
      recipient: '0x9876...5432',
      votesFor: '12,000',
      votesAgainst: '3,500',
      deadline: '2024-01-22',
      status: 'active',
      executed: false,
      createdAt: '2024-01-14'
    },
    {
      id: 3,
      title: 'Renewable Energy Research',
      description: 'Fund research and development of affordable solar panel technology for developing countries.',
      proposer: '0x3691...2580',
      targetProjectId: 3,
      amount: '20,000',
      recipient: '0x1357...2468',
      votesFor: '18,000',
      votesAgainst: '7,000',
      deadline: '2024-01-25',
      status: 'active',
      executed: false,
      createdAt: '2024-01-15'
    },
    // Passed Proposals
    {
      id: 4,
      title: 'Environmental Cleanup Project',
      description: 'Fund ocean plastic cleanup initiative in the Pacific region.',
      proposer: '0x5555...7777',
      targetProjectId: 3,
      amount: '15,000',
      recipient: '0xqrst...uvwx',
      votesFor: '20,000',
      votesAgainst: '3,000',
      deadline: '2024-01-15',
      status: 'passed',
      executed: true,
      createdAt: '2024-01-08'
    },
    {
      id: 5,
      title: 'Food Security Initiative',
      description: 'Support local farmers with seeds, tools, and training to improve food production.',
      proposer: '0x8888...1111',
      targetProjectId: 4,
      amount: '12,000',
      recipient: '0xefgh...ijkl',
      votesFor: '16,000',
      votesAgainst: '4,000',
      deadline: '2024-01-10',
      status: 'passed',
      executed: true,
      createdAt: '2024-01-03'
    },
    // Rejected Proposals
    {
      id: 6,
      title: 'Healthcare Access Program',
      description: 'Establish mobile healthcare units in rural areas to provide essential medical services.',
      proposer: '0x9876...5432',
      targetProjectId: 2,
      amount: '25,000',
      recipient: '0xijkl...mnop',
      votesFor: '8,000',
      votesAgainst: '12,000',
      deadline: '2024-01-18',
      status: 'rejected',
      executed: false,
      createdAt: '2024-01-11'
    },
    {
      id: 7,
      title: 'Luxury Sports Complex',
      description: 'Build a state-of-the-art sports complex with swimming pool and gym facilities.',
      proposer: '0x1111...2222',
      targetProjectId: 1,
      amount: '50,000',
      recipient: '0xmnop...qrst',
      votesFor: '5,000',
      votesAgainst: '22,000',
      deadline: '2024-01-16',
      status: 'rejected',
      executed: false,
      createdAt: '2024-01-09'
    },
    {
      id: 8,
      title: 'Cryptocurrency Trading Platform',
      description: 'Develop a new cryptocurrency trading platform for the community.',
      proposer: '0x3333...4444',
      targetProjectId: 1,
      amount: '40,000',
      recipient: '0xuvwx...yzab',
      votesFor: '6,500',
      votesAgainst: '18,500',
      deadline: '2024-01-14',
      status: 'rejected',
      executed: false,
      createdAt: '2024-01-07'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-5 h-5 text-blue-500" />
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'passed':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleVote = async (proposalId: number, support: boolean) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (safeUserVotingPower === 0n) {
      toast.error('You have no voting power. Make a donation first.')
      return
    }

    setVotingOnProposal(proposalId)
    try {
      toast.loading(`Voting ${support ? 'YES' : 'NO'} on proposal ${proposalId}...`, { id: 'vote' })
      const voteHash = await vote(proposalId, support)
      setTxHash(voteHash as unknown as `0x${string}`)
      toast.success(`Successfully voted ${support ? 'YES' : 'NO'} on proposal ${proposalId}`, { id: 'vote' })
    } catch (error: any) {
      console.error('Voting error:', error)
      toast.error(error.message || 'Voting failed. Please try again.', { id: 'vote' })
    } finally {
      setVotingOnProposal(null)
      setTxHash(undefined)
    }
  }

  const handleExecute = async (proposalId: number) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      toast.loading(`Executing proposal ${proposalId}...`, { id: 'execute' })
      const executeHash = await executeProposal(proposalId)
      setTxHash(executeHash as unknown as `0x${string}`)
      toast.success(`Successfully executed proposal ${proposalId}`, { id: 'execute' })
    } catch (error: any) {
      console.error('Execution error:', error)
      toast.error(error.message || 'Execution failed. Please try again.', { id: 'execute' })
    } finally {
      setTxHash(undefined)
    }
  }

  // Use mock proposals for now (in real app, use proposals from contract)
  const allProposals = proposals.length > 0 ? proposals : mockProposals
  
  const filteredProposals = allProposals.filter(proposal => {
    if (activeTab === 'active') return proposal.status === 'active'
    if (activeTab === 'passed') return proposal.status === 'passed'
    if (activeTab === 'rejected') return proposal.status === 'rejected'
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Governance
          </h1>
          <p className="text-gray-600">
            Participate in community governance by voting on proposals and executing approved initiatives.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Proposals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allProposals.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Passed Proposals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allProposals.filter(p => p.status === 'passed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Proposals</p>
                <p className="text-2xl font-bold text-gray-900">{allProposals.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'active', label: 'Active', count: allProposals.filter(p => p.status === 'active').length },
                { id: 'passed', label: 'Passed', count: allProposals.filter(p => p.status === 'passed').length },
                { id: 'rejected', label: 'Rejected', count: allProposals.filter(p => p.status === 'rejected').length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-6">
          {filteredProposals.map((proposal) => (
            <div key={proposal.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(proposal.status)}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {proposal.title}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(proposal.status)}`}>
                      {proposal.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{proposal.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Amount:</span>
                      <span className="ml-2 text-gray-900">{proposal.amount} USDC</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Proposer:</span>
                      <span className="ml-2 text-gray-900">{proposal.proposer}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Deadline:</span>
                      <span className="ml-2 text-gray-900">{proposal.deadline}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Voting Stats */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <ArrowUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">Votes For:</span>
                    <span className="font-semibold text-green-600">{proposal.votesFor} USDC</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600">Votes Against:</span>
                    <span className="font-semibold text-red-600">{proposal.votesAgainst} USDC</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {proposal.status === 'active' && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleVote(proposal.id, true)}
                    disabled={votingOnProposal === proposal.id}
                    className="btn-primary flex items-center justify-center space-x-2"
                  >
                    {votingOnProposal === proposal.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Voting...</span>
                      </>
                    ) : (
                      <>
                        <ArrowUp className="w-4 h-4" />
                        <span>Vote YES</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleVote(proposal.id, false)}
                    disabled={votingOnProposal === proposal.id}
                    className="btn-outline flex items-center justify-center space-x-2"
                  >
                    <ArrowDown className="w-4 h-4" />
                    <span>Vote NO</span>
                  </button>
                </div>
              )}

              {proposal.status === 'passed' && !proposal.executed && (
                <button
                  onClick={() => handleExecute(proposal.id)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Execute Proposal</span>
                </button>
              )}

              {proposal.executed && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Proposal Executed</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredProposals.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} proposals
            </h3>
            <p className="text-gray-600">
              There are currently no {activeTab} proposals to display.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Governance
