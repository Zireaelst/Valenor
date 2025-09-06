# Valenor Smart Contracts

Smart contracts for the Valenor Decentralized Autonomous Social Fund on Ethereum Sepolia testnet.

## 📋 Contract Overview

### Core Contracts
- **TestUSDC**: ERC20 test token for USDC simulation
- **FundContract**: Manages USDC donations and milestone-based fund releases
- **GovernanceContract**: Handles proposals and voting for fund releases

### Legacy Contract
- **ValenorSocialFund**: Original social fund contract (legacy)

## 🚀 Quick Start

### Prerequisites
```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your values
```

### Compile Contracts
```bash
npm run compile
```

### Run Tests
```bash
npm test
```

## 📦 Available Scripts

### Deployment Scripts
```bash
# Deploy to Sepolia
npm run deploy:usdc:sepolia      # Deploy TestUSDC
npm run deploy:fund:sepolia      # Deploy FundContract
npm run deploy:governance:sepolia # Deploy GovernanceContract

# Deploy to local network
npm run deploy:usdc:local
npm run deploy:fund:local
npm run deploy:governance:local
```

### Verification Scripts
```bash
# Verify contracts on Etherscan (replace placeholders with actual addresses)
npm run verify:usdc              # Verify TestUSDC
npm run verify:fund              # Verify FundContract
npm run verify:gov               # Verify GovernanceContract
```

### Utility Scripts
```bash
npm run check:balance            # Check ETH balance on Sepolia
npm run estimate:gas             # Estimate gas costs
npm run node                     # Start local Hardhat node
npm run clean                    # Clean build artifacts
```

## 🔍 Contract Verification

### Quick Verification Commands
```bash
# Replace placeholders with actual deployed addresses
npm run verify:usdc              # hardhat verify --network sepolia <USDC_ADDRESS>
npm run verify:fund              # hardhat verify --network sepolia <FUND_ADDRESS> <USDC_ADDRESS>
npm run verify:gov               # hardhat verify --network sepolia <GOV_ADDRESS> <FUND_ADDRESS>
```

### Manual Verification
```bash
# TestUSDC (no constructor arguments)
npx hardhat verify --network sepolia <USDC_ADDRESS>

# FundContract (requires USDC address)
npx hardhat verify --network sepolia <FUND_ADDRESS> <USDC_ADDRESS>

# GovernanceContract (requires FundContract address)
npx hardhat verify --network sepolia <GOV_ADDRESS> <FUND_ADDRESS>
```

**📖 For detailed verification instructions, see [VERIFICATION_README.md](./VERIFICATION_README.md)**

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Individual contract tests
npx hardhat test test/TestUSDC.test.js
npx hardhat test test/FundContract.test.js
npx hardhat test test/GovernanceContract.test.js

# Integration tests
npx hardhat test test/SepoliaIntegration.test.js
```

### Test Coverage
- ✅ **TestUSDC**: 13 tests - Token functionality, minting, burning, transfers
- ✅ **FundContract**: 25 tests - Donations, milestone releases, access control
- ✅ **GovernanceContract**: 32 tests - Proposals, voting, execution
- ✅ **Integration Tests**: 9 tests - Complete workflow and security validations

## 📚 Documentation

### Contract Documentation
- [TestUSDC Documentation](./TESTUSDC_README.md)
- [FundContract Documentation](./FUND_CONTRACT_README.md)
- [GovernanceContract Documentation](./GOVERNANCE_CONTRACT_README.md)

### Setup and Deployment
- [Hardhat Setup Guide](./HARDHAT_SETUP.md)
- [Setup Complete Summary](./SETUP_COMPLETE.md)
- [Verification Guide](./VERIFICATION_README.md)

### Testing
- [Sepolia Integration Tests](./SEPOLIA_INTEGRATION_TESTS_README.md)

## 🔧 Configuration

### Environment Variables
```env
# Required for deployment
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Contract addresses (update after deployment)
USDC_TOKEN_ADDRESS=0x...
FUND_CONTRACT_ADDRESS=0x...
GOVERNANCE_CONTRACT_ADDRESS=0x...
```

### Network Configuration
- **Sepolia Testnet**: Chain ID 11155111
- **Solidity Version**: ^0.8.19
- **Optimizer**: Enabled (200 runs)

## 🏗️ Architecture

### Contract Dependencies
```
TestUSDC (ERC20 Token)
    ↓
FundContract (Donation Management)
    ↓
GovernanceContract (Proposal & Voting)
```

### Key Features
- **USDC Donations**: Accept donations to specific projects
- **Milestone Releases**: Governance-controlled fund releases
- **Proposal System**: Create and vote on fund release proposals
- **Voting Power**: Proportional to donation amounts
- **Security**: ReentrancyGuard, access controls, input validation

## 🛡️ Security Features

### Access Control
- **Owner Functions**: Contract administration
- **Governance Functions**: Proposal execution
- **Public Functions**: Donations, voting, proposals

### Security Measures
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Input Validation**: Comprehensive parameter validation
- **Access Control**: Role-based permissions
- **Emergency Controls**: Owner can withdraw funds in emergencies

## 📊 Gas Usage

### Estimated Gas Costs (Sepolia)
- **TestUSDC Deployment**: ~1,200,000 gas
- **FundContract Deployment**: ~1,500,000 gas
- **GovernanceContract Deployment**: ~2,000,000 gas
- **Donation**: ~80,000 gas
- **Proposal Creation**: ~150,000 gas
- **Voting**: ~80,000 gas
- **Proposal Execution**: ~120,000 gas

## 🚨 Important Notes

### Testnet Only
- ⚠️ **These contracts are for Sepolia testnet only**
- ⚠️ **TestUSDC is a mock token, not real USDC**
- ⚠️ **Do not use on mainnet without proper testing**

### Security
- ✅ **All contracts have been tested extensively**
- ✅ **Security best practices implemented**
- ✅ **Access controls and input validation in place**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built for Valenor - Decentralized Autonomous Social Fund**

*Smart contracts for transparent, decentralized social impact funding.*
