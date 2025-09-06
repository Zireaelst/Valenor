import { useAccount } from 'wagmi'
import { Link } from 'react-router-dom'
import { Users, TrendingUp, Shield, Zap } from 'lucide-react'

export function Home() {
  const { isConnected } = useAccount()

  const features = [
    {
      icon: Users,
      title: 'Community Governance',
      description: 'Decentralized decision-making through member voting on social impact proposals.'
    },
    {
      icon: Shield,
      title: 'Transparent Funding',
      description: 'All transactions and proposals are recorded on-chain for complete transparency.'
    },
    {
      icon: TrendingUp,
      title: 'AI-Powered Scoring',
      description: 'Advanced NLP analysis helps evaluate proposal quality and social impact potential.'
    },
    {
      icon: Zap,
      title: 'Fast Execution',
      description: 'Automated execution of approved proposals with minimal delays and maximum efficiency.'
    }
  ]

  const stats = [
    { label: 'Active Members', value: '1,234' },
    { label: 'Proposals Funded', value: '89' },
    { label: 'Total Distributed', value: '2.4 ETH' },
    { label: 'Success Rate', value: '94%' }
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Decentralized
          <span className="text-gradient block">Social Impact</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Join Valenor, the autonomous social fund where community members vote on proposals 
          that create real-world positive impact. Powered by blockchain and AI.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isConnected ? (
            <Link to="/proposals" className="btn-primary text-lg px-8 py-3">
              View Proposals
            </Link>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Connect your wallet to get started</p>
            </div>
          )}
          <Link to="/create-proposal" className="btn-outline text-lg px-8 py-3">
            Create Proposal
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose Valenor?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                <feature.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Join the Fund
            </h3>
            <p className="text-gray-600">
              Stake a minimum amount to become a member and gain voting rights on proposals.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Create & Vote
            </h3>
            <p className="text-gray-600">
              Submit social impact proposals or vote on existing ones using your stake weight.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Execute Impact
            </h3>
            <p className="text-gray-600">
              Approved proposals are automatically executed, creating real-world positive change.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-12 text-white">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Make a Difference?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of members creating positive social impact through decentralized governance.
        </p>
        {isConnected ? (
          <Link to="/proposals" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200">
            Get Started
          </Link>
        ) : (
          <p className="text-lg opacity-75">
            Connect your wallet to join the community
          </p>
        )}
      </section>
    </div>
  )
}
