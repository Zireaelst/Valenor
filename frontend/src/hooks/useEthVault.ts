import { useContractRead, useContractWrite, useAccount } from 'wagmi'
import { CONTRACTS, ABIS } from '../config/contracts'

export const useEthVault = () => {
  const { address } = useAccount()

  const { data: balance, refetch: refetchBalance } = useContractRead({
    address: CONTRACTS[11155111].ethVault,
    abi: ABIS.EthVault,
    functionName: 'getBalanceOf',
    args: address ? [address] : undefined,
    enabled: !!address,
  })

  const { write: deposit, isLoading: isDepositing } = useContractWrite({
    address: CONTRACTS[11155111].ethVault,
    abi: ABIS.EthVault,
    functionName: 'deposit',
    mode: 'recklesslyUnprepared',
  })

  const { write: withdraw, isLoading: isWithdrawing } = useContractWrite({
    address: CONTRACTS[11155111].ethVault,
    abi: ABIS.EthVault,
    functionName: 'withdraw',
    mode: 'recklesslyUnprepared',
  })

  const depositEth = async (amount: string) => {
    if (!deposit) return
    
    const value = BigInt(parseFloat(amount) * 1e18)
    deposit({
      recklesslySetUnpreparedArgs: [],
      recklesslySetUnpreparedOverrides: {
        value: value,
      },
    })
  }

  const withdrawEth = async (amount: string) => {
    if (!withdraw) return
    
    const value = BigInt(parseFloat(amount) * 1e18)
    withdraw({
      recklesslySetUnpreparedArgs: [value],
    })
  }

  return {
    balance: balance ? Number(balance) / 1e18 : 0,
    depositEth,
    withdrawEth,
    isDepositing,
    isWithdrawing,
    refetchBalance,
  }
}
