import { createConfig } from "wagmi";
import { sepolia, arbitrumSepolia, optimismSepolia } from "wagmi/chains";
import { injected, metaMask, coinbaseWallet, walletConnect } from "wagmi/connectors";
import { createPublicClient, http } from "viem";

export const config = createConfig({
  chains: [sepolia, arbitrumSepolia, optimismSepolia],
  connectors: [
    injected({ target: "metaMask" }),
    metaMask(),
    coinbaseWallet({
      appName: "Multi-Chain Wallet Dashboard",
      appLogoUrl: "https://example.com/logo.png",
    }),
    walletConnect({
      projectId: "YOUR_WALLET_CONNECT_PROJECT_ID",
    }),
  ],
  transports: {
    [sepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [optimismSepolia.id]: http(),
  },
});

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

export const SUPPORTED_CHAINS = [sepolia, arbitrumSepolia, optimismSepolia];

export const CHAIN_EXPLORERS = {
  [sepolia.id]: "https://sepolia.etherscan.io",
  [arbitrumSepolia.id]: "https://sepolia.arbiscan.io",
  [optimismSepolia.id]: "https://sepolia-optimism.etherscan.io",
};

export const USDC_ADDRESSES = {
  [sepolia.id]: "0xA0b86a33E6A9b644f3c4c9f6dC80b0d0D1C1Ca01", // Example USDC address
  [arbitrumSepolia.id]: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // Example USDC address  
  [optimismSepolia.id]: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7", // Example USDC address
};