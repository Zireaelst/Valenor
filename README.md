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

TestUSDC deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
FundContract deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
GovernanceContract deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

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
VITE_ETH_VAULT_ADDRESS=0x0AD6E1db1D5d4470270a66cbEB081d23E612b3B7
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

- **EthVault Contract**: `0x0AD6E1db1D5d4470270a66cbEB081d23E612b3B7`
- **Network**: Sepolia Testnet
- **Chain ID**: 11155111

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
- **Demo**: [Live Demo URL]
- **Documentation**: [Documentation URL]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request


**Built for ETH Istanbul 2025** 🚀