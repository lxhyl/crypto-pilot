# Crypto Pilot

AI-powered natural language interface for blockchain operations. Chat with AI to swap tokens, lend/borrow on Aave, and transfer crypto assets.

## Features

- **Natural Language Interface** - Tell the AI what you want to do in plain language
- **Wallet Connection** - Connect via MetaMask, WalletConnect, Coinbase Wallet (RainbowKit)
- **Token Swaps** - Swap tokens via Uniswap V3
- **Aave V3 Operations** - Supply, borrow, repay, withdraw
- **ERC20 Transfers & Approvals** - Send tokens and manage allowances
- **Human-Readable Calldata** - Review every transaction before signing
- **Operation History** - Track all your operations
- **Multi-Chain** - Ethereum, Arbitrum, Base

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS
- **Wallet**: wagmi v2, viem, RainbowKit
- **AI**: Anthropic Claude (tool_use) or OpenAI GPT (function_calling) - configurable
- **Blockchain**: viem for calldata encoding, Uniswap V3 + Aave V3 ABIs

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

Required:
- `AI_PROVIDER` - `anthropic` or `openai`
- `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` - depending on provider
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - from [WalletConnect Cloud](https://cloud.walletconnect.com)

Optional:
- `NEXT_PUBLIC_RPC_ETHEREUM` - Custom RPC for Ethereum
- `NEXT_PUBLIC_RPC_ARBITRUM` - Custom RPC for Arbitrum
- `NEXT_PUBLIC_RPC_BASE` - Custom RPC for Base

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage Examples

- "Swap 1 ETH for USDC"
- "Transfer 100 USDC to 0x..."
- "Supply 500 DAI to Aave"
- "Borrow 200 USDC from Aave"
- "How much WETH can I borrow?"

The AI will parse your intent, ask for any missing parameters, generate the transaction calldata, and show you a human-readable preview before you sign.

## Architecture

```
src/
  app/
    api/chat/route.ts    # Main API: AI parsing + calldata generation
    page.tsx             # Main page
  lib/
    ai/                  # AI providers (Anthropic/OpenAI), tool definitions
    blockchain/          # Token registry, ABIs, calldata generators
  components/
    chat/                # Chat UI components
    transaction/         # Transaction preview & confirmation
    history/             # Operation history sidebar
  hooks/                 # React hooks (useChat, useTransaction, etc.)
```

## Supported Protocols

| Protocol | Operations | Chains |
|----------|-----------|--------|
| Uniswap V3 | Swap (exactInputSingle) | Ethereum, Arbitrum, Base |
| Aave V3 | Supply, Borrow, Repay, Withdraw | Ethereum, Arbitrum, Base |
| ERC20 | Transfer, Approve | All EVM chains |
