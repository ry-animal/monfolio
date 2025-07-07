import { useState } from "react";
import { useAccount } from "wagmi";
import { arbitrumSepolia, optimismSepolia, sepolia } from "wagmi/chains";
import { CHAIN_EXPLORERS } from "../lib/web3";
import { trpc } from "../utils/trpc";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { VirtualizedTransactionList } from "./virtualized-transaction-list";

const SUPPORTED_NETWORKS = [
	{ chain: sepolia, name: "Ethereum Sepolia", logo: "⚡" },
	{ chain: arbitrumSepolia, name: "Arbitrum Sepolia", logo: "🔵" },
	{ chain: optimismSepolia, name: "Optimism Sepolia", logo: "🔴" },
];

type Transaction = {
	hash: string;
	chainId: number;
	blockNumber: number;
	timestamp: number;
	from: string;
	to: string;
	amount: string;
	token: string;
};

export function TransactionHistory() {
	const { address } = useAccount();
	const [selectedNetwork, setSelectedNetwork] = useState<number | null>(null);
	const [limit, setLimit] = useState(12);
	const [useVirtualization, setUseVirtualization] = useState(false);

	// Fetch transactions using individual queries for each network
	// @ts-ignore - tRPC types issue, but works at runtime
	const ethQuery = trpc.getTransactions.useQuery(
		{ address: address || "", chainId: sepolia.id, limit },
		{
			enabled:
				!!address && (!selectedNetwork || selectedNetwork === sepolia.id),
			refetchInterval: 60000,
			staleTime: 30000,
		},
	);

	// @ts-ignore - tRPC types issue, but works at runtime
	const arbQuery = trpc.getTransactions.useQuery(
		{ address: address || "", chainId: arbitrumSepolia.id, limit },
		{
			enabled:
				!!address &&
				(!selectedNetwork || selectedNetwork === arbitrumSepolia.id),
			refetchInterval: 60000,
			staleTime: 30000,
		},
	);

	// @ts-ignore - tRPC types issue, but works at runtime
	const opQuery = trpc.getTransactions.useQuery(
		{ address: address || "", chainId: optimismSepolia.id, limit },
		{
			enabled:
				!!address &&
				(!selectedNetwork || selectedNetwork === optimismSepolia.id),
			refetchInterval: 60000,
			staleTime: 30000,
		},
	);

	const transactionQueries = selectedNetwork
		? selectedNetwork === sepolia.id
			? [ethQuery]
			: selectedNetwork === arbitrumSepolia.id
				? [arbQuery]
				: selectedNetwork === optimismSepolia.id
					? [opQuery]
					: []
		: [ethQuery, arbQuery, opQuery];

	const isLoading = transactionQueries.some((query) => query.isLoading);
	const hasError = transactionQueries.some((query) => query.error);
	const isRefetching = transactionQueries.some((query) => query.isRefetching);

	// Combine and sort transactions from all networks
	const allTransactions: Transaction[] = transactionQueries
		.flatMap((query) => query.data || [])
		.sort((a, b) => b.timestamp - a.timestamp)
		.slice(0, useVirtualization ? undefined : limit);

	// Auto-enable virtualization for large datasets
	const shouldUseVirtualization = allTransactions.length > 50;

	const getExplorerLink = (
		hash: string,
		chainId: number,
		type: "tx" | "address",
	) => {
		const baseUrl = CHAIN_EXPLORERS[chainId as keyof typeof CHAIN_EXPLORERS];
		if (!baseUrl) return "#";

		return type === "tx"
			? `${baseUrl}/tx/${hash}`
			: `${baseUrl}/address/${hash}`;
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatAddress = (address: string) => {
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	const getNetworkInfo = (chainId: number) => {
		return SUPPORTED_NETWORKS.find((n) => n.chain.id === chainId);
	};

	const renderTransactionSkeleton = () => (
		<div className="space-y-2 rounded-lg border p-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Skeleton className="h-4 w-12" />
					<Skeleton className="h-4 w-20" />
				</div>
				<Skeleton className="h-4 w-16" />
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-1">
					<Skeleton className="h-3 w-8" />
					<Skeleton className="h-4 w-24" />
				</div>
				<div className="space-y-1">
					<Skeleton className="h-3 w-6" />
					<Skeleton className="h-4 w-24" />
				</div>
			</div>
			<div className="flex items-center justify-between">
				<Skeleton className="h-4 w-32" />
				<Skeleton className="h-4 w-20" />
			</div>
		</div>
	);

	return (
		<Card className="w-full">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Recent Transactions</CardTitle>
						<p className="text-muted-foreground text-sm">
							{selectedNetwork
								? `${getNetworkInfo(selectedNetwork)?.name || "Selected network"}`
								: "All networks"}{" "}
							• Last {limit} transactions
						</p>
					</div>
					{isRefetching && (
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<div className="h-4 w-4 animate-spin rounded-full border-primary border-b-2" />
							Updating...
						</div>
					)}
				</div>

				{/* Network Filter and Controls */}
				<div className="space-y-2">
					<div className="flex flex-wrap gap-2">
						<Button
							variant={selectedNetwork === null ? "default" : "outline"}
							size="sm"
							onClick={() => setSelectedNetwork(null)}
						>
							All Networks
						</Button>
						{SUPPORTED_NETWORKS.map(({ chain, name, logo }) => (
							<Button
								key={chain.id}
								variant={selectedNetwork === chain.id ? "default" : "outline"}
								size="sm"
								onClick={() => setSelectedNetwork(chain.id)}
							>
								{logo} {name}
							</Button>
						))}
					</div>

					{/* Virtualization and Limit Controls */}
					<div className="flex items-center gap-4 text-sm">
						<div className="flex items-center gap-2">
							<label htmlFor="limit-select" className="text-muted-foreground">
								Show:
							</label>
							<select
								id="limit-select"
								value={limit}
								onChange={(e) => setLimit(Number.parseInt(e.target.value))}
								className="rounded border px-2 py-1 text-sm"
							>
								<option value={12}>12 items</option>
								<option value={50}>50 items</option>
								<option value={100}>100 items</option>
								<option value={500}>500 items</option>
							</select>
						</div>

						{shouldUseVirtualization && (
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="virtualization-toggle"
									checked={useVirtualization}
									onChange={(e) => setUseVirtualization(e.target.checked)}
									className="rounded"
								/>
								<label
									htmlFor="virtualization-toggle"
									className="text-muted-foreground"
								>
									Virtual scrolling ({allTransactions.length} items)
								</label>
							</div>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{isLoading ? (
						// Show skeleton loading state
						Array.from({ length: 3 }, (_, i) => (
							<div key={`transaction-skeleton-${i + 1}`}>
								{renderTransactionSkeleton()}
							</div>
						))
					) : hasError ? (
						<div className="py-8 text-center">
							<p className="text-muted-foreground">
								Error loading transactions
							</p>
							<Button
								variant="outline"
								size="sm"
								className="mt-2"
								onClick={() => transactionQueries.forEach((q) => q.refetch())}
							>
								Try Again
							</Button>
						</div>
					) : allTransactions.length === 0 ? (
						<div className="py-8 text-center">
							<p className="text-muted-foreground">No transactions found</p>
							<p className="mt-1 text-muted-foreground text-sm">
								{address
									? "Try connecting to a different network or making some transactions"
									: "Connect your wallet to view transactions"}
							</p>
						</div>
					) : shouldUseVirtualization && useVirtualization ? (
						<VirtualizedTransactionList
							transactions={allTransactions}
							getNetworkInfo={getNetworkInfo}
							formatAddress={formatAddress}
							formatDate={formatDate}
							getExplorerLink={getExplorerLink}
						/>
					) : (
						allTransactions.map((tx) => {
							const networkInfo = getNetworkInfo(tx.chainId);
							return (
								<div
									key={`${tx.hash}-${tx.chainId}`}
									className="space-y-2 rounded-lg border p-4"
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<span className="font-medium">{tx.token}</span>
											{networkInfo && (
												<span className="rounded-full bg-muted px-2 py-1 text-xs">
													{networkInfo.logo} {networkInfo.name}
												</span>
											)}
											<span className="text-muted-foreground text-sm">
												{formatDate(tx.timestamp * 1000)}
											</span>
										</div>
										<span className="font-mono text-sm">
											{tx.token === "ETH"
												? `${(Number.parseFloat(tx.amount) / 1e18).toFixed(4)} ${tx.token}`
												: `${(Number.parseFloat(tx.amount) / 1e6).toFixed(2)} ${tx.token}`}
										</span>
									</div>

									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<p className="text-muted-foreground">From</p>
											<a
												href={getExplorerLink(tx.from, tx.chainId, "address")}
												target="_blank"
												rel="noopener noreferrer"
												className="font-mono text-blue-600 hover:underline"
											>
												{formatAddress(tx.from)}
											</a>
										</div>
										<div>
											<p className="text-muted-foreground">To</p>
											<a
												href={getExplorerLink(tx.to, tx.chainId, "address")}
												target="_blank"
												rel="noopener noreferrer"
												className="font-mono text-blue-600 hover:underline"
											>
												{formatAddress(tx.to)}
											</a>
										</div>
									</div>

									<div className="flex items-center justify-between text-sm">
										<a
											href={getExplorerLink(tx.hash, tx.chainId, "tx")}
											target="_blank"
											rel="noopener noreferrer"
											className="font-mono text-blue-600 hover:underline"
										>
											{formatAddress(tx.hash)}
										</a>
										<span className="text-muted-foreground">
											Block #{tx.blockNumber}
										</span>
									</div>
								</div>
							);
						})
					)}
				</div>
			</CardContent>
		</Card>
	);
}
