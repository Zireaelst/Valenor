# FundContract

A smart contract for managing USDC donations and milestone-based fund releases for the Valenor Decentralized Autonomous Social Fund.

## 🌟 Features

- **USDC Donations**: Accept donations in USDC to specific projects
- **Milestone Releases**: Governance-controlled fund releases to recipients
- **Project Tracking**: Track donations and releases per project
- **Security**: ReentrancyGuard protection and access controls
- **Emergency Controls**: Owner can withdraw funds in emergencies

## 📋 Contract Details

### Constructor
```solidity
constructor(address _usdcToken)
```
- **Parameters**: `_usdcToken` - Address of the USDC ERC20 token
- **Requirements**: USDC token address cannot be zero
- **Initial State**: Owner becomes initial governance

### Core Functions

#### `donate(uint256 amount, uint256 projectId)`
- **Access**: Public
- **Purpose**: Donate USDC to a specific project
- **Requirements**: 
  - Amount > 0
  - Project ID > 0
  - Sufficient USDC balance and allowance
- **Effects**: 
  - Transfers USDC from donor to contract
  - Updates donation records
  - Emits `DonationReceived` event

#### `releaseMilestone(uint256 projectId, address recipient, uint256 amount)`
- **Access**: Governance only
- **Purpose**: Release milestone funds to a recipient
- **Requirements**:
  - Project ID > 0
  - Amount > 0
  - Valid recipient address
  - Sufficient contract balance
  - Amount ≤ available project funds
- **Effects**:
  - Transfers USDC to recipient
  - Updates release records
  - Emits `MilestoneReleased` event

### Governance Functions

#### `setGovernance(address _governance)`
- **Access**: Owner only
- **Purpose**: Set the governance contract address
- **Requirements**: Governance address cannot be zero
- **Events**: `GovernanceUpdated`

### View Functions

#### Donation Tracking
- `getDonation(address donor, uint256 projectId)` - Get donation amount
- `getProjectDonations(uint256 projectId)` - Get total project donations
- `getProjectReleased(uint256 projectId)` - Get total project releases
- `getProjectAvailable(uint256 projectId)` - Get available project funds

#### Contract State
- `getContractBalance()` - Get contract's USDC balance
- `totalDonations()` - Get total donations received
- `totalReleased()` - Get total funds released
- `governance()` - Get governance address

### Emergency Functions

#### `emergencyWithdraw()`
- **Access**: Owner only
- **Purpose**: Withdraw all USDC from contract
- **Use Case**: Emergency situations only

#### `emergencyWithdrawAmount(uint256 amount)`
- **Access**: Owner only
- **Purpose**: Withdraw specific amount of USDC
- **Requirements**: Amount ≤ contract balance

## 🚀 Deployment

### Prerequisites
1. Deploy TestUSDC token first
2. Set `USDC_TOKEN_ADDRESS` in `.env` file
3. Ensure you have Sepolia ETH for gas fees

### Deploy to Sepolia
```bash
npm run deploy:fund:sepolia
```

### Deploy to Local Network
```bash
npm run deploy:fund:local
```

### Deploy to Hardhat Network
```bash
npx hardhat run scripts/deployFund.ts
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
- ✅ Deployment and initialization
- ✅ USDC donations to projects
- ✅ Multiple donations to same project
- ✅ Donations to different projects
- ✅ Milestone releases by governance
- ✅ Access control (governance only)
- ✅ Input validation
- ✅ Emergency functions
- ✅ View functions
- ✅ Error conditions

## 📊 Usage Examples

### Basic Deployment
```javascript
const FundContract = await ethers.getContractFactory("FundContract");
const fundContract = await FundContract.deploy(usdcTokenAddress);
await fundContract.waitForDeployment();
```

### Making Donations
```javascript
// Approve USDC spending
await usdcToken.approve(fundContractAddress, ethers.parseUnits("1000", 6));

// Donate to project
await fundContract.donate(ethers.parseUnits("1000", 6), 1);
```

### Releasing Milestones
```javascript
// Only governance can release funds
await fundContract.connect(governance).releaseMilestone(
  1, // project ID
  recipientAddress, // recipient
  ethers.parseUnits("500", 6) // amount
);
```

### Setting Governance
```javascript
// Owner sets governance contract
await fundContract.setGovernance(governanceContractAddress);
```

## 🔒 Security Features

### Access Control
- **Owner Functions**: Set governance, emergency withdraw
- **Governance Functions**: Release milestone funds
- **Public Functions**: Donate, view functions

### Reentrancy Protection
- **nonReentrant modifier** on `donate()` and `releaseMilestone()`
- Prevents reentrancy attacks

### Input Validation
- **Zero Address Checks**: USDC token, governance, recipient
- **Amount Validation**: Must be > 0
- **Project ID Validation**: Must be > 0
- **Balance Checks**: Sufficient funds and allowances

### Emergency Controls
- **Emergency Withdraw**: Owner can withdraw all funds
- **Emergency Withdraw Amount**: Owner can withdraw specific amount
- **Use Case**: Only for emergency situations

## 📝 Events

### DonationReceived
```solidity
event DonationReceived(
    address indexed donor,
    uint256 indexed projectId,
    uint256 amount,
    uint256 timestamp
);
```

### MilestoneReleased
```solidity
event MilestoneReleased(
    uint256 indexed projectId,
    address indexed recipient,
    uint256 amount,
    uint256 timestamp
);
```

### GovernanceUpdated
```solidity
event GovernanceUpdated(
    address indexed oldGovernance,
    address indexed newGovernance
);
```

## 🔧 Integration

### Frontend Integration
```javascript
// Get contract instance
const fundContract = new ethers.Contract(contractAddress, abi, signer);

// Check project donations
const donations = await fundContract.getProjectDonations(projectId);
const available = await fundContract.getProjectAvailable(projectId);

// Make donation
await fundContract.donate(amount, projectId);
```

### Backend Integration
```javascript
// Monitor events
fundContract.on("DonationReceived", (donor, projectId, amount, timestamp) => {
  console.log(`Donation: ${ethers.formatUnits(amount, 6)} USDC to project ${projectId}`);
});

// Check contract state
const totalDonations = await fundContract.totalDonations();
const totalReleased = await fundContract.totalReleased();
```

## 📊 Contract Statistics

### Gas Usage
- **Deployment**: ~1,500,000 gas
- **Donate**: ~80,000 gas
- **Release Milestone**: ~60,000 gas
- **Set Governance**: ~50,000 gas

### Storage Layout
- **USDC Token**: Immutable address
- **Governance**: Mutable address
- **Donations**: Nested mapping (donor → project → amount)
- **Project Totals**: Mapping (project → total donations/releases)
- **Global Totals**: Total donations and releases

## 🚨 Important Notes

### USDC Requirements
- ⚠️ **USDC token must be ERC20 compliant**
- ⚠️ **Donors must approve contract to spend USDC**
- ⚠️ **Contract must have sufficient USDC balance for releases**

### Governance
- **Initial Governance**: Contract owner
- **Governance Change**: Only owner can set new governance
- **Milestone Releases**: Only governance can release funds

### Project Management
- **Project IDs**: Must be > 0
- **Donation Tracking**: Per donor, per project
- **Release Tracking**: Per project, total released
- **Available Funds**: Donations - Releases per project

## 🆘 Troubleshooting

### Common Issues

#### "ERC20: insufficient allowance"
- Ensure donor has approved contract to spend USDC
- Check approval amount is sufficient

#### "ERC20: transfer amount exceeds balance"
- Verify donor has sufficient USDC balance
- Check USDC token address is correct

#### "FundContract: Only governance can call this function"
- Only governance address can release milestone funds
- Set governance address if needed

#### "FundContract: Amount exceeds available project funds"
- Check project has sufficient donations
- Verify amount ≤ (donations - releases) for project

### Debug Commands
```bash
# Check contract info
npx hardhat console --network sepolia
> const contract = await ethers.getContractAt("FundContract", "0x...")
> await contract.usdcToken()
> await contract.governance()

# Check project status
> await contract.getProjectDonations(1)
> await contract.getProjectAvailable(1)
```

## 📚 Resources

- [OpenZeppelin ERC20 Documentation](https://docs.openzeppelin.com/contracts/4.x/erc20)
- [OpenZeppelin ReentrancyGuard Documentation](https://docs.openzeppelin.com/contracts/4.x/security#reentrancy-guard)
- [OpenZeppelin Ownable Documentation](https://docs.openzeppelin.com/contracts/4.x/access-control)

---

**Built for Valenor - Decentralized Autonomous Social Fund**
