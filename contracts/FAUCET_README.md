# TestUSDC Faucet Script

This script allows you to mint TestUSDC tokens to any address for testing purposes.

## Prerequisites

1. **Deployed TestUSDC Contract**: Make sure you have deployed the TestUSDC contract and have its address
2. **Environment Setup**: Set the `USDC_TOKEN_ADDRESS` in your `.env` file
3. **Owner Access**: You must be the contract owner to mint tokens
4. **Network Configuration**: Ensure your Hardhat network is properly configured

## Usage

### TypeScript Version
```bash
npx hardhat run scripts/faucetTestUSDC.ts --network <network> -- <recipient> <amount>
```

### JavaScript Version
```bash
npx hardhat run scripts/faucetTestUSDC.js --network <network> -- <recipient> <amount>
```

## Examples

### Mint 1000 USDC to an address on Sepolia
```bash
npx hardhat run scripts/faucetTestUSDC.js --network sepolia -- 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 1000
```

### Mint 500 USDC to an address on localhost
```bash
npx hardhat run scripts/faucetTestUSDC.js --network localhost -- 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 500
```

## Parameters

- **recipient**: The Ethereum address to receive the tokens (must be a valid address)
- **amount**: The amount of USDC tokens to mint (positive number)

## What the Script Does

1. **Validates Input**: Checks if recipient address is valid and amount is positive
2. **Checks Ownership**: Verifies that the caller is the contract owner
3. **Logs Balance Before**: Shows the recipient's balance before minting
4. **Mints Tokens**: Calls `TestUSDC.mint(recipient, amount)`
5. **Logs Balance After**: Shows the recipient's balance after minting
6. **Verifies Success**: Confirms the mint operation was successful
7. **Shows Summary**: Displays transaction details and final balances

## Output Example

```
🚰 TestUSDC Faucet Script
==========================
Recipient: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
Amount: 1000 USDC
TestUSDC Contract Address: 0x1234...
Faucet Operator: 0x5678...

📊 Balance Check (Before)
=========================
Recipient balance: 0.0 USDC
Mint amount (wei): 1000000000000
Total supply: 1000000.0 USDC

🔄 Minting Tokens...
===================
Transaction hash: 0xabcd...
Waiting for confirmation...
✅ Transaction confirmed!
Block number: 12345678
Gas used: 45000

📊 Balance Check (After)
========================
Recipient balance: 1000.0 USDC
Total supply: 1001000.0 USDC
Balance increase: 1000.0 USDC
Supply increase: 1000.0 USDC

✅ Faucet operation successful!
Tokens minted successfully to recipient

📋 Summary
==========
Recipient: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
Amount minted: 1000 USDC
Transaction hash: 0xabcd...
New balance: 1000.0 USDC
New total supply: 1001000.0 USDC

🎉 Faucet script completed successfully!
```

## Error Handling

The script includes comprehensive error handling for common issues:

- **Invalid Address**: Checks if recipient address is valid
- **Invalid Amount**: Validates that amount is a positive number
- **Missing Environment**: Checks if USDC_TOKEN_ADDRESS is set
- **Permission Denied**: Verifies caller is the contract owner
- **Transaction Failures**: Handles gas, nonce, and other transaction errors

## Security Notes

- Only the contract owner can mint tokens
- The script validates all inputs before making transactions
- All operations are logged for transparency
- The script includes balance verification to ensure successful minting

## Troubleshooting

### "USDC_TOKEN_ADDRESS not found"
- Make sure you have a `.env` file in the contracts directory
- Set `USDC_TOKEN_ADDRESS=0x...` with your deployed contract address

### "Only the contract owner can mint tokens"
- Deploy the TestUSDC contract with your account
- Or transfer ownership to your account using `transferOwnership()`

### "Insufficient funds"
- Make sure you have enough ETH for gas fees
- Check your account balance on the network

### "Invalid recipient address"
- Ensure the address is a valid Ethereum address
- Check for typos in the address

## Integration with Other Scripts

This faucet script can be used in conjunction with other testing scripts:

1. **Deploy TestUSDC**: Use `deployTestUSDC.ts` to deploy the contract
2. **Mint Tokens**: Use this faucet script to distribute tokens
3. **Test Contracts**: Use other scripts to test contract functionality
4. **Check Balances**: Use `checkBalance.js` to verify token balances
