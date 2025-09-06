# Valenor Hardhat Setup - Ethereum Sepolia

This document provides a complete guide for setting up and using the Hardhat development environment for Valenor smart contracts on Ethereum Sepolia testnet.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- Ethereum Sepolia testnet ETH (for deployment)
- Etherscan API key (for contract verification)

### Installation

1. **Install dependencies**:
```bash
cd contracts
npm install
```

2. **Set up environment variables**:
```bash
cp env.example .env
# Edit .env with your values
```

3. **Compile contracts**:
```bash
npm run compile
```

4. **Run tests**:
```bash
npm test
```

## 🔧 Configuration

### Environment Variables (.env)

Create a `.env` file in the contracts directory with the following variables:

```env
# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Ethereum Sepolia RPC URL
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Getting Required Keys

#### 1. Private Key
- Export your private key from MetaMask or your wallet
- **Important**: Never commit your private key to version control
- Use a dedicated account for testing

#### 2. Sepolia RPC URL
- **Infura**: Get free RPC URL from [Infura](https://infura.io/)
- **Alchemy**: Get free RPC URL from [Alchemy](https://alchemy.com/)
- **Public RPC**: Use public endpoints (less reliable)

#### 3. Etherscan API Key
- Create account at [Etherscan](https://etherscan.io/)
- Generate API key from your account settings
- Used for contract verification

### Sepolia Testnet ETH

Get testnet ETH from faucets:
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Faucet](https://sepoliafaucet.com/)
- [Chainlink Faucet](https://faucets.chain.link/sepolia)

## 📁 Project Structure

```
contracts/
├── contracts/           # Solidity contracts
│   └── ValenorSocialFund.sol
├── scripts/            # Deployment scripts
│   └── deploy.js
├── test/              # Test files
│   └── ValenorSocialFund.test.js
├── hardhat.config.js  # Hardhat configuration
├── package.json       # Dependencies and scripts
├── env.example        # Environment variables template
└── .env              # Your environment variables (create this)
```

## 🛠️ Available Scripts

### Development
```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Start local Hardhat node
npm run node

# Clean artifacts and cache
npm run clean
```

### Deployment
```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia

# Deploy to local network
npm run deploy:local
```

### Verification
```bash
# Verify contract on Etherscan
npm run verify:sepolia <CONTRACT_ADDRESS>
```

## 🌐 Network Configuration

### Sepolia Testnet
- **Chain ID**: 11155111
- **RPC URL**: Configured via `SEPOLIA_RPC_URL`
- **Explorer**: [Etherscan Sepolia](https://sepolia.etherscan.io/)

### Local Development
- **Chain ID**: 1337 (Hardhat default)
- **RPC URL**: http://127.0.0.1:8545
- **Explorer**: N/A (use Hardhat console)

## 📝 Deployment Process

### 1. Prepare Environment
```bash
# Ensure you have testnet ETH
# Check balance on Sepolia Etherscan
```

### 2. Deploy Contract
```bash
npm run deploy:sepolia
```

### 3. Verify Contract (Optional)
```bash
npm run verify:sepolia <CONTRACT_ADDRESS>
```

### 4. Test Deployment
- Check contract on Etherscan
- Interact with contract functions
- Verify events are emitted correctly

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Test Specific File
```bash
npx hardhat test test/ValenorSocialFund.test.js
```

### Test with Gas Reporting
```bash
REPORT_GAS=true npm test
```

### Coverage Report
```bash
npx hardhat coverage
```

## 🔍 Contract Verification

### Automatic Verification
Contracts are automatically verified during deployment if `ETHERSCAN_API_KEY` is set.

### Manual Verification
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### Verify with Constructor Arguments
```bash
npx hardhat verify --network sepolia 0x1234... "arg1" "arg2"
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "Insufficient funds"
- Ensure you have Sepolia ETH in your account
- Check gas price and limit

#### 2. "Invalid private key"
- Verify private key format (no 0x prefix)
- Ensure account has sufficient balance

#### 3. "Network connection failed"
- Check RPC URL is correct
- Verify network is accessible
- Try different RPC provider

#### 4. "Contract verification failed"
- Ensure constructor arguments are correct
- Check if contract is already verified
- Verify API key has correct permissions

### Debug Commands

```bash
# Check network connection
npx hardhat console --network sepolia

# Get account balance
npx hardhat run scripts/checkBalance.js --network sepolia

# Check gas prices
npx hardhat run scripts/checkGas.js --network sepolia
```

## 📊 Gas Optimization

### Compiler Settings
```javascript
solidity: {
  version: "0.8.19",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200  // Optimize for deployment cost
    }
  }
}
```

### Gas Estimation
```bash
# Estimate deployment gas
npx hardhat run scripts/estimateGas.js --network sepolia
```

## 🔒 Security Best Practices

### Environment Security
- Never commit `.env` file
- Use separate accounts for testing
- Rotate API keys regularly
- Use hardware wallets for mainnet

### Contract Security
- Run comprehensive tests
- Use static analysis tools
- Consider formal verification
- Audit before mainnet deployment

## 📚 Additional Resources

### Documentation
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Ethereum Sepolia](https://sepolia.dev/)

### Tools
- [Etherscan Sepolia](https://sepolia.etherscan.io/)
- [Remix IDE](https://remix.ethereum.org/)
- [Tenderly](https://tenderly.co/)

### Community
- [Hardhat Discord](https://hardhat.org/discord)
- [Ethereum Stack Exchange](https://ethereum.stackexchange.com/)

## 🎯 Next Steps

1. **Deploy to Sepolia**: Test your contracts on testnet
2. **Frontend Integration**: Connect your dApp to deployed contracts
3. **Mainnet Preparation**: Plan for mainnet deployment
4. **Monitoring**: Set up contract monitoring and alerts

---

**Happy coding! 🚀**
