import { ExternalLink } from "lucide-react";
import { useAccount } from "wagmi";
import { arbitrumSepolia, optimismSepolia, sepolia } from "wagmi/chains";
import { CHAIN_EXPLORERS } from "../lib/web3";
import { trpc } from "../utils/trpc";
import { Skeleton } from "./ui/skeleton";

const SUPPORTED_NETWORKS = [
	{ chain: sepolia, name: "Ethereum Sepolia", logo: "⚡" },
	{ chain: arbitrumSepolia, name: "Arbitrum Sepolia", logo: "🔵" },
	{ chain: optimismSepolia, name: "Optimism Sepolia", logo: "🔴" },
];

interface BalanceDisplayProps {
	selectedNetworks?: number[];
}

export function BalanceDisplay({ selectedNetworks = [] }: BalanceDisplayProps) {
	const { address } = useAccount();

	// Get individual balance queries for each network
	const sepoliaBalance = trpc.getBalance.useQuery(
		{ address: address as string, chainId: sepolia.id },
		{ enabled: !!address },
	);
	const arbitrumBalance = trpc.getBalance.useQuery(
		{ address: address as string, chainId: arbitrumSepolia.id },
		{ enabled: !!address },
	);
	const optimismBalance = trpc.getBalance.useQuery(
		{ address: address as string, chainId: optimismSepolia.id },
		{ enabled: !!address },
	);

	// Collect all individual balances
	const allBalances = [sepoliaBalance, arbitrumBalance, optimismBalance];
	const isLoading = allBalances.some((balance) => balance.isLoading);

	// Create individual token entries and filter by selected networks
	const tokenBalances = allBalances.flatMap((balance, index) => {
		const network = SUPPORTED_NETWORKS[index];
		if (!balance.data) return [];

		// Only include tokens from selected networks
		if (
			selectedNetworks.length > 0 &&
			!selectedNetworks.includes(network.chain.id)
		) {
			return [];
		}

		const tokens = [];
		if (balance.data.eth !== "0") {
			tokens.push({
				token: "ETH",
				balance: Number.parseFloat(balance.data.eth) / 1e18,
				usdValue: balance.data.ethUsd,
				network: network.name,
				networkLogo: network.logo,
				chainId: network.chain.id,
			});
		}
		if (balance.data.usdc !== "0") {
			tokens.push({
				token: "USDC",
				balance: Number.parseFloat(balance.data.usdc) / 1e6,
				usdValue: balance.data.usdcUsd,
				network: network.name,
				networkLogo: network.logo,
				chainId: network.chain.id,
			});
		}
		return tokens;
	});

	// Sort tokens by USD value (highest first)
	const sortedTokens = [...tokenBalances].sort((a, b) => {
		return b.usdValue - a.usdValue;
	});

	const getExplorerLink = (chainId: number) => {
		const baseUrl = CHAIN_EXPLORERS[chainId as keyof typeof CHAIN_EXPLORERS];
		return baseUrl ? `${baseUrl}/address/${address}` : "#";
	};

	return (
		<div className="space-y-4">
			{isLoading ? (
				<div className="space-y-3">
					{Array.from({ length: 3 }, (_, i) => (
						<div
							key={`skeleton-${i}`}
							className="flex items-center justify-between rounded-lg border p-4"
						>
							<div className="flex items-center gap-3">
								<Skeleton className="h-6 w-6 rounded-full" />
								<div>
									<Skeleton className="mb-1 h-4 w-12" />
									<Skeleton className="h-3 w-20" />
								</div>
							</div>
							<div className="text-right">
								<Skeleton className="mb-1 h-4 w-16" />
								<Skeleton className="h-3 w-12" />
							</div>
							<Skeleton className="h-4 w-4" />
						</div>
					))}
				</div>
			) : sortedTokens.length === 0 ? (
				<div className="py-8 text-center text-muted-foreground">
					No balances found
				</div>
			) : (
				<div className="space-y-3">
					{sortedTokens.map((token, index) => (
						<div
							key={`${token.token}-${token.chainId}-${index}`}
							className="flex items-center justify-between rounded-lg border p-4"
						>
							<div className="flex items-center gap-3">
								<span className="text-lg">{token.networkLogo}</span>
								<div>
									<div className="font-medium">{token.token}</div>
									<div className="text-muted-foreground text-sm">
										{token.network}
									</div>
								</div>
							</div>
							<div className="text-right">
								<div className="font-medium">
									{token.token === "ETH"
										? `${token.balance.toFixed(4)} ETH`
										: `${token.balance.toFixed(2)} USDC`}
								</div>
								<div className="text-muted-foreground text-sm">
									${token.usdValue.toFixed(2)}
								</div>
							</div>
							<a
								href={getExplorerLink(token.chainId)}
								target="_blank"
								rel="noopener noreferrer"
								className="ml-3 rounded p-1 hover:bg-gray-100"
								title="View on explorer"
							>
								<ExternalLink className="size-4" />
							</a>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
