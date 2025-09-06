import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Link } from 'react-router-dom'
import { Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

// Mock data - in real app, this would come from smart contract
const mockProposals = [
  {
    id: 1,
    title: 'Community Garden Initiative',
    description: 'Establish a community garden in downtown area to provide fresh produce and educational opportunities for local residents.',
    proposer: '0x1234...5678',
    amount: '0.5',
    recipient: '0x9876...5432',
    votesFor: 1200,
    votesAgainst: 300,
    startTime: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    endTime: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days from now
    executed: false,
    cancelled: false,
    aiScore: 8.5
  },
  {
    id: 2,
    title: 'Digital Literacy Program',
    description: 'Fund a 6-month digital literacy program for seniors in the community, including devices and training materials.',
    proposer: '0xabcd...efgh',
    amount: '1.2',
    recipient: '0xijkl...mnop',
    votesFor: 800,
    votesAgainst: 200,
    startTime: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    endTime: Date.now() + 6 * 24 * 60 * 60 * 1000, // 6 days from now
    executed: false,
    cancelled: false,
    aiScore: 9.2
  },
  {
    id: 3,
    title: 'Local Food Bank Support',
    description: 'Provide emergency funding for the local food bank to purchase essential supplies and expand capacity.',
    proposer: '0xqrst...uvwx',
    amount: '0.8',
    recipient: '0xyzaa...bbcc',
    votesFor: 1500,
    votesAgainst: 100,
    startTime: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    endTime: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    executed: true,
    cancelled: false,
    aiScore: 9.8
  }
]

export function Proposals() {
  const { isConnected } = useAccount()
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')

  const filteredProposals = mockProposals.filter(proposal => {
    switch (filter) {
      case 'active':
        return !proposal.executed && !proposal.cancelled && proposal.endTime > Date.now()
      case 'completed':
        return proposal.executed
      case 'cancelled':
        return proposal.cancelled
      default:
        return true
    }
  })

  const getProposalStatus = (proposal: typeof mockProposals[0]) => {
    if (proposal.cancelled) return { status: 'cancelled', icon: XCircle, color: 'text-red-600' }
    if (proposal.executed) return { status: 'executed', icon: CheckCircle, color: 'text-green-600' }
    if (proposal.endTime > Date.now()) return { status: 'active', icon: Clock, color: 'text-blue-600' }
    return { status: 'ended', icon: AlertCircle, color: 'text-gray-600' }
  }

  const formatTimeRemaining = (endTime: number) => {
    const now = Date.now()
    const diff = endTime - now
    
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    return `${hours}h left`
  }

  const getVotePercentage = (votesFor: number, votesAgainst: number) => {
    const total = votesFor + votesAgainst
    if (total === 0) return { for: 0, against: 0 }
    return {
      for: Math.round((votesFor / total) * 100),
      against: Math.round((votesAgainst / total) * 100)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
          <p className="text-gray-600 mt-1">
            Community-driven proposals for social impact
          </p>
        </div>
        {isConnected && (
          <Link to="/create-proposal" className="btn-primary">
            Create Proposal
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'active', 'completed', 'cancelled'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              filter === filterType
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* Proposals List */}
      <div className="space-y-6">
        {filteredProposals.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No proposals have been created yet.' 
                : `No ${filter} proposals found.`
              }
            </p>
          </div>
        ) : (
          filteredProposals.map((proposal) => {
            const statusInfo = getProposalStatus(proposal)
            const votePercentages = getVotePercentage(proposal.votesFor, proposal.votesAgainst)
            const StatusIcon = statusInfo.icon

            return (
              <div key={proposal.id} className="card">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {proposal.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {proposal.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                        <span className={`text-sm font-medium ${statusInfo.color}`}>
                          {statusInfo.status.charAt(0).toUpperCase() + statusInfo.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-500">Amount</span>
                        <p className="font-semibold">{proposal.amount} ETH</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Proposer</span>
                        <p className="font-mono text-sm">{proposal.proposer}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">AI Score</span>
                        <p className="font-semibold text-primary-600">{proposal.aiScore}/10</p>
                      </div>
                    </div>

                    {/* Voting Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Votes For: {proposal.votesFor}</span>
                        <span>Votes Against: {proposal.votesAgainst}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${votePercentages.for}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{votePercentages.for}% For</span>
                        <span>{votePercentages.against}% Against</span>
                      </div>
                    </div>

                    {/* Time Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {proposal.endTime > Date.now() 
                            ? formatTimeRemaining(proposal.endTime)
                            : 'Voting ended'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 lg:min-w-[200px]">
                    {isConnected && !proposal.executed && !proposal.cancelled && proposal.endTime > Date.now() && (
                      <>
                        <button className="btn-primary text-sm">
                          Vote For
                        </button>
                        <button className="btn-outline text-sm">
                          Vote Against
                        </button>
                      </>
                    )}
                    {proposal.executed && (
                      <div className="text-center">
                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-green-600 font-medium">Executed</p>
                      </div>
                    )}
                    {proposal.cancelled && (
                      <div className="text-center">
                        <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                        <p className="text-sm text-red-600 font-medium">Cancelled</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
