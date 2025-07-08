import { ExternalLink } from "lucide-react";
import { useAccount } from "wagmi";
import { arbitrumSepolia, optimismSepolia, sepolia } from "wagmi/chains";
import { CHAIN_EXPLORERS } from "../lib/web3";
import { trpc } from "../utils/trpc";
import { Skeleton } from "./ui/skeleton";
import { TokenIcon } from "./ui/token-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const SUPPORTED_NETWORKS = [
	{ chain: sepolia, name: "Ethereum Sepolia" },
	{ chain: arbitrumSepolia, name: "Arbitrum Sepolia" },
	{ chain: optimismSepolia, name: "Optimism Sepolia" },
];

interface BalanceDisplayProps {
	selectedNetworks?: number[];
}

export function BalanceDisplay({ selectedNetworks = [] }: BalanceDisplayProps) {
	const { address } = useAccount();

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

	const tokenPrices = trpc.getTokenPrices.useQuery();

	const allBalances = [sepoliaBalance, arbitrumBalance, optimismBalance];
	const isLoading =
		allBalances.some((balance) => balance.isLoading) || tokenPrices.isLoading;

	const tokenBalances = allBalances.flatMap((balance, index) => {
		const network = SUPPORTED_NETWORKS[index];
		if (!balance.data) return [];

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
				chainId: network.chain.id,
			});
		}
		if (balance.data.usdc !== "0") {
			tokens.push({
				token: "USDC",
				balance: Number.parseFloat(balance.data.usdc) / 1e6,
				usdValue: balance.data.usdcUsd,
				network: network.name,
				chainId: network.chain.id,
			});
		}
		return tokens;
	});

	const sortedTokens = [...tokenBalances].sort((a, b) => {
		return b.usdValue - a.usdValue;
	});

	const getExplorerLink = (chainId: number) => {
		const baseUrl = CHAIN_EXPLORERS[chainId as keyof typeof CHAIN_EXPLORERS];
		return baseUrl ? `${baseUrl}/address/${address}` : "#";
	};

	const getTokenFullName = (token: string) => {
		switch (token) {
			case "ETH":
				return "Ether";
			case "USDC":
				return "USD Coin";
			default:
				return token;
		}
	};

	const getTokenPrice = (token: string) => {
		if (!tokenPrices.data) return "-";

		if (token === "ETH") {
			return `$${tokenPrices.data.ethereum.usd.toLocaleString()}`;
		}
		if (token === "USDC") {
			return `$${tokenPrices.data["usd-coin"].usd.toFixed(2)}`;
		}
		return "-";
	};

	return (
		<div className="space-y-4">
			{isLoading ? (
				<div className="space-y-3">
					{Array.from({ length: 3 }, (_, i) => (
						<div
							key={`skeleton-${i}`}
							className="flex items-center justify-between rounded-lg border bg-card p-4"
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
				<div className="overflow-hidden rounded-lg">
					<table className="w-1/2">
						<thead>
							<tr>
								<th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
									Token
								</th>
								<th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
									Price
								</th>
								<th className="px-4 py-3 text-left font-medium text-muted-foreground text-sm">
									Balance
								</th>
								<th className="w-12 px-4 py-3" />
							</tr>
						</thead>
						<tbody>
							{sortedTokens.map((token, index) => (
								<tr
									key={`${token.token}-${token.chainId}-${index}`}
									className="transition-colors hover:bg-muted/25"
								>
									<td className="px-4 py-3">
										<div className="flex items-center gap-3">
											<TokenIcon
												token={token.token as "ETH" | "USDC"}
												networkId={token.chainId}
												size="md"
											/>
											<div>
												<div className="font-medium">{token.token}</div>
												<div className="text-muted-foreground text-sm">
													{getTokenFullName(token.token)}
												</div>
											</div>
										</div>
									</td>
									<td className="px-4 py-3">
										<div className="font-medium">
											{getTokenPrice(token.token)}
										</div>
									</td>
									<td className="px-4 py-3">
										<div className="font-medium">
											${token.usdValue.toFixed(2)}
										</div>
										<div className="text-muted-foreground text-sm">
											{token.token === "ETH"
												? `${token.balance.toFixed(4)} ETH`
												: `${token.balance.toFixed(2)} USDC`}
										</div>
									</td>
									<td className="px-4 py-3">
										<Tooltip>
											<TooltipTrigger asChild>
												<a
													href={getExplorerLink(token.chainId)}
													target="_blank"
													rel="noopener noreferrer nofollow"
													className="inline-flex items-center justify-center rounded p-1 hover:bg-muted"
												>
													<ExternalLink className="size-4" />
												</a>
											</TooltipTrigger>
											<TooltipContent>
												View wallet on {token.network} explorer
											</TooltipContent>
										</Tooltip>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
