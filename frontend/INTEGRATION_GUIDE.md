# Valenor Frontend Integration Guide

This guide explains how the frontend integrates with the smart contracts on Ethereum Sepolia.

## 🚀 Quick Start

1. **Deploy contracts** to Sepolia testnet
2. **Update environment variables** with contract addresses
3. **Start the frontend** with `npm run dev`

## 📋 Prerequisites

- MetaMask wallet with Sepolia testnet configured
- Sepolia ETH for gas fees
- Contract addresses deployed to Sepolia

## 🔧 Environment Setup

Create a `.env` file in the frontend directory:

```env
# Contract addresses (update after deployment)
VITE_FUND_CONTRACT=0x...
VITE_GOV_CONTRACT=0x...
VITE_USDC_ADDRESS=0x...

# Optional: API endpoints
VITE_API_URL=http://localhost:3001
VITE_AI_SERVICE_URL=http://localhost:8000
```

## 🔗 Contract Integration

### Smart Contracts

The frontend integrates with three main contracts:

1. **TestUSDC** - ERC20 token for donations
2. **FundContract** - Manages donations and fund releases
3. **GovernanceContract** - Handles proposals and voting

### Contract ABIs

Contract ABIs are located in `src/contracts/abis/`:
- `TestUSDC.json`
- `FundContract.json`
- `GovernanceContract.json`

### Custom Hooks

All contract interactions are handled through custom hooks in `src/hooks/useContracts.ts`:

#### `useUSDC()`
- `balanceOf(address)` - Get USDC balance
- `allowance(owner, spender)` - Check allowance
- `approve(spender, amount)` - Approve USDC spending
- `mint(to, amount)` - Mint test USDC (owner only)

#### `useFundContract()`
- `getDonorTotalDonations(donor)` - Get total donations (voting power)
- `getProjectAvailable(projectId)` - Get available funds for project
- `getProjectDonations(projectId)` - Get total donations to project
- `getDonation(donor, projectId)` - Get specific donation amount
- `donate(amount, projectId)` - Make a donation
- `releaseMilestone(projectId, recipient, amount)` - Release funds (governance only)

#### `useGovernanceContract()`
- `getVotingPower(voter)` - Get voter's voting power
- `getProposal(proposalId)` - Get proposal details
- `getNextProposalId()` - Get next proposal ID
- `hasVoted(proposalId, voter)` - Check if voter has voted
- `getMinProposalAmount()` - Get minimum proposal amount
- `getMinVotingPowerToPropose()` - Get minimum voting power to propose
- `createProposal(description, projectId, amount, recipient)` - Create proposal
- `vote(proposalId, support)` - Vote on proposal
- `executeProposal(proposalId)` - Execute passed proposal

## 🎯 Key Features

### 1. Wallet Connection
- **MetaMask integration** with wagmi/viem
- **Sepolia testnet** configuration
- **Network switching** with wrong network banner
- **Address display** with USDC balance

### 2. Donation Flow
```typescript
// 1. Check USDC balance
const { data: balance } = balanceOf(address)

// 2. Check allowance
const { data: allowance } = allowance(address, fundContract)

// 3. Approve if needed
if (allowance < amount) {
  await approve(fundContract, amount)
}

// 4. Make donation
await donate(amount, projectId)
```

### 3. Proposal Management
```typescript
// Create proposal
await createProposal(description, projectId, amount, recipient)

// Vote on proposal
await vote(proposalId, support) // true = YES, false = NO

// Execute passed proposal
await executeProposal(proposalId)
```

### 4. Real-time Data
- **Live USDC balance** in navbar
- **Real-time proposal updates**
- **Transaction status** tracking
- **Voting power** display

## 🔄 Transaction Flow

### Donation Process
1. User enters donation amount
2. Check USDC balance
3. Check/approve allowance
4. Call `FundContract.donate()`
5. Update UI with new data

### Proposal Process
1. User fills proposal form
2. Validate voting power and requirements
3. Call `GovernanceContract.createProposal()`
4. Proposal appears in governance page

### Voting Process
1. User clicks vote button
2. Check voting power
3. Call `GovernanceContract.vote()`
4. Update proposal status

### Execution Process
1. Proposal passes voting
2. User clicks execute
3. Call `GovernanceContract.executeProposal()`
4. Funds released to recipient

## 🎨 UI Components

### NetworkBanner
- Shows when user is on wrong network
- Provides "Switch Network" button
- Automatically detects Sepolia requirement

### Navbar
- Wallet connection status
- USDC balance display
- Network indicator

### DonorDashboard
- Real-time donation statistics
- Interactive charts with Chart.js
- Donation form with approval flow

### Governance
- Live proposal list
- Voting interface
- Execution buttons for passed proposals

### ProposalSubmission
- Form validation
- AI analysis integration
- Contract requirement checks

## 🔧 Configuration

### Wagmi Configuration
```typescript
// src/config/wagmi.ts
export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
})
```

### Contract Configuration
```typescript
// src/config/contracts.ts
export const CONTRACTS = {
  [sepolia.id]: {
    fundContract: import.meta.env.VITE_FUND_CONTRACT,
    governanceContract: import.meta.env.VITE_GOV_CONTRACT,
    usdcToken: import.meta.env.VITE_USDC_ADDRESS,
  },
}
```

## 🚨 Error Handling

### Common Errors
- **Insufficient balance** - User doesn't have enough USDC
- **Insufficient allowance** - Need to approve USDC spending
- **Wrong network** - User not on Sepolia
- **No voting power** - User hasn't made donations
- **Proposal requirements** - Amount too low or project has no funds

### Error Messages
All errors are displayed using `react-hot-toast` with user-friendly messages.

## 📱 Responsive Design

- **Mobile-first** approach with Tailwind CSS
- **Responsive charts** with Chart.js
- **Touch-friendly** buttons and forms
- **Adaptive layouts** for all screen sizes

## 🔒 Security Features

- **Input validation** on all forms
- **Contract validation** before transactions
- **Network verification** before operations
- **Transaction confirmation** required

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Deploy to Vercel
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

## 📊 Analytics

### Chart.js Integration
- **Pie charts** for donation distribution
- **Real-time updates** from contract data
- **Responsive design** for all devices

### Data Sources
- **Contract events** for real-time updates
- **Contract state** for current values
- **User interactions** for analytics

## 🔄 State Management

### React Query
- **Automatic caching** of contract data
- **Background refetching** for real-time updates
- **Optimistic updates** for better UX

### Local State
- **Form data** management
- **UI state** (loading, errors)
- **Transaction status** tracking

## 🧪 Testing

### Contract Integration
- All contract calls are tested
- Error scenarios handled
- Transaction flows validated

### UI Testing
- Responsive design verified
- User interactions tested
- Error states validated

## 📚 Additional Resources

- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## 🆘 Troubleshooting

### Common Issues

1. **"Wrong Network" banner**
   - Switch to Sepolia testnet in MetaMask
   - Add Sepolia network if not present

2. **"Insufficient balance"**
   - Get Sepolia ETH from faucet
   - Get test USDC by minting (if owner)

3. **"Transaction failed"**
   - Check gas fees
   - Ensure sufficient ETH for gas
   - Verify contract addresses

4. **"No voting power"**
   - Make a donation first
   - Check minimum requirements

### Support
- Check browser console for errors
- Verify contract addresses in `.env`
- Ensure MetaMask is connected
- Check network status

