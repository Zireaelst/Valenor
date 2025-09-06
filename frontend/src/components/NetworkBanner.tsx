import { useAccount, useSwitchChain } from 'wagmi'
import { CHAIN_ID, CHAIN_NAME } from '../config/contracts'
import { AlertTriangle, RefreshCw } from 'lucide-react'

const NetworkBanner = () => {
  const { chain } = useAccount()
  const { switchChain } = useSwitchChain()

  const isWrongNetwork = chain?.id !== CHAIN_ID

  if (!isWrongNetwork) return null

  const handleSwitchNetwork = () => {
    switchChain({ chainId: CHAIN_ID })
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-700">
            <strong>Wrong Network:</strong> You are connected to {chain?.name || 'Unknown Network'}. 
            Please switch to {CHAIN_NAME} to use Valenor.
          </p>
        </div>
        <div className="ml-3">
          <button
            onClick={handleSwitchNetwork}
            className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Switch Network</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default NetworkBanner

