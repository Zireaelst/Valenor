# TestUSDC Contract

A test USDC token implementation for Ethereum Sepolia testnet, based on OpenZeppelin's ERC20 standard.

## 🌟 Features

- **ERC20 Standard**: Full ERC20 token implementation
- **6 Decimals**: Matches real USDC decimal precision
- **Mintable**: Owner can mint new tokens
- **Burnable**: Users can burn their own tokens
- **Batch Operations**: Support for batch minting
- **Access Control**: Owner-only administrative functions

## 📋 Contract Details

### Token Information
- **Name**: Test USDC
- **Symbol**: tUSDC
- **Decimals**: 6
- **Initial Supply**: 1,000,000 tUSDC (minted to deployer)

### Constructor
```solidity
constructor() ERC20("Test USDC", "tUSDC") Ownable()
```
- Mints 1,000,000 tUSDC to the deployer
- Sets deployer as owner

## 🔧 Functions

### Minting Functions

#### `mint(address to, uint256 amount)`
- **Access**: Owner only
- **Purpose**: Mint tokens to a specific address
- **Events**: `Transfer(address(0), to, amount)`

#### `mintBatch(address[] recipients, uint256[] amounts)`
- **Access**: Owner only
- **Purpose**: Mint tokens to multiple addresses
- **Requirements**: Arrays must have same length
- **Events**: Multiple `Transfer` events

### Burning Functions

#### `burn(uint256 amount)`
- **Access**: Public
- **Purpose**: Burn caller's tokens
- **Events**: `Transfer(caller, address(0), amount)`

#### `burnFrom(address from, uint256 amount)`
- **Access**: Owner only
- **Purpose**: Burn tokens from a specific address
- **Requirements**: Requires allowance from the address
- **Events**: `Transfer(from, address(0), amount)`

### Standard ERC20 Functions
- `transfer(address to, uint256 amount)`
- `transferFrom(address from, address to, uint256 amount)`
- `approve(address spender, uint256 amount)`
- `allowance(address owner, address spender)`
- `balanceOf(address account)`
- `totalSupply()`

### Access Control Functions
- `owner()` - Get current owner
- `transferOwnership(address newOwner)` - Transfer ownership
- `renounceOwnership()` - Renounce ownership

## 🚀 Deployment

### Prerequisites
1. Set up environment variables in `.env`
2. Ensure you have Sepolia ETH for gas fees

### Deploy to Sepolia
```bash
npm run deploy:usdc:sepolia
```

### Deploy to Local Network
```bash
npm run deploy:usdc:local
```

### Deploy to Hardhat Network
```bash
npx hardhat run scripts/deployTestUSDC.ts
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
- ✅ Deployment and initialization
- ✅ Token details (name, symbol, decimals)
- ✅ Initial supply minting
- ✅ Owner-only minting
- ✅ Batch minting
- ✅ Token burning
- ✅ Standard ERC20 transfers
- ✅ Access control
- ✅ Error conditions

## 📊 Usage Examples

### Basic Deployment
```javascript
const TestUSDC = await ethers.getContractFactory("TestUSDC");
const testUSDC = await TestUSDC.deploy();
await testUSDC.waitForDeployment();
```

### Minting Tokens
```javascript
// Mint to a single address
await testUSDC.mint(recipientAddress, ethers.parseUnits("1000", 6));

// Batch minting
const recipients = [addr1, addr2, addr3];
const amounts = [
  ethers.parseUnits("1000", 6),
  ethers.parseUnits("2000", 6),
  ethers.parseUnits("3000", 6)
];
await testUSDC.mintBatch(recipients, amounts);
```

### Standard Transfers
```javascript
// Direct transfer
await testUSDC.transfer(recipientAddress, ethers.parseUnits("100", 6));

// Approved transfer
await testUSDC.approve(spenderAddress, ethers.parseUnits("100", 6));
await testUSDC.connect(spender).transferFrom(ownerAddress, recipientAddress, ethers.parseUnits("100", 6));
```

### Burning Tokens
```javascript
// Burn own tokens
await testUSDC.burn(ethers.parseUnits("100", 6));

// Owner burn from another address (requires approval)
await testUSDC.connect(holder).approve(ownerAddress, ethers.parseUnits("100", 6));
await testUSDC.burnFrom(holderAddress, ethers.parseUnits("100", 6));
```

## 🔒 Security Features

### Access Control
- **Owner Functions**: Minting, burning from others
- **Public Functions**: Standard ERC20 operations, self-burning
- **Ownership Transfer**: Secure ownership management

### Input Validation
- **Array Length Check**: Batch operations validate array lengths
- **Balance Checks**: Burning validates sufficient balance
- **Allowance Checks**: TransferFrom validates allowances

### OpenZeppelin Security
- **Reentrancy Protection**: Inherited from OpenZeppelin
- **Safe Math**: Built-in overflow protection
- **Standard Patterns**: Battle-tested implementations

## 📝 Events

### Transfer Events
```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
```

### Approval Events
```solidity
event Approval(address indexed owner, address indexed spender, uint256 value);
```

### Ownership Events
```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
```

## 🔧 Integration

### Frontend Integration
```javascript
// Get contract instance
const testUSDC = new ethers.Contract(contractAddress, abi, signer);

// Check balance
const balance = await testUSDC.balanceOf(userAddress);
const formattedBalance = ethers.formatUnits(balance, 6);

// Mint tokens (owner only)
await testUSDC.mint(recipientAddress, ethers.parseUnits("1000", 6));
```

### Backend Integration
```javascript
// Monitor events
testUSDC.on("Transfer", (from, to, amount) => {
  console.log(`Transfer: ${ethers.formatUnits(amount, 6)} tUSDC from ${from} to ${to}`);
});

// Get total supply
const totalSupply = await testUSDC.totalSupply();
console.log(`Total Supply: ${ethers.formatUnits(totalSupply, 6)} tUSDC`);
```

## 📊 Contract Statistics

### Gas Usage
- **Deployment**: ~1,200,000 gas
- **Mint**: ~50,000 gas
- **Transfer**: ~50,000 gas
- **Burn**: ~30,000 gas

### Storage Layout
- **ERC20 State**: Standard ERC20 storage
- **Ownable State**: Owner address
- **Custom State**: None (minimal implementation)

## 🚨 Important Notes

### Testnet Only
- ⚠️ **This is a test token for development only**
- ⚠️ **Do not use on mainnet**
- ⚠️ **No real value or backing**

### Decimal Handling
- Always use `ethers.parseUnits(amount, 6)` for amounts
- Always use `ethers.formatUnits(amount, 6)` for display
- 1 tUSDC = 1,000,000 units (6 decimals)

### Ownership
- Deployer becomes owner automatically
- Owner can mint unlimited tokens
- Owner can burn tokens from any address (with approval)

## 🆘 Troubleshooting

### Common Issues

#### "Insufficient allowance"
- Ensure approval is given before `transferFrom` or `burnFrom`
- Check allowance amount is sufficient

#### "ERC20: burn amount exceeds balance"
- Verify account has sufficient balance
- Check decimal precision (6 decimals)

#### "Ownable: caller is not the owner"
- Only owner can mint or burn from others
- Transfer ownership if needed

### Debug Commands
```bash
# Check contract info
npx hardhat console --network sepolia
> const contract = await ethers.getContractAt("TestUSDC", "0x...")
> await contract.name()
> await contract.totalSupply()

# Check balances
> await contract.balanceOf("0x...")
```

## 📚 Resources

- [OpenZeppelin ERC20 Documentation](https://docs.openzeppelin.com/contracts/4.x/erc20)
- [OpenZeppelin Ownable Documentation](https://docs.openzeppelin.com/contracts/4.x/access-control)
- [Ethereum ERC20 Standard](https://eips.ethereum.org/EIPS/eip-20)

---

**Built for Valenor - Decentralized Autonomous Social Fund**
