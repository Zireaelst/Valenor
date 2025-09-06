# Contract Verification Guide

This guide explains how to verify smart contracts on Etherscan for the Valenor Decentralized Autonomous Social Fund.

## 🔍 Prerequisites

### Required Environment Variables
Make sure you have the following in your `.env` file:
```env
# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Ethereum Sepolia RPC URL
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Contract addresses (update after deployment)
USDC_TOKEN_ADDRESS=0x...
FUND_CONTRACT_ADDRESS=0x...
GOVERNANCE_CONTRACT_ADDRESS=0x...
```

### Getting Etherscan API Key
1. Go to [Etherscan.io](https://etherscan.io)
2. Create an account or log in
3. Go to API Keys section
4. Create a new API key
5. Add it to your `.env` file

## 🚀 Deployment Order

Deploy contracts in this specific order:

1. **TestUSDC** (no dependencies)
2. **FundContract** (depends on TestUSDC)
3. **GovernanceContract** (depends on FundContract)

## 📋 Verification Commands

### 1. Verify TestUSDC Contract

```bash
# Replace <USDC_ADDRESS> with actual deployed address
npm run verify:usdc
```

**Manual Command:**
```bash
npx hardhat verify --network sepolia <USDC_ADDRESS>
```

**Example:**
```bash
npx hardhat verify --network sepolia 0x1234567890123456789012345678901234567890
```

### 2. Verify FundContract

```bash
# Replace <FUND_ADDRESS> and <USDC_ADDRESS> with actual addresses
npm run verify:fund
```

**Manual Command:**
```bash
npx hardhat verify --network sepolia <FUND_ADDRESS> <USDC_ADDRESS>
```

**Example:**
```bash
npx hardhat verify --network sepolia 0x2345678901234567890123456789012345678901 0x1234567890123456789012345678901234567890
```

### 3. Verify GovernanceContract

```bash
# Replace <GOV_ADDRESS> and <FUND_ADDRESS> with actual addresses
npm run verify:gov
```

**Manual Command:**
```bash
npx hardhat verify --network sepolia <GOV_ADDRESS> <FUND_ADDRESS>
```

**Example:**
```bash
npx hardhat verify --network sepolia 0x3456789012345678901234567890123456789012 0x2345678901234567890123456789012345678901
```

## 🔧 Step-by-Step Verification Process

### Step 1: Deploy TestUSDC
```bash
# Deploy TestUSDC
npm run deploy:usdc:sepolia

# Copy the deployed address from output
# Example: TestUSDC deployed to: 0x1234567890123456789012345678901234567890
```

### Step 2: Update Environment Variables
```bash
# Update .env file with TestUSDC address
USDC_TOKEN_ADDRESS=0x1234567890123456789012345678901234567890
```

### Step 3: Deploy FundContract
```bash
# Deploy FundContract
npm run deploy:fund:sepolia

# Copy the deployed address from output
# Example: FundContract deployed to: 0x2345678901234567890123456789012345678901
```

### Step 4: Update Environment Variables
```bash
# Update .env file with FundContract address
FUND_CONTRACT_ADDRESS=0x2345678901234567890123456789012345678901
```

### Step 5: Deploy GovernanceContract
```bash
# Deploy GovernanceContract
npm run deploy:governance:sepolia

# Copy the deployed address from output
# Example: GovernanceContract deployed to: 0x3456789012345678901234567890123456789012
```

### Step 6: Update Environment Variables
```bash
# Update .env file with GovernanceContract address
GOVERNANCE_CONTRACT_ADDRESS=0x3456789012345678901234567890123456789012
```

### Step 7: Verify All Contracts

#### Verify TestUSDC
```bash
# Update the script with actual address
npm run verify:usdc
# Or manually:
npx hardhat verify --network sepolia 0x1234567890123456789012345678901234567890
```

#### Verify FundContract
```bash
# Update the script with actual addresses
npm run verify:fund
# Or manually:
npx hardhat verify --network sepolia 0x2345678901234567890123456789012345678901 0x1234567890123456789012345678901234567890
```

#### Verify GovernanceContract
```bash
# Update the script with actual addresses
npm run verify:gov
# Or manually:
npx hardhat verify --network sepolia 0x3456789012345678901234567890123456789012 0x2345678901234567890123456789012345678901
```

## 🛠️ Troubleshooting

### Common Issues

#### "Contract source code already verified"
This means the contract is already verified on Etherscan. You can view it at:
```
https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>
```

#### "Fail - Unable to verify"
**Possible causes:**
1. **Wrong constructor arguments**: Double-check the addresses
2. **Network mismatch**: Ensure you're using `--network sepolia`
3. **API key issues**: Verify your Etherscan API key
4. **Contract not deployed**: Ensure contract is actually deployed

#### "Fail - Bytecode doesn't match"
**Possible causes:**
1. **Different Solidity version**: Ensure using same version as deployment
2. **Different compiler settings**: Check optimizer settings
3. **Different source code**: Ensure using exact same source code

### Debug Commands

#### Check Contract Deployment
```bash
# Check if contract exists on Sepolia
npx hardhat console --network sepolia
> const contract = await ethers.getContractAt("TestUSDC", "0x...")
> await contract.name()
```

#### Verify Network Configuration
```bash
# Check network configuration
npx hardhat console --network sepolia
> await ethers.provider.getNetwork()
```

#### Check API Key
```bash
# Test API key (replace with your key)
curl "https://api-sepolia.etherscan.io/api?module=account&action=balance&address=0x0000000000000000000000000000000000000000&tag=latest&apikey=YOUR_API_KEY"
```

## 📊 Verification Status

After successful verification, you can:

### View Verified Contracts
- **TestUSDC**: `https://sepolia.etherscan.io/address/<USDC_ADDRESS>`
- **FundContract**: `https://sepolia.etherscan.io/address/<FUND_ADDRESS>`
- **GovernanceContract**: `https://sepolia.etherscan.io/address/<GOV_ADDRESS>`

### Contract Features on Etherscan
- ✅ **Read Contract**: View and call read functions
- ✅ **Write Contract**: Interact with contract functions
- ✅ **Source Code**: View verified source code
- ✅ **ABI**: Download contract ABI
- ✅ **Events**: View contract events
- ✅ **Transactions**: View all transactions

## 🔄 Automated Verification

The deployment scripts include automatic verification:

### TestUSDC Deployment
```typescript
// Automatic verification in deployTestUSDC.ts
if (process.env.ETHERSCAN_API_KEY) {
  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: [],
  });
}
```

### FundContract Deployment
```typescript
// Automatic verification in deployFund.ts
if (process.env.ETHERSCAN_API_KEY) {
  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: [usdcAddress],
  });
}
```

### GovernanceContract Deployment
```typescript
// Automatic verification in deployGovernance.ts
if (process.env.ETHERSCAN_API_KEY) {
  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: [fundContractAddress],
  });
}
```

## 📝 Verification Checklist

### Before Verification
- [ ] Contract deployed successfully
- [ ] Etherscan API key configured
- [ ] Correct network (sepolia)
- [ ] Constructor arguments correct
- [ ] Source code matches deployment

### After Verification
- [ ] Contract shows as verified on Etherscan
- [ ] Source code is readable
- [ ] ABI is available
- [ ] Contract functions are callable
- [ ] Events are visible

## 🚨 Important Notes

### Security
- ⚠️ **Never commit private keys to version control**
- ⚠️ **Use environment variables for sensitive data**
- ⚠️ **Verify contracts on testnet before mainnet**

### Best Practices
- ✅ **Verify immediately after deployment**
- ✅ **Keep constructor arguments documented**
- ✅ **Test verification on testnet first**
- ✅ **Use descriptive contract names**

### Gas Optimization
- ✅ **Enable optimizer in hardhat.config.js**
- ✅ **Use appropriate optimizer runs (200)**
- ✅ **Test gas usage before deployment**

---

**Built for Valenor - Decentralized Autonomous Social Fund**

*This guide ensures all contracts are properly verified on Etherscan for transparency and trust.*
