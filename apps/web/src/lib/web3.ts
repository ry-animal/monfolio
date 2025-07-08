import { createPublicClient, http } from "viem";
import { createConfig } from "wagmi";
import { arbitrumSepolia, baseSepolia, optimismSepolia, sepolia } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

export const config = createConfig({
	chains: [sepolia, arbitrumSepolia, optimismSepolia, baseSepolia],
	connectors: [
		metaMask(),
		injected(),
	],
	transports: {
		[sepolia.id]: http(),
		[arbitrumSepolia.id]: http(),
		[optimismSepolia.id]: http(),
		[baseSepolia.id]: http(),
	},
});

export const publicClient = createPublicClient({
	chain: sepolia,
	transport: http(),
});

export const SUPPORTED_CHAINS = [sepolia, arbitrumSepolia, optimismSepolia, baseSepolia];

export const CHAIN_EXPLORERS = {
	[sepolia.id]: "https://sepolia.etherscan.io",
	[arbitrumSepolia.id]: "https://sepolia.arbiscan.io",
	[optimismSepolia.id]: "https://sepolia-optimism.etherscan.io",
	[baseSepolia.id]: "https://sepolia.basescan.org",
};

export const USDC_ADDRESSES = {
	[sepolia.id]: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
	[arbitrumSepolia.id]: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
	[optimismSepolia.id]: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
	[baseSepolia.id]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};
