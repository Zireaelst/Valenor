import React, { useState } from 'react'
import { useEthVault } from '../hooks/useEthVault'
import { useAccount, useBalance } from 'wagmi'

const EthVault: React.FC = () => {
  const { address, isConnected } = useAccount()
  const { balance, depositEth, withdrawEth, isDepositing, isWithdrawing, refetchBalance } = useEthVault()
  const { data: walletBalance } = useBalance({ address })
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return
    
    try {
      await depositEth(depositAmount)
      setDepositAmount('')
      // Refetch balance after successful deposit
      setTimeout(() => refetchBalance(), 2000)
    } catch (error) {
      console.error('Deposit failed:', error)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return
    
    try {
      await withdrawEth(withdrawAmount)
      setWithdrawAmount('')
      // Refetch balance after successful withdrawal
      setTimeout(() => refetchBalance(), 2000)
    } catch (error) {
      console.error('Withdraw failed:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet</h1>
          <p className="text-gray-600">Please connect your wallet to use the ETH Vault</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ETH Vault</h1>
          <p className="mt-2 text-gray-600">Deposit and withdraw ETH from the vault</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Balance Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Balances</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Wallet Balance (MetaMask)</p>
                <div className="text-2xl font-bold text-green-600">
                  {walletBalance ? parseFloat(walletBalance.formatted).toFixed(4) : '0.0000'} ETH
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Vault Balance</p>
                <div className="text-2xl font-bold text-blue-600">
                  {balance.toFixed(4)} ETH
                </div>
              </div>
            </div>
            <p className="text-gray-600 mt-4">Address: {address}</p>
          </div>

          {/* Deposit Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Deposit ETH</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (ETH)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max={walletBalance ? parseFloat(walletBalance.formatted) : undefined}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.01"
                  />
                  <button
                    onClick={() => setDepositAmount(walletBalance ? walletBalance.formatted : '0')}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                  >
                    Max
                  </button>
                </div>
              </div>
              <button
                onClick={handleDeposit}
                disabled={
                  isDepositing || 
                  !depositAmount || 
                  parseFloat(depositAmount) <= 0 ||
                  (walletBalance && parseFloat(depositAmount) > parseFloat(walletBalance.formatted))
                }
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isDepositing ? 'Depositing...' : 'Deposit ETH'}
              </button>
              {walletBalance && parseFloat(depositAmount) > parseFloat(walletBalance.formatted) && (
                <p className="text-red-500 text-sm">Insufficient wallet balance</p>
              )}
            </div>
          </div>

          {/* Withdraw Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Withdraw ETH</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (ETH)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max={balance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.005"
                  />
                  <button
                    onClick={() => setWithdrawAmount(balance.toString())}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                  >
                    Max
                  </button>
                </div>
              </div>
              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isWithdrawing ? 'Withdrawing...' : 'Withdraw ETH'}
              </button>
            </div>
          </div>

          {/* Contract Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contract Info</h2>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Network:</span> Sepolia Testnet</p>
              <p><span className="font-medium">Contract:</span> EthVault</p>
              <p><span className="font-medium">Address:</span> 0x0AD6E1db1D5d4470270a66cbEB081d23E612b3B7</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EthVault
