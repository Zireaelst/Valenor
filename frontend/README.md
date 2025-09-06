# Valenor Frontend

A modern React frontend for the Valenor Decentralized Autonomous Social Fund, built with Vite, TypeScript, and Tailwind CSS.

## Features

- **Home Page**: Project introduction and overview
- **Donor Dashboard**: Wallet connection, donations, and analytics with Chart.js
- **Governance**: View, vote on, and execute proposals
- **Proposal Submission**: Create proposals with AI-powered analysis
- **MetaMask Integration**: Connect wallet using wagmi/viem
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **wagmi/viem** for Ethereum wallet integration
- **Chart.js** for data visualization
- **React Router** for navigation
- **React Hot Toast** for notifications

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask wallet

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp env.example .env
```

3. Update `.env` with your contract addresses:
```env
VITE_FUND_CONTRACT=0x...
VITE_GOV_CONTRACT=0x...
VITE_USDC_ADDRESS=0x...
VITE_API_URL=http://localhost:3001
VITE_AI_SERVICE_URL=http://localhost:8000
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx      # Navigation bar with wallet connection
│   └── Footer.tsx      # Footer component
├── pages/              # Page components
│   ├── Home.tsx        # Landing page
│   ├── DonorDashboard.tsx  # Donor dashboard with charts
│   ├── Governance.tsx  # Governance and voting
│   └── ProposalSubmission.tsx  # Proposal creation
├── config/             # Configuration files
│   ├── wagmi.ts        # Wagmi configuration
│   └── contracts.ts    # Contract addresses
├── types/              # TypeScript type definitions
│   └── contracts.ts    # Contract-related types
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles and Tailwind imports
```

## Features Overview

### Home Page
- Project introduction and mission
- Feature highlights
- Statistics and impact metrics
- Call-to-action sections

### Donor Dashboard
- Wallet connection status
- Donation statistics and analytics
- Interactive pie charts showing donation distribution
- Quick donation form
- Recent donations history

### Governance
- List of active, passed, and rejected proposals
- Voting interface with YES/NO options
- Proposal execution for passed proposals
- Voting statistics and deadlines

### Proposal Submission
- Comprehensive proposal form
- AI-powered analysis and scoring
- Real-time feedback and recommendations
- Category selection and project targeting

## Wallet Integration

The app uses wagmi/viem for Ethereum wallet integration:

- **MetaMask** support
- **Sepolia testnet** configuration
- **Automatic network switching**
- **Transaction status tracking**

## Styling

Built with Tailwind CSS for rapid development:

- **Custom color palette** with primary and secondary colors
- **Responsive design** for all screen sizes
- **Component-based styling** with reusable classes
- **Dark mode ready** (can be easily enabled)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FUND_CONTRACT` | FundContract address | Yes |
| `VITE_GOV_CONTRACT` | GovernanceContract address | Yes |
| `VITE_USDC_ADDRESS` | USDC token address | Yes |
| `VITE_API_URL` | Backend API URL | No |
| `VITE_AI_SERVICE_URL` | AI service URL | No |

## Deployment

The frontend can be deployed to any static hosting service:

- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- **AWS S3 + CloudFront**

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

