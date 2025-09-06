import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Users, Zap, Heart, Globe, Lock } from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Transparent Governance',
      description: 'All decisions are made through democratic voting with full transparency on the blockchain.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community Driven',
      description: 'The community decides which projects receive funding through proposal and voting mechanisms.'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Fast & Efficient',
      description: 'Automated smart contracts ensure quick fund distribution once proposals are approved.'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Social Impact',
      description: 'Focus on projects that create positive social change and community benefit.'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Global Reach',
      description: 'Support projects worldwide with borderless blockchain technology.'
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Secure & Trustless',
      description: 'Built on Ethereum with smart contracts ensuring security without intermediaries.'
    }
  ]

  const stats = [
    { label: 'Projects Funded', value: '127' },
    { label: 'Total Donations', value: '$2.4M' },
    { label: 'Active Voters', value: '1,234' },
    { label: 'Countries', value: '45' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Decentralized
              <span className="text-primary-600"> Social Impact</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Valenor is a decentralized autonomous organization that enables transparent, 
              community-driven funding for social impact projects through blockchain technology 
              and democratic governance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/governance"
                className="btn-outline text-lg px-8 py-3"
              >
                View Governance
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Valenor?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We combine the power of blockchain technology with democratic governance 
              to create a transparent and efficient platform for social impact funding.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="text-primary-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to participate in decentralized social impact funding
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Connect Your Wallet
              </h3>
              <p className="text-gray-600">
                Connect your MetaMask wallet to the Ethereum Sepolia testnet to get started.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Donate or Propose
              </h3>
              <p className="text-gray-600">
                Donate to existing projects or submit new proposals for community funding.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Vote & Govern
              </h3>
              <p className="text-gray-600">
                Participate in governance by voting on proposals and shaping the future of the platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join the Valenor community and help fund projects that create positive social impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="bg-white text-primary-600 hover:bg-gray-50 font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
            >
              Start Donating
            </Link>
            <Link
              to="/proposal"
              className="border border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
            >
              Submit Proposal
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home