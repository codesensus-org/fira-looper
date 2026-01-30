# Fira Looper

A leverage looping interface for the Fira UZR lending market.

It enables users to leverage and deleverage their positions on Fira in a single transaction. The app optimizes for capital efficiency, allowing users to increase or decrease their leverage without requiring upfront capital. It also uses flash loans and is designed to be gas efficient.

### Key Features

- **Leverage Up**: Borrow more and automatically loop into additional collateral to increase position size
- **Deleverage**: Reduce leverage by repaying loans and withdrawing collateral in one transaction
- **Flash Loan Integration**: Uses Fira's own flash loan capability for capital-efficient operations
- **ParaSwap Integration**: Optimal token swaps with 0.01% slippage protection
- **Real-time Metrics**: Live position data including:
  - Collateral and loan amounts
  - Current equity and LTV (Loan-to-Value)
  - Borrow APY
  - Liquidation ETA countdown
- **One-Click Execution**: Complex multi-step transactions bundled into a single execution

## How It Works

### Borrowing (Leverage Up)

When increasing leverage, the app executes the following steps atomically:

1. Transfers user's existing collateral to the bundler
2. Takes a flash loan for the desired borrow amount
3. Swaps the borrowed assets to collateral via ParaSwap
4. Supplies all collateral on Fira
5. Borrows against the new collateral to repay the flash loan

### Repaying (Deleverage)

When decreasing leverage, the process is:

1. Takes a flash loan for the repay amount
2. Repays the loan on Fira
3. Withdraws collateral from the market
4. Swaps collateral to loan token via ParaSwap
5. Repays the flash loan with swapped assets
6. Recovers any leftover dust back to the user

### Exit Position

To fully close a position, the app:

1. Withdraws all collateral
2. Repays all outstanding loans
3. Returns remaining assets to the user

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Blockchain Interaction**:
  - [Wagmi](https://wagmi.sh/) v3 - React hooks for Ethereum
  - [Viem](https://viem.sh/) v2 - TypeScript interface for Ethereum
- **DeFi Integration**:
  - [@morpho-org/blue-sdk](https://www.npmjs.com/package/@morpho-org/blue-sdk) - Morpho Blue protocol interaction
  - [@paraswap/sdk](https://www.npmjs.com/package/@paraswap/sdk) - DEX aggregation
- **State Management**: TanStack Query (React Query) v5

## Prerequisites

- Node.js 18 or higher
- Yarn package manager
- Ethereum wallet (MetaMask, WalletConnect, etc.)
- Mainnet RPC endpoint (Alchemy, Infura, etc.)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/codesensus-org/fira-looper.git
cd fira-looper
```

2. Install dependencies:

```bash
yarn install
```

3. Create a `.env` file in the root directory:

```bash
VITE_MAINNET_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
```

Replace `YOUR_API_KEY` with your Alchemy API key or use another RPC provider.

## Development

Start the development server:

```bash
yarn dev
```

The app will be available at [http://localhost:5173](http://localhost:5173)

## Build

Create a production build:

```bash
yarn build
```

Preview the production build:

```bash
yarn preview
```

## Code Quality

### Linting

Run ESLint to check for code issues:

```bash
yarn lint
```

### Formatting

Format code with Prettier:

```bash
yarn format
```

## Project Structure

```
fira-looper/
├── src/
│   ├── components/          # React components
│   │   ├── Countdown.tsx    # Liquidation ETA display
│   │   ├── Controls.tsx     # LTV slider controls
│   │   ├── Leverage.tsx     # Main leverage interface
│   │   ├── Login.tsx        # Wallet connection
│   │   └── Smoothen.tsx     # Number animation component
│   ├── hooks/               # Custom React hooks
│   │   ├── bundles/         # Transaction bundle hooks
│   │   │   ├── useBorrowBundle.ts
│   │   │   ├── useRepayBundle.ts
│   │   │   └── useExitBundle.ts
│   │   ├── useAccrualPosition.ts
│   │   └── useAccrueInterest.ts
│   ├── pages/               # Page components
│   │   └── HomePage.tsx
│   ├── utils/               # Utility functions
│   │   ├── actions/         # Smart contract action builders
│   │   ├── adapters/        # Protocol adapter utilities
│   │   ├── numbers.ts
│   │   └── strings.ts
│   ├── layout.tsx           # App layout with providers
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Smart Contract Interactions

The app interacts with the following protocols:

### Fira

- **Market ID**: `0xa597b5a36f6cc0ede718ba58b2e23f5c747da810bf8e299022d88123ab03340e`
- Operations: Supply collateral, borrow, repay, withdraw, flash loans

### ParaSwap

- Token swaps with optimal routing
- Integrated via GeneralAdapter1 and ParaSwapAdapter

### Bundler3

- Multicall contract for bundling multiple operations
- Enables atomic flash loan + swap + lend/borrow operations

## Configuration

### Slippage Settings

Default slippage is set to 0.01% in the bundle hooks. Adjust in:

- [src/hooks/bundles/useBorrowBundle.ts](src/hooks/bundles/useBorrowBundle.ts) line 16
- [src/hooks/bundles/useRepayBundle.ts](src/hooks/bundles/useRepayBundle.ts) line 20
- [src/hooks/bundles/useExitBundle.ts](src/hooks/bundles/useExitBundle.ts) line 17

## Usage

1. **Connect Wallet**: Click the login button and connect your Ethereum wallet
2. **View Position**: See your current collateral, loan, and equity
3. **Adjust Target LTV**: Use the slider to set your desired leverage level
4. **Review Impact**: Check the liquidation ETA and borrow APY
5. **Execute**: Click "Execute" to submit the transaction

### Safety Features

- Maximum LTV is enforced at the market's LLTV parameter
- Liquidation countdown shows time until potential liquidation
- Flash loans ensure atomic execution (all-or-nothing)
- Slippage protection on all swaps
- Dust recovery returns leftover tokens to the user

## Known Limitations

- Doesn't work until a GeneralAdapter1 is deployed for Fira
- Uses the market oracle to price collateral rather than actual swap rate
- Uses the Morpho SDK which has incompatible market params
- Market params are hardcoded and should ideally be fetched on-chain
- Currently supports a single predefined market (UZR)

## Security Considerations

- Always verify transaction details before confirming
- Ensure sufficient gas for complex bundled transactions
- Monitor liquidation risk, especially in volatile markets
- Flash loans are borrowed and repaid in the same transaction
- All approvals use the Morpho Bundler contract
