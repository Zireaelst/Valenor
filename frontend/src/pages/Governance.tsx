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
import { 
  useGovernanceContract, 
  useNextProposalId,
  useProposal,
  useVotingPower,
  useHasVoted,
  formatUSDC 
} from '../hooks/useContracts'

const Governance = () => {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState('active')
  const [votingOnProposal, setVotingOnProposal] = useState<number | null>(null)
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()

  const { vote, executeProposal } = useGovernanceContract()

  // Get next proposal ID to know how many proposals exist
  const { data: nextProposalId } = useNextProposalId()
  
  // Get user's voting power
  const { data: userVotingPower } = useVotingPower(address)
  
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

  // For now, we'll use empty proposals array since we need to properly implement proposal fetching
  // This prevents the infinite loop and hook rule violations
  const proposals: any[] = []


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

  // Use real proposals from contract (empty for now until properly implemented)
  const allProposals = proposals
  
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
