import { sepolia } from 'wagmi/chains'
import TestUSDCABI from '../contracts/abis/TestUSDC.json'
import FundContractABI from '../contracts/abis/FundContract.json'
import GovernanceContractABI from '../contracts/abis/GovernanceContract.json'
import EthVaultABI from '../contracts/abis/EthVault.json'

export const CONTRACTS = {
  [sepolia.id]: {
    fundContract: import.meta.env.VITE_FUND_CONTRACT as `0x${string}`,
    governanceContract: import.meta.env.VITE_GOV_CONTRACT as `0x${string}`,
    usdcToken: import.meta.env.VITE_USDC_ADDRESS as `0x${string}`,
    ethVault: import.meta.env.VITE_ETH_VAULT_ADDRESS as `0x${string}`,
  },
} as const

export const ABIS = {
  TestUSDC: TestUSDCABI,
  FundContract: FundContractABI,
  GovernanceContract: GovernanceContractABI,
  EthVault: EthVaultABI,
} as const

export const CHAIN_ID = sepolia.id
export const CHAIN_NAME = sepolia.name
