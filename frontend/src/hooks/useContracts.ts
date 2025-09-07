import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { CONTRACTS, ABIS, CHAIN_ID } from '../config/contracts'

// USDC Token Hook
export const useUSDC = () => {
  const { writeContract } = useWriteContract()

  const approve = async (spender: `0x${string}`, amount: string) => {
    const amountWei = parseUnits(amount, 6) // USDC has 6 decimals
    return writeContract({
      address: CONTRACTS[CHAIN_ID].usdcToken,
      abi: ABIS.TestUSDC,
      functionName: 'approve',
      args: [spender, amountWei],
    })
  }

  const mint = async (to: `0x${string}`, amount: string) => {
    const amountWei = parseUnits(amount, 6)
    return writeContract({
      address: CONTRACTS[CHAIN_ID].usdcToken,
      abi: ABIS.TestUSDC,
      functionName: 'mint',
      args: [to, amountWei],
    })
  }

  return {
    approve,
    mint,
  }
}

// USDC Read Hooks
export const useUSDCBalance = (address: `0x${string}` | undefined) => {
  return useReadContract({
    address: CONTRACTS[CHAIN_ID].usdcToken,
    abi: ABIS.TestUSDC,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address,
  })
}

export const useUSDCAllowance = (owner: `0x${string}` | undefined, spender: `0x${string}` | undefined) => {
  return useReadContract({
    address: CONTRACTS[CHAIN_ID].usdcToken,
    abi: ABIS.TestUSDC,
    functionName: 'allowance',
    args: owner && spender ? [owner, spender] : undefined,
    enabled: !!(owner && spender),
  })
}

// Fund Contract Hook
export const useFundContract = () => {
  const { writeContract } = useWriteContract()

  const donate = async (amount: string, projectId: number) => {
    const amountWei = parseUnits(amount, 6)
    return writeContract({
      address: CONTRACTS[CHAIN_ID].fundContract,
      abi: ABIS.FundContract,
      functionName: 'donate',
      args: [amountWei, BigInt(projectId)],
    })
  }

  const releaseMilestone = async (projectId: number, recipient: `0x${string}`, amount: string) => {
    const amountWei = parseUnits(amount, 6)
    return writeContract({
      address: CONTRACTS[CHAIN_ID].fundContract,
      abi: ABIS.FundContract,
      functionName: 'releaseMilestone',
      args: [BigInt(projectId), recipient, amountWei],
    })
  }

  return {
    donate,
    releaseMilestone,
  }
}

// Fund Contract Read Hooks
export const useDonorTotalDonations = (donor: `0x${string}` | undefined) => {
  return useReadContract({
    address: CONTRACTS[CHAIN_ID].fundContract,
    abi: ABIS.FundContract,
    functionName: 'getDonorTotalDonations',
    args: donor ? [donor] : undefined,
    enabled: !!donor,
  })
}

export const useProjectAvailable = (projectId: number) => {
  return useReadContract({
    address: CONTRACTS[CHAIN_ID].fundContract,
    abi: ABIS.FundContract,
    functionName: 'getProjectAvailable',
    args: [BigInt(projectId)],
  })
}

export const useProjectDonations = (projectId: number) => {
  return useReadContract({
    address: CONTRACTS[CHAIN_ID].fundContract,
    abi: ABIS.FundContract,
    functionName: 'projectDonations',
    args: [BigInt(projectId)],
  })
}

export const useDonation = (donor: `0x${string}` | undefined, projectId: number) => {
  return useReadContract({
    address: CONTRACTS[CHAIN_ID].fundContract,
    abi: ABIS.FundContract,
    functionName: 'donations',
    args: donor ? [donor, BigInt(projectId)] : undefined,
    enabled: !!donor,
  })
}

// Governance Contract Hook
export const useGovernanceContract = () => {
  const { writeContract } = useWriteContract()

  const createProposal = async (
    description: string,
    projectId: number,
    amount: string,
    recipient: `0x${string}`
  ) => {
    const amountWei = parseUnits(amount, 6)
    return writeContract({
      address: CONTRACTS[CHAIN_ID].governanceContract,
      abi: ABIS.GovernanceContract,
      functionName: 'createProposal',
      args: [description, BigInt(projectId), amountWei, recipient],
    })
  }

  const vote = async (proposalId: number, support: boolean) => {
    return writeContract({
      address: CONTRACTS[CHAIN_ID].governanceContract,
      abi: ABIS.GovernanceContract,
      functionName: 'vote',
      args: [BigInt(proposalId), support],
    })
  }

  const executeProposal = async (proposalId: number) => {
    return writeContract({
      address: CONTRACTS[CHAIN_ID].governanceContract,
      abi: ABIS.GovernanceContract,
      functionName: 'executeProposal',
      args: [BigInt(proposalId)],
    })
  }

  return {
    createProposal,
    vote,
    executeProposal,
  }
}

// Governance Contract Read Hooks
export const useVotingPower = (voter: `0x${string}` | undefined) => {
  return useReadContract({
    address: CONTRACTS[CHAIN_ID].governanceContract,
    abi: ABIS.GovernanceContract,
    functionName: 'getVotingPower',
    args: voter ? [voter] : undefined,
    enabled: !!voter,
  })
}

export const useProposal = (proposalId: number) => {
  return useReadContract({
    address: CONTRACTS[CHAIN_ID].governanceContract,
    abi: ABIS.GovernanceContract,
    functionName: 'proposals',
    args: [BigInt(proposalId)],
  })
}

export const useNextProposalId = () => {
  return useReadContract({
    address: CONTRACTS[CHAIN_ID].governanceContract,
    abi: ABIS.GovernanceContract,
    functionName: 'nextProposalId',
  })
}

export const useHasVoted = (proposalId: number, voter: `0x${string}` | undefined) => {
  return useReadContract({
    address: CONTRACTS[CHAIN_ID].governanceContract,
    abi: ABIS.GovernanceContract,
    functionName: 'hasVoted',
    args: voter ? [BigInt(proposalId), voter] : undefined,
    enabled: !!voter,
  })
}

export const useMinProposalAmount = () => {
  return useReadContract({
    address: CONTRACTS[CHAIN_ID].governanceContract,
    abi: ABIS.GovernanceContract,
    functionName: 'minProposalAmount',
  })
}

export const useMinVotingPowerToPropose = () => {
  return useReadContract({
    address: CONTRACTS[CHAIN_ID].governanceContract,
    abi: ABIS.GovernanceContract,
    functionName: 'minVotingPowerToPropose',
  })
}

// Utility function to format USDC amounts
export const formatUSDC = (amount: bigint | undefined): string => {
  if (!amount) return '0'
  return formatUnits(amount, 6)
}

// Utility function to parse USDC amounts
export const parseUSDC = (amount: string): bigint => {
  return parseUnits(amount, 6)
}

