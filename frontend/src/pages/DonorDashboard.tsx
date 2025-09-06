import { useState, useEffect } from 'react'
import { useAccount, useWaitForTransactionReceipt } from 'wagmi'
import { Pie, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js'
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  Award, 
  Plus,
  DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useUSDC, useFundContract, formatUSDC, parseUSDC } from '../hooks/useContracts'
import { CONTRACTS, CHAIN_ID } from '../config/contracts'

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
)

const DonorDashboard = () => {
  const { address, isConnected } = useAccount()
  const [donationAmount, setDonationAmount] = useState('')
  const [selectedProject, setSelectedProject] = useState('1')
  const [isDonating, setIsDonating] = useState(false)
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()

  const { balanceOf, allowance, approve } = useUSDC()
  const { 
    getDonorTotalDonations, 
    getDonation, 
    donate, 
    getProjectDonations,
    getProjectAvailable 
  } = useFundContract()

  // Get user's USDC balance
  const { data: usdcBalance } = balanceOf(address || '0x0')
  
  // Get user's total donations (voting power)
  const { data: totalDonations } = getDonorTotalDonations(address || '0x0')
  
  // Get individual project donations for chart
  const { data: project1Donation } = getDonation(address || '0x0', 1)
  const { data: project2Donation } = getDonation(address || '0x0', 2)
  const { data: project3Donation } = getDonation(address || '0x0', 3)
  const { data: project4Donation } = getDonation(address || '0x0', 4)

  // Get total project donations and available funds for analytics
  const { data: totalProject1Donations } = getProjectDonations(1)
  const { data: totalProject2Donations } = getProjectDonations(2)
  const { data: totalProject3Donations } = getProjectDonations(3)
  const { data: totalProject4Donations } = getProjectDonations(4)

  const { data: project1Available } = getProjectAvailable(1)
  const { data: project2Available } = getProjectAvailable(2)
  const { data: project3Available } = getProjectAvailable(3)
  const { data: project4Available } = getProjectAvailable(4)

  // Type-safe data extraction with fallbacks
  const safeUsdcBalance = (usdcBalance as bigint) || 0n
  const safeTotalDonations = (totalDonations as bigint) || 0n
  const safeProject1Donation = (project1Donation as bigint) || 0n
  const safeProject2Donation = (project2Donation as bigint) || 0n
  const safeProject3Donation = (project3Donation as bigint) || 0n
  const safeProject4Donation = (project4Donation as bigint) || 0n
  const safeTotalProject1Donations = (totalProject1Donations as bigint) || 0n
  const safeTotalProject2Donations = (totalProject2Donations as bigint) || 0n
  const safeTotalProject3Donations = (totalProject3Donations as bigint) || 0n
  const safeTotalProject4Donations = (totalProject4Donations as bigint) || 0n
  const safeProject1Available = (project1Available as bigint) || 0n
  const safeProject2Available = (project2Available as bigint) || 0n
  const safeProject3Available = (project3Available as bigint) || 0n
  const safeProject4Available = (project4Available as bigint) || 0n

  // Calculate milestone progress for each project
  const getMilestoneProgress = (totalDonations: bigint | undefined, available: bigint | undefined) => {
    if (!totalDonations || totalDonations === 0n) return 0
    if (!available) return 0
    const released = totalDonations - available
    return Math.round((Number(released) / Number(totalDonations)) * 100)
  }

  const projectProgress = [
    {
      name: 'Education Initiative',
      total: formatUSDC(safeTotalProject1Donations),
      available: formatUSDC(safeProject1Available),
      released: formatUSDC(safeTotalProject1Donations - safeProject1Available),
      progress: getMilestoneProgress(safeTotalProject1Donations, safeProject1Available)
    },
    {
      name: 'Healthcare Access',
      total: formatUSDC(safeTotalProject2Donations),
      available: formatUSDC(safeProject2Available),
      released: formatUSDC(safeTotalProject2Donations - safeProject2Available),
      progress: getMilestoneProgress(safeTotalProject2Donations, safeProject2Available)
    },
    {
      name: 'Environmental Cleanup',
      total: formatUSDC(safeTotalProject3Donations),
      available: formatUSDC(safeProject3Available),
      released: formatUSDC(safeTotalProject3Donations - safeProject3Available),
      progress: getMilestoneProgress(safeTotalProject3Donations, safeProject3Available)
    },
    {
      name: 'Food Security',
      total: formatUSDC(safeTotalProject4Donations),
      available: formatUSDC(safeProject4Available),
      released: formatUSDC(safeTotalProject4Donations - safeProject4Available),
      progress: getMilestoneProgress(safeTotalProject4Donations, safeProject4Available)
    }
  ]

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Use transaction status for UI feedback
  useEffect(() => {
    if (isConfirmed) {
      toast.success('Transaction confirmed!')
    }
  }, [isConfirmed])

  // Mock data - in real app, this would come from contracts/API
  const mockData = {
    totalDonated: '5,000',
    votingPower: '5,000',
    projectsDonated: 3,
    proposalsVoted: 7,
    recentDonations: [
      { project: 'Education Initiative', amount: '2,000', date: '2024-01-15' },
      { project: 'Healthcare Access', amount: '1,500', date: '2024-01-10' },
      { project: 'Environmental Cleanup', amount: '1,500', date: '2024-01-05' },
    ],
    projects: [
      { id: '1', name: 'Education Initiative', description: 'Supporting local schools' },
      { id: '2', name: 'Healthcare Access', description: 'Medical supplies for communities' },
      { id: '3', name: 'Environmental Cleanup', description: 'Ocean plastic removal' },
      { id: '4', name: 'Food Security', description: 'Community gardens and food banks' },
    ],
    // Mock data for top donors (in real app, this would come from events/API)
    topDonors: [
      { address: '0x1234...5678', amount: '15,000', name: 'Alice' },
      { address: '0x2345...6789', amount: '12,500', name: 'Bob' },
      { address: '0x3456...7890', amount: '10,000', name: 'Charlie' },
      { address: '0x4567...8901', amount: '8,500', name: 'Diana' },
      { address: '0x5678...9012', amount: '7,200', name: 'Eve' },
    ]
  }

  // Chart data for user's donation distribution (pie chart)
  const userDonationChartData = {
    labels: ['Education', 'Healthcare', 'Environment', 'Food Security'],
    datasets: [
      {
        data: [
          parseFloat(formatUSDC(safeProject1Donation)),
          parseFloat(formatUSDC(safeProject2Donation)),
          parseFloat(formatUSDC(safeProject3Donation)),
          parseFloat(formatUSDC(safeProject4Donation)),
        ],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
        ],
        borderColor: [
          '#2563EB',
          '#059669',
          '#D97706',
          '#DC2626',
        ],
        borderWidth: 2,
      },
    ],
  }

  // Check if user has any donations
  const hasUserDonations = safeProject1Donation > 0n || safeProject2Donation > 0n || safeProject3Donation > 0n || safeProject4Donation > 0n

  // Chart data for total project donations (pie chart)
  const totalProjectChartData = {
    labels: ['Education', 'Healthcare', 'Environment', 'Food Security'],
    datasets: [
      {
        data: [
          parseFloat(formatUSDC(safeTotalProject1Donations)),
          parseFloat(formatUSDC(safeTotalProject2Donations)),
          parseFloat(formatUSDC(safeTotalProject3Donations)),
          parseFloat(formatUSDC(safeTotalProject4Donations)),
        ],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
        ],
        borderColor: [
          '#2563EB',
          '#059669',
          '#D97706',
          '#DC2626',
        ],
        borderWidth: 2,
      },
    ],
  }

  // Check if there are any total project donations
  const hasTotalDonations = safeTotalProject1Donations > 0n || safeTotalProject2Donations > 0n || safeTotalProject3Donations > 0n || safeTotalProject4Donations > 0n

  // Chart data for top donors (bar chart)
  const topDonorsChartData = {
    labels: mockData.topDonors.map(donor => donor.name),
    datasets: [
      {
        label: 'Total Donations (USDC)',
        data: mockData.topDonors.map(donor => parseFloat(donor.amount.replace(',', ''))),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
        ],
        borderColor: [
          '#2563EB',
          '#059669',
          '#D97706',
          '#DC2626',
          '#7C3AED',
        ],
        borderWidth: 1,
      },
    ],
  }

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Your Donation Distribution',
      },
    },
  }

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top Donors',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString() + ' USDC'
          }
        }
      }
    }
  }

  const handleDonate = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error('Please enter a valid donation amount')
      return
    }

    const donationAmountWei = parseUSDC(donationAmount)
    
    // Check if user has enough USDC balance
    if (safeUsdcBalance < donationAmountWei) {
      toast.error('Insufficient USDC balance')
      return
    }

    setIsDonating(true)
    try {
      // First, check allowance
      const { data: currentAllowance } = allowance(address, CONTRACTS[CHAIN_ID].fundContract)
      const safeCurrentAllowance = (currentAllowance as bigint) || 0n
      
      if (safeCurrentAllowance < donationAmountWei) {
        // Need to approve first
        toast.loading('Approving USDC...', { id: 'approve' })
        const approveHash = await approve(CONTRACTS[CHAIN_ID].fundContract, donationAmount)
        setTxHash(approveHash as unknown as `0x${string}`)
        
        // Wait for approval confirmation
        await new Promise((resolve, reject) => {
          const checkApproval = setInterval(async () => {
            const { data: newAllowance } = allowance(address, CONTRACTS[CHAIN_ID].fundContract)
            const safeNewAllowance = (newAllowance as bigint) || 0n
            if (safeNewAllowance >= donationAmountWei) {
              clearInterval(checkApproval)
              resolve(true)
            }
          }, 1000)
          
          setTimeout(() => {
            clearInterval(checkApproval)
            reject(new Error('Approval timeout'))
          }, 30000)
        })
        
        toast.success('USDC approved!', { id: 'approve' })
      }

      // Now make the donation
      toast.loading('Making donation...', { id: 'donate' })
      const donateHash = await donate(donationAmount, parseInt(selectedProject))
      setTxHash(donateHash as unknown as `0x${string}`)
      
      toast.success(`Successfully donated ${donationAmount} USDC to project ${selectedProject}`, { id: 'donate' })
      setDonationAmount('')
    } catch (error: any) {
      console.error('Donation error:', error)
      toast.error(error.message || 'Donation failed. Please try again.')
    } finally {
      setIsDonating(false)
      setTxHash(undefined)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-8">
              Please connect your wallet to access the donor dashboard and make donations.
            </p>
            <button className="btn-primary">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Donor Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back! Manage your donations and track your impact.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Donated</p>
                <p className="text-2xl font-bold text-gray-900">{formatUSDC(safeTotalDonations)} USDC</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Voting Power</p>
                <p className="text-2xl font-bold text-gray-900">{formatUSDC(safeTotalDonations)} USDC</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Projects Supported</p>
                <p className="text-2xl font-bold text-gray-900">{mockData.projectsDonated}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Proposals Voted</p>
                <p className="text-2xl font-bold text-gray-900">{mockData.proposalsVoted}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Your Donation Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Donation Distribution
            </h3>
            <div className="h-64">
              {hasUserDonations ? (
                <Pie data={userDonationChartData} options={pieChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No donations yet</p>
                    <p className="text-gray-400 text-xs mt-1">Make your first donation to see the chart</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Total Project Donations */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Total Project Donations
            </h3>
            <div className="h-64">
              {hasTotalDonations ? (
                <Pie 
                  data={{
                    ...totalProjectChartData,
                    datasets: [{
                      ...totalProjectChartData.datasets[0],
                      label: 'Total Donations (USDC)'
                    }]
                  }} 
                  options={{
                    ...pieChartOptions,
                    plugins: {
                      ...pieChartOptions.plugins,
                      title: {
                        display: true,
                        text: 'Total Project Donations',
                      },
                    }
                  }} 
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No project donations yet</p>
                    <p className="text-gray-400 text-xs mt-1">Donations will appear here once projects receive funding</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Donors and Milestone Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Donors Bar Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Donors
            </h3>
            <div className="h-64">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No donor data available</p>
                  <p className="text-gray-400 text-xs mt-1">Top donors will appear here once donations are made</p>
                </div>
              </div>
            </div>
          </div>

          {/* Milestone Progress */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Milestone Release Progress
            </h3>
            <div className="space-y-4">
              {projectProgress.map((project, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {project.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Released: {project.released} USDC</span>
                    <span>Available: {project.available} USDC</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Donate Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Donate */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Make a Donation
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Project
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="input-field"
                >
                  {mockData.projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (USDC)
                </label>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="input-field"
                />
              </div>
              
              <button
                onClick={handleDonate}
                disabled={isDonating || isConfirming}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {isDonating || isConfirming ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isConfirming ? 'Confirming...' : 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Donate Now</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Project Overview */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Project Overview
            </h3>
            <div className="space-y-4">
              {projectProgress.map((project, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{project.name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Raised:</span>
                      <p className="font-semibold text-gray-900">{project.total} USDC</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Available:</span>
                      <p className="font-semibold text-green-600">{project.available} USDC</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Released:</span>
                      <p className="font-semibold text-blue-600">{project.released} USDC</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Progress:</span>
                      <p className="font-semibold text-primary-600">{project.progress}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Donations */}
        <div className="mt-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Donations
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockData.recentDonations.map((donation, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {donation.project}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {donation.amount} USDC
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {donation.date}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonorDashboard
