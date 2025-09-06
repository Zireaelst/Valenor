import { useAccount } from 'wagmi'
import { Link } from 'react-router-dom'
import { User, Wallet, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'

export function Profile() {
  const { address, isConnected } = useAccount()

  // Mock data - in real app, this would come from smart contract
  const mockProfile = {
    isMember: true,
    stakeAmount: '0.5',
    joinDate: '2024-01-15',
    totalVotes: 12,
    proposalsCreated: 3,
    proposalsPassed: 2,
    votingPower: '0.5 ETH'
  }

  const mockActivity = [
    {
      id: 1,
      type: 'vote',
      title: 'Voted on "Community Garden Initiative"',
      result: 'for',
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      amount: '0.5 ETH'
    },
    {
      id: 2,
      type: 'proposal',
      title: 'Created "Digital Literacy Program"',
      result: 'pending',
      timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
      amount: '1.2 ETH'
    },
    {
      id: 3,
      type: 'vote',
      title: 'Voted on "Local Food Bank Support"',
      result: 'for',
      timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
      amount: '0.5 ETH'
    }
  ]

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  }

  const getActivityIcon = (type: string, result: string) => {
    if (type === 'proposal') {
      return result === 'pending' ? Clock : result === 'passed' ? CheckCircle : XCircle
    }
    return result === 'for' ? CheckCircle : XCircle
  }

  const getActivityColor = (result: string) => {
    switch (result) {
      case 'for':
      case 'passed':
        return 'text-green-600'
      case 'against':
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 mb-8">
            Connect your wallet to view your profile and activity.
          </p>
          <Link to="/" className="btn-primary">
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">
          Your membership status and activity in the Valenor Social Fund
        </p>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Member Status */}
        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Member Status</h3>
              <p className="text-sm text-gray-600">
                {mockProfile.isMember ? 'Active Member' : 'Not a Member'}
              </p>
            </div>
          </div>
          
          {mockProfile.isMember ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Stake Amount:</span>
                <span className="font-semibold">{mockProfile.stakeAmount} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Voting Power:</span>
                <span className="font-semibold">{mockProfile.votingPower}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since:</span>
                <span className="font-semibold">{mockProfile.joinDate}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                Join the fund to participate in governance
              </p>
              <button className="btn-primary">
                Join Fund
              </button>
            </div>
          )}
        </div>

        {/* Wallet Info */}
        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Wallet</h3>
              <p className="text-sm text-gray-600">Connected Address</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-gray-600 text-sm">Address:</span>
              <p className="font-mono text-sm break-all">
                {address}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {mockProfile.totalVotes}
            </div>
            <div className="text-sm text-gray-600">Total Votes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {mockProfile.proposalsCreated}
            </div>
            <div className="text-sm text-gray-600">Proposals Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {mockProfile.proposalsPassed}
            </div>
            <div className="text-sm text-gray-600">Proposals Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {Math.round((mockProfile.proposalsPassed / mockProfile.proposalsCreated) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <Link to="/proposals" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </Link>
        </div>
        
        <div className="space-y-4">
          {mockActivity.map((activity) => {
            const ActivityIcon = getActivityIcon(activity.type, activity.result)
            const iconColor = getActivityColor(activity.result)
            
            return (
              <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <ActivityIcon className={`w-5 h-5 ${iconColor}`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">
                    {formatTimeAgo(activity.timestamp)} • {activity.amount}
                  </p>
                </div>
                <div className={`text-sm font-medium ${iconColor}`}>
                  {activity.result === 'for' ? 'Voted For' : 
                   activity.result === 'against' ? 'Voted Against' :
                   activity.result === 'pending' ? 'Pending' :
                   activity.result === 'passed' ? 'Passed' : 'Failed'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Link to="/create-proposal" className="btn-primary">
            Create Proposal
          </Link>
          <Link to="/proposals" className="btn-outline">
            View Proposals
          </Link>
          {mockProfile.isMember && (
            <button className="btn-secondary">
              Leave Fund
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
