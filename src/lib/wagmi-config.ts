import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, arbitrum, base } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'Crypto Pilot',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: [mainnet, arbitrum, base],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_RPC_ETHEREUM),
    [arbitrum.id]: http(process.env.NEXT_PUBLIC_RPC_ARBITRUM),
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_BASE),
  },
  ssr: true,
});
