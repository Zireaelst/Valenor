import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { CONTRACTS, ABIS, CHAIN_ID } from '../config/contracts'

// USDC Token Hook
export const useUSDC = () => {
  const { writeContract } = useWriteContract()

  const balanceOf = (address: `0x${string}`) => {
    return useReadContract({
      address: CONTRACTS[CHAIN_ID].usdcToken,
      abi: ABIS.TestUSDC,
      functionName: 'balanceOf',
      args: [address],
    })
  }

  const allowance = (owner: `0x${string}`, spender: `0x${string}`) => {
    return useReadContract({
      address: CONTRACTS[CHAIN_ID].usdcToken,
      abi: ABIS.TestUSDC,
      functionName: 'allowance',
      args: [owner, spender],
    })
  }

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
    balanceOf,
    allowance,
    approve,
    mint,
  }
}

// Fund Contract Hook
export const useFundContract = () => {
  const { writeContract } = useWriteContract()

  const getDonorTotalDonations = (donor: `0x${string}`) => {
    return useReadContract({
      address: CONTRACTS[CHAIN_ID].fundContract,
      abi: ABIS.FundContract,
      functionName: 'getDonorTotalDonations',
      args: [donor],
    })
  }

  const getProjectAvailable = (projectId: number) => {
    return useReadContract({
      address: CONTRACTS[CHAIN_ID].fundContract,
      abi: ABIS.FundContract,
      functionName: 'getProjectAvailable',
      args: [BigInt(projectId)],
    })
  }

  const getProjectDonations = (projectId: number) => {
    return useReadContract({
      address: CONTRACTS[CHAIN_ID].fundContract,
      abi: ABIS.FundContract,
      functionName: 'projectDonations',
      args: [BigInt(projectId)],
    })
  }

  const getDonation = (donor: `0x${string}`, projectId: number) => {
    return useReadContract({
      address: CONTRACTS[CHAIN_ID].fundContract,
      abi: ABIS.FundContract,
      functionName: 'donations',
      args: [donor, BigInt(projectId)],
    })
  }

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
    getDonorTotalDonations,
    getProjectAvailable,
    getProjectDonations,
    getDonation,
    donate,
    releaseMilestone,
  }
}

// Governance Contract Hook
export const useGovernanceContract = () => {
  const { writeContract } = useWriteContract()

  const getVotingPower = (voter: `0x${string}`) => {
    return useReadContract({
      address: CONTRACTS[CHAIN_ID].governanceContract,
      abi: ABIS.GovernanceContract,
      functionName: 'getVotingPower',
      args: [voter],
    })
  }

  const getProposal = (proposalId: number) => {
    return useReadContract({
      address: CONTRACTS[CHAIN_ID].governanceContract,
      abi: ABIS.GovernanceContract,
      functionName: 'proposals',
      args: [BigInt(proposalId)],
    })
  }

  const getNextProposalId = () => {
    return useReadContract({
      address: CONTRACTS[CHAIN_ID].governanceContract,
      abi: ABIS.GovernanceContract,
      functionName: 'nextProposalId',
    })
  }

  const hasVoted = (proposalId: number, voter: `0x${string}`) => {
    return useReadContract({
      address: CONTRACTS[CHAIN_ID].governanceContract,
      abi: ABIS.GovernanceContract,
      functionName: 'hasVoted',
      args: [BigInt(proposalId), voter],
    })
  }

  const getMinProposalAmount = () => {
    return useReadContract({
      address: CONTRACTS[CHAIN_ID].governanceContract,
      abi: ABIS.GovernanceContract,
      functionName: 'minProposalAmount',
    })
  }

  const getMinVotingPowerToPropose = () => {
    return useReadContract({
      address: CONTRACTS[CHAIN_ID].governanceContract,
      abi: ABIS.GovernanceContract,
      functionName: 'minVotingPowerToPropose',
    })
  }

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
    getVotingPower,
    getProposal,
    getNextProposalId,
    hasVoted,
    getMinProposalAmount,
    getMinVotingPowerToPropose,
    createProposal,
    vote,
    executeProposal,
  }
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

