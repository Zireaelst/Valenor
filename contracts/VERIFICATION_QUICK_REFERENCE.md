# Contract Verification Quick Reference

## 🚀 NPM Scripts

### Verification Commands
```bash
# Replace placeholders with actual deployed addresses
npm run verify:usdc              # Verify TestUSDC
npm run verify:fund              # Verify FundContract  
npm run verify:gov               # Verify GovernanceContract
```

## 📋 Manual Commands

### TestUSDC Verification
```bash
npx hardhat verify --network sepolia <USDC_ADDRESS>
```

### FundContract Verification
```bash
npx hardhat verify --network sepolia <FUND_ADDRESS> <USDC_ADDRESS>
```

### GovernanceContract Verification
```bash
npx hardhat verify --network sepolia <GOV_ADDRESS> <FUND_ADDRESS>
```

## 🔧 Prerequisites

### Environment Variables Required
```env
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Contract Addresses Needed
```env
USDC_TOKEN_ADDRESS=0x...
FUND_CONTRACT_ADDRESS=0x...
GOVERNANCE_CONTRACT_ADDRESS=0x...
```

## 📝 Example Usage

### Step 1: Deploy Contracts
```bash
npm run deploy:usdc:sepolia      # Get USDC_ADDRESS
npm run deploy:fund:sepolia      # Get FUND_ADDRESS  
npm run deploy:governance:sepolia # Get GOV_ADDRESS
```

### Step 2: Update Scripts
Edit `package.json` and replace placeholders:
```json
{
  "scripts": {
    "verify:usdc": "hardhat verify --network sepolia 0x1234...",
    "verify:fund": "hardhat verify --network sepolia 0x5678... 0x1234...",
    "verify:gov": "hardhat verify --network sepolia 0x9abc... 0x5678..."
  }
}
```

### Step 3: Verify Contracts
```bash
npm run verify:usdc
npm run verify:fund
npm run verify:gov
```

## ✅ Success Indicators

### Successful Verification
```
Successfully submitted source code for contract
0x1234567890123456789012345678901234567890 at 0x...
```

### Already Verified
```
Contract source code already verified
```

## 🚨 Common Issues

### "Fail - Unable to verify"
- Check constructor arguments
- Verify network (sepolia)
- Confirm API key is valid
- Ensure contract is deployed

### "Fail - Bytecode doesn't match"
- Use same Solidity version
- Check optimizer settings
- Verify source code matches

---

**Quick reference for contract verification on Etherscan**
