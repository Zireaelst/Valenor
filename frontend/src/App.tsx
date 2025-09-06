import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from './config/wagmi'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Pages
import Home from './pages/Home'
import DonorDashboard from './pages/DonorDashboard'
import Governance from './pages/Governance'
import ProposalSubmission from './pages/ProposalSubmission'
import EthVault from './pages/EthVault'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import NetworkBanner from './components/NetworkBanner'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <NetworkBanner />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<DonorDashboard />} />
                <Route path="/governance" element={<Governance />} />
                <Route path="/proposal" element={<ProposalSubmission />} />
                <Route path="/eth-vault" element={<EthVault />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-right" />
          </div>
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App