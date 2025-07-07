import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { arbitrumSepolia, optimismSepolia, sepolia } from "wagmi/chains";
import { trpc } from "../utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

const SUPPORTED_NETWORKS = [
	{ chain: sepolia, name: "Ethereum Sepolia", logo: "⚡" },
	{ chain: arbitrumSepolia, name: "Arbitrum Sepolia", logo: "🔵" },
	{ chain: optimismSepolia, name: "Optimism Sepolia", logo: "🔴" },
];

export function BalanceDisplay() {
	const { address } = useAccount();
	const [totalUsd, setTotalUsd] = useState(0);
	const [isLoadingTotal, setIsLoadingTotal] = useState(false);

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

	// Calculate total USD value from all networks
	useEffect(() => {
		if (!address) {
			setTotalUsd(0);
			setIsLoadingTotal(false);
			return;
		}

		const allBalances = [sepoliaBalance, arbitrumBalance, optimismBalance];
		const isLoading = allBalances.some((balance) => balance.isLoading);
		const hasData = allBalances.every((balance) => balance.data);

		setIsLoadingTotal(isLoading);

		if (hasData && !isLoading) {
			const total = allBalances.reduce((sum, balance) => {
				return sum + (balance.data?.totalUsd || 0);
			}, 0);
			setTotalUsd(total);
		}
	}, [address, sepoliaBalance, arbitrumBalance, optimismBalance]);

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="text-center">Portfolio Balance</CardTitle>
				<div className="text-center">
					<div className="font-bold text-4xl text-green-600">
						{isLoadingTotal ? (
							<Skeleton className="mx-auto h-10 w-32" />
						) : (
							`$${totalUsd.toFixed(2)}`
						)}
					</div>
					<p className="text-muted-foreground text-sm">Total USD Value</p>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{SUPPORTED_NETWORKS.map(({ chain, name, logo }) => (
					<NetworkBalance
						key={chain.id}
						chainId={chain.id}
						chainName={name}
						chainLogo={logo}
						address={address}
					/>
				))}
			</CardContent>
		</Card>
	);
}

function NetworkBalance({
	chainId,
	chainName,
	chainLogo,
	address,
}: {
	chainId: number;
	chainName: string;
	chainLogo: string;
	address?: `0x${string}`;
}) {
	const { isLoading: ethLoading } = useBalance({
		address,
		chainId,
	});

	const {
		data: balanceData,
		isLoading: balanceLoading,
		error: balanceError,
	} = trpc.getBalance.useQuery(
		{ address: address as string, chainId },
		{
			enabled: !!address,
			refetchInterval: 30000, // Refetch every 30 seconds
			staleTime: 15000, // Consider data stale after 15 seconds
		},
	);

	const isLoading = ethLoading || balanceLoading;
	const hasError = balanceError;

	return (
		<div className="space-y-2 rounded-lg border p-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span>{chainLogo}</span>
					<span className="font-medium">{chainName}</span>
				</div>
				{hasError && (
					<span className="text-red-500 text-xs">Error loading</span>
				)}
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-1">
					<p className="text-muted-foreground text-sm">ETH Balance</p>
					{isLoading ? (
						<Skeleton className="h-4 w-20" />
					) : (
						<div className="space-y-1">
							<p className="font-mono">
								{balanceData
									? `${(Number.parseFloat(balanceData.eth) / 1e18).toFixed(4)} ETH`
									: "0.0000 ETH"}
							</p>
							<p className="text-muted-foreground text-xs">
								${balanceData?.ethUsd.toFixed(2) || "0.00"}
							</p>
						</div>
					)}
				</div>

				<div className="space-y-1">
					<p className="text-muted-foreground text-sm">USDC Balance</p>
					{isLoading ? (
						<Skeleton className="h-4 w-20" />
					) : (
						<div className="space-y-1">
							<p className="font-mono">
								{balanceData
									? `${(Number.parseFloat(balanceData.usdc) / 1e6).toFixed(2)} USDC`
									: "0.00 USDC"}
							</p>
							<p className="text-muted-foreground text-xs">
								${balanceData?.usdcUsd.toFixed(2) || "0.00"}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
