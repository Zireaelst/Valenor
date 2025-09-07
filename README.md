# Valenor - Decentralized Autonomous Social Fund

A decentralized autonomous organization (DAO) that enables transparent, community-driven funding for social impact projects through blockchain technology and democratic governance.

## 🚀 Features

- **AI-Powered Proposal Analysis**: Automatic scoring of proposals using AI
- **Decentralized Governance**: Community voting on proposals
- **ETH Vault**: Secure ETH storage and management
- **Fraud Detection**: PDF-based fraud risk assessment
- **Transparent Funding**: All transactions on blockchain
- **Real-time Analytics**: Dashboard with charts and statistics

## 🏗️ Architecture

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **AI Service**: Python + FastAPI
- **Blockchain**: Ethereum Sepolia Testnet
- **Smart Contracts**: Solidity 0.8.24

## 📋 Contract Addresses

TestUSDC deployed to: 0x249Cd8D3C907ae0565C0Fd1f335b098f5b85121A
FundContract deployed to: 0x534d7313353445378519286b81d8B9Ff4084d0e9
GovernanceContract deployed to: 0x49cbb6E45f8869ca48537EE162159A3b8FF1Ea86
EthVault deployed to: 0x7cFf25AD0b8dd107dc40f985631f72a601D50ac9

### Test Donations

Each project received 300 USDC donation for testing purposes:

- Project 1: [Transaction on Etherscan](https://sepolia.etherscan.io/tx/0xc4ec1daa3047de74dcd59e82506139ad53e6505e7aea69a47374029f46ddc1b5)
- Project 2: [Transaction on Etherscan](https://sepolia.etherscan.io/tx/0x99aa54a89d18a1e0f33d2efb287d26c072d1cee947920174c398da67a46715b5)
- Project 3: [Transaction on Etherscan](https://sepolia.etherscan.io/tx/0xe35813869d1b58ca6b4b037e6b16229da48162d2202d601dd230549df7e66033)
- Project 4: [Transaction on Etherscan](https://sepolia.etherscan.io/tx/0x028a049501d7fafd3165a13a8c6120ca05990c91fee09f7beb816e20ec060c5c)

Total donations: 1200 USDC (sufficient for proposal creation which requires 1000 USDC minimum)

## 📋 Prerequisiteses

- Node.js 18+
- Python 3.8+
- Git
- MetaMask wallet
- Sepolia ETH (for testing)

## 🛠️ Setup

### 1. Clone Repository

```bash
git clone https://github.com/Zireaelst/Valenor.git
cd Valenor
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Backend Setup

```bash
cd ../backend
npm install
```

### 4. AI Service Setup

```bash
cd ../ai-service
pip install -r requirements.txt
```

### 5. Smart Contracts Setup

```bash
cd ../contracts
npm install
```

## 🔧 Environment Configuration

### Frontend Environment

Create `frontend/.env`:

```env
VITE_AI_SERVICE_URL=http://localhost:8000
VITE_FUND_CONTRACT=0x534d7313353445378519286b81d8B9Ff4084d0e9
VITE_GOV_CONTRACT=0x49cbb6E45f8869ca48537EE162159A3b8FF1Ea86
VITE_USDC_ADDRESS=0x249Cd8D3C907ae0565C0Fd1f335b098f5b85121A
VITE_ETH_VAULT_ADDRESS=0x7cFf25AD0b8dd107dc40f985631f72a601D50ac9
```

### Backend Environment

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
```

### Smart Contracts Environment

Create `contracts/.env`:

```env
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
CONTRACT_ADDRESS=0x0AD6E1db1D5d4470270a66cbEB081d23E612b3B7
```

## 🚀 Deployment

### 1. Start AI Service

```bash
cd ai-service
python main.py
```

### 2. Start Backend

```bash
cd backend
npm start
```

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

### 4. Deploy Smart Contracts

```bash
cd contracts
npx hardhat run scripts/deploy.js --network sepolia
```

## 📜 Smart Contract Addresses

### Sepolia Testnet

- **TestUSDC**: `0x249Cd8D3C907ae0565C0Fd1f335b098f5b85121A`
- **FundContract**: `0x534d7313353445378519286b81d8B9Ff4084d0e9`
- **GovernanceContract**: `0x49cbb6E45f8869ca48537EE162159A3b8FF1Ea86`
- **EthVault**: `0x7cFf25AD0b8dd107dc40f985631f72a601D50ac9`
- **Network**: Sepolia Testnet
- **Chain ID**: 11155111
- **Test Donations**: 300 USDC to each project (1200 USDC total)

## 🎯 How to Reproduce the Demo

### 1. Setup MetaMask

1. Install MetaMask browser extension
2. Add Sepolia Testnet:
   - Network Name: Sepolia Testnet
   - RPC URL: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`
   - Chain ID: 11155111
   - Currency Symbol: ETH
   - Block Explorer: `https://sepolia.etherscan.io`

### 2. Get Test ETH

1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your wallet address
3. Request test ETH

### 3. Demo Workflow

#### AI Proposal Analysis
1. Navigate to "Proposal Submission"
2. Enter a proposal description
3. Click "Analyze Proposal"
4. View AI-generated score and reasoning

#### ETH Vault Operations
1. Navigate to "ETH Vault"
2. Connect your MetaMask wallet
3. View wallet and vault balances
4. Deposit ETH to the vault
5. Withdraw ETH from the vault

#### Governance Participation
1. Navigate to "Governance"
2. View active, passed, and rejected proposals
3. Vote on active proposals (requires voting power)
4. Execute passed proposals

#### Fraud Detection
1. Navigate to backend API
2. Upload a PDF file to `/api/fraud/check`
3. Receive fraud risk assessment

### 4. Testing Commands

#### Smart Contract Interaction

```bash
# Check vault balance
npx hardhat run scripts/interact.js --network sepolia

# Set interaction command
export INTERACT_CMD=balance
export INTERACT_ARG=0xYOUR_ADDRESS
npx hardhat run scripts/interact.js --network sepolia

# Deposit ETH
export INTERACT_CMD=deposit
export INTERACT_ARG=0.1
npx hardhat run scripts/interact.js --network sepolia

# Withdraw ETH
export INTERACT_CMD=withdraw
export INTERACT_ARG=0.05
npx hardhat run scripts/interact.js --network sepolia
```

#### API Testing

```bash
# Test AI service
curl -X POST http://localhost:8000/analyze_proposal \
  -H "Content-Type: application/json" \
  -d '{"text": "Fund education for 100 students"}'

# Test fraud detection
curl -X POST http://localhost:5000/api/fraud/check \
  -F "pdf=@test-document.pdf"
```

## 🧪 Testing

### Frontend Tests

```bash
cd frontend
npm run test
```

### Smart Contract Tests

```bash
cd contracts
npx hardhat test
```

### Backend Tests

```bash
cd backend
npm test
```

## 📁 Project Structure

```
Valenor/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── contracts/      # Contract ABIs
│   │   └── config/         # Configuration
│   └── public/             # Static assets
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── routes/         # API routes
│   │   └── server.js       # Main server file
│   └── uploads/            # File uploads
├── ai-service/              # Python AI service
│   ├── app/
│   │   └── models/         # Pydantic models
│   ├── main.py             # FastAPI app
│   └── requirements.txt    # Python dependencies
├── contracts/               # Smart contracts
│   ├── contracts/          # Solidity contracts
│   ├── scripts/            # Deployment scripts
│   ├── test/               # Contract tests
│   └── hardhat.config.js   # Hardhat configuration
└── README.md               # This file
```

## 🔗 Links

- **GitHub**: https://github.com/Zireaelst/Valenor

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request


**Built for ETH Istanbul 2025** 🚀