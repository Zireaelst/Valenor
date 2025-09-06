# GovernanceContract

A governance contract for managing proposals and voting on fund releases for the Valenor Decentralized Autonomous Social Fund.

## 🌟 Features

- **Proposal System**: Create proposals for fund releases
- **Voting Power**: Proportional to donations in FundContract
- **Voting Mechanism**: YES/NO voting with deadline
- **Proposal Execution**: Automatic execution of passed proposals
- **Access Control**: Owner-only administrative functions
- **Security**: Comprehensive input validation and access controls

## 📋 Contract Details

### Constructor
```solidity
constructor(address _fundContract)
```
- **Parameters**: `_fundContract` - Address of the FundContract
- **Requirements**: FundContract address cannot be zero
- **Initial State**: Deployer becomes owner

### Core Functions

#### `createProposal(string description, uint256 projectId, uint256 amount, address recipient)`
- **Access**: Public (requires minimum voting power)
- **Purpose**: Create a new proposal for fund release
- **Requirements**:
  - Minimum voting power (1000 USDC donations)
  - Non-empty description
  - Valid project ID (> 0)
  - Amount ≥ minimum (100 USDC)
  - Valid recipient address
  - Amount ≤ available project funds
- **Effects**: 
  - Creates new proposal with 7-day voting period
  - Emits `ProposalCreated` event

#### `vote(uint256 proposalId, bool support)`
- **Access**: Public (requires voting power)
- **Purpose**: Vote on a proposal
- **Requirements**:
  - Valid proposal ID
  - Proposal not executed
  - Voting period active
  - Voter has voting power
  - Voter hasn't voted before
- **Effects**:
  - Records vote with proportional voting power
  - Emits `Voted` event

#### `executeProposal(uint256 proposalId)`
- **Access**: Public
- **Purpose**: Execute a passed proposal
- **Requirements**:
  - Valid proposal ID
  - Proposal not executed
  - Voting period ended
  - Proposal passed (votesFor > votesAgainst)
  - Sufficient project funds available
- **Effects**:
  - Calls FundContract.releaseMilestone()
  - Marks proposal as executed
  - Emits `ProposalExecuted` event

### Voting Power System

#### `getVotingPower(address voter)`
- **Access**: Public view
- **Purpose**: Calculate voting power based on donations
- **Logic**: Sum of all donations across all projects
- **Minimum**: 1000 USDC required to create proposals

### View Functions

#### Proposal Information
- `getProposal(uint256 proposalId)` - Get proposal details
- `getProposalCount()` - Get total number of proposals
- `getProposalState(uint256 proposalId)` - Get proposal state
- `proposalPassed(uint256 proposalId)` - Check if proposal passed
- `getVotingStats(uint256 proposalId)` - Get voting statistics

#### Contract State
- `fundContract()` - Get FundContract address
- `VOTING_PERIOD()` - Get voting period (7 days)
- `MIN_PROPOSAL_AMOUNT()` - Get minimum proposal amount (100 USDC)
- `MIN_VOTING_POWER()` - Get minimum voting power (1000 USDC)

### Administrative Functions

#### `emergencyPause()`
- **Access**: Owner only
- **Purpose**: Emergency pause mechanism (placeholder)
- **Status**: Not implemented (reverts)

#### `updateMinProposalAmount(uint256 newMinAmount)`
- **Access**: Owner only
- **Purpose**: Update minimum proposal amount (placeholder)
- **Status**: Not implemented (reverts)

## 🚀 Deployment

### Prerequisites
1. Deploy FundContract first
2. Set `FUND_CONTRACT_ADDRESS` in `.env` file
3. Ensure you have Sepolia ETH for gas fees

### Deploy to Sepolia
```bash
npm run deploy:governance:sepolia
```

### Deploy to Local Network
```bash
npm run deploy:governance:local
```

### Deploy to Hardhat Network
```bash
npx hardhat run scripts/deployGovernance.ts
```

## 🧪 Testing

### Run Tests
```bash
npx hardhat test test/GovernanceContract.test.js
```

### Test Coverage
- ✅ Deployment and initialization
- ✅ Voting power calculation
- ✅ Proposal creation
- ✅ Voting mechanism
- ✅ Proposal execution
- ✅ Access control
- ✅ Input validation
- ✅ Error conditions
- ✅ View functions

## 📊 Usage Examples

### Basic Deployment
```javascript
const GovernanceContract = await ethers.getContractFactory("GovernanceContract");
const governanceContract = await GovernanceContract.deploy(fundContractAddress);
await governanceContract.waitForDeployment();
```

### Creating Proposals
```javascript
// Create a proposal (requires 1000+ USDC voting power)
await governanceContract.createProposal(
  "Fund project development", // description
  1, // project ID
  ethers.parseUnits("1000", 6), // amount (1000 USDC)
  recipientAddress // recipient
);
```

### Voting on Proposals
```javascript
// Vote YES on proposal 0
await governanceContract.vote(0, true);

// Vote NO on proposal 0
await governanceContract.vote(0, false);
```

### Executing Proposals
```javascript
// Execute proposal 0 (after voting period ends and proposal passes)
await governanceContract.executeProposal(0);
```

### Checking Proposal Status
```javascript
// Get proposal details
const proposal = await governanceContract.getProposal(0);
console.log("Description:", proposal.description);
console.log("Amount:", ethers.formatUnits(proposal.amount, 6), "USDC");

// Check proposal state
const state = await governanceContract.getProposalState(0);
console.log("State:", state); // "Active", "Passed", "Rejected", "Executed"

// Get voting statistics
const [votesFor, votesAgainst, totalVotes] = await governanceContract.getVotingStats(0);
console.log("Votes For:", ethers.formatUnits(votesFor, 6), "USDC");
console.log("Votes Against:", ethers.formatUnits(votesAgainst, 6), "USDC");
```

## 🔒 Security Features

### Access Control
- **Owner Functions**: Emergency pause, update parameters
- **Public Functions**: Create proposals, vote, execute proposals
- **Voting Power**: Based on actual donations in FundContract

### Input Validation
- **Proposal Creation**: Description, project ID, amount, recipient validation
- **Voting**: Proposal ID, voting power, deadline validation
- **Execution**: Proposal state, voting results, fund availability validation

### Voting Security
- **One Vote Per Address**: Prevents double voting
- **Proportional Power**: Voting power based on donation amount
- **Deadline Enforcement**: Voting only allowed during active period
- **Execution Control**: Only passed proposals can be executed

## 📝 Events

### ProposalCreated
```solidity
event ProposalCreated(
    uint256 indexed proposalId,
    address indexed proposer,
    string description,
    uint256 targetProjectId,
    uint256 amount,
    address recipient,
    uint256 deadline
);
```

### Voted
```solidity
event Voted(
    uint256 indexed proposalId,
    address indexed voter,
    bool support,
    uint256 votingPower
);
```

### ProposalExecuted
```solidity
event ProposalExecuted(
    uint256 indexed proposalId,
    uint256 targetProjectId,
    address recipient,
    uint256 amount
);
```

## 🔧 Integration

### Frontend Integration
```javascript
// Get contract instance
const governanceContract = new ethers.Contract(contractAddress, abi, signer);

// Check voting power
const votingPower = await governanceContract.getVotingPower(userAddress);
const canCreateProposals = votingPower >= ethers.parseUnits("1000", 6);

// Get all proposals
const proposalCount = await governanceContract.getProposalCount();
for (let i = 0; i < proposalCount; i++) {
  const proposal = await governanceContract.getProposal(i);
  const state = await governanceContract.getProposalState(i);
  console.log(`Proposal ${i}: ${proposal.description} (${state})`);
}
```

### Backend Integration
```javascript
// Monitor events
governanceContract.on("ProposalCreated", (proposalId, proposer, description, projectId, amount, recipient, deadline) => {
  console.log(`New proposal: ${description} for ${ethers.formatUnits(amount, 6)} USDC`);
});

governanceContract.on("Voted", (proposalId, voter, support, votingPower) => {
  console.log(`Vote: ${support ? 'YES' : 'NO'} with ${ethers.formatUnits(votingPower, 6)} USDC power`);
});

governanceContract.on("ProposalExecuted", (proposalId, projectId, recipient, amount) => {
  console.log(`Proposal executed: ${ethers.formatUnits(amount, 6)} USDC released`);
});
```

## 📊 Contract Statistics

### Gas Usage
- **Deployment**: ~2,000,000 gas
- **Create Proposal**: ~150,000 gas
- **Vote**: ~80,000 gas
- **Execute Proposal**: ~120,000 gas

### Storage Layout
- **FundContract**: Immutable address
- **Proposals**: Array of Proposal structs
- **Voting Records**: Nested mappings (proposal → voter → hasVoted/votingPower)
- **Constants**: Voting period, minimum amounts

## 🚨 Important Notes

### Voting Power Requirements
- ⚠️ **Minimum 1000 USDC donations required to create proposals**
- ⚠️ **Voting power = sum of all donations across all projects**
- ⚠️ **Voting power is calculated dynamically from FundContract**

### Proposal Lifecycle
1. **Creation**: Requires minimum voting power
2. **Voting**: 7-day period, proportional voting power
3. **Execution**: Only after deadline and if passed
4. **One-time**: Proposals can only be executed once

### Integration Requirements
- **FundContract**: Must be deployed and governance set
- **USDC Token**: Must be deployed and donations made
- **Voting Power**: Based on actual donations in FundContract

## 🆘 Troubleshooting

### Common Issues

#### "GovernanceContract: Insufficient voting power"
- Ensure user has made donations totaling 1000+ USDC
- Check donations are recorded in FundContract

#### "GovernanceContract: Already voted"
- Each address can only vote once per proposal
- Check if address has already voted

#### "GovernanceContract: Voting period ended"
- Voting only allowed during 7-day period
- Check proposal deadline

#### "GovernanceContract: Proposal not passed"
- Proposal needs more YES votes than NO votes
- Check voting results

#### "GovernanceContract: Amount exceeds available project funds"
- Proposal amount must not exceed available project funds
- Check project donations vs releases

### Debug Commands
```bash
# Check contract info
npx hardhat console --network sepolia
> const contract = await ethers.getContractAt("GovernanceContract", "0x...")
> await contract.fundContract()
> await contract.getProposalCount()

# Check voting power
> await contract.getVotingPower("0x...")

# Check proposal details
> await contract.getProposal(0)
> await contract.getProposalState(0)
```

## 📚 Resources

- [OpenZeppelin Ownable Documentation](https://docs.openzeppelin.com/contracts/4.x/access-control)
- [Solidity Structs and Arrays](https://docs.soliditylang.org/en/v0.8.19/types.html#structs)
- [Ethereum Events](https://docs.soliditylang.org/en/v0.8.19/contracts.html#events)

---

**Built for Valenor - Decentralized Autonomous Social Fund**
