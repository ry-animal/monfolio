import { Copy, ExternalLink, LogOut } from "lucide-react";
import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { arbitrumSepolia, optimismSepolia, sepolia } from "wagmi/chains";
import { CHAIN_EXPLORERS } from "../lib/web3";
import { trpc } from "../utils/trpc";
import { BalanceDisplay } from "./balance-display";
import { BodyL, H1, H5 } from "./design-system";
import { NetworkSelector } from "./network-selector";
import { TransactionHistory } from "./transaction-history";
import { WalletButton } from "./wallet-button";

export function Dashboard() {
	const { isConnected, address } = useAccount();
	const { disconnect } = useDisconnect();
	const [activeTab, setActiveTab] = useState<"balances" | "transactions">(
		"balances",
	);
	const [selectedNetworks, setSelectedNetworks] = useState<number[]>([
		sepolia.id,
	]);
	const [transactionNetworks, setTransactionNetworks] = useState<number[]>([
		sepolia.id,
	]);

	// Get total balance across all networks
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

	const totalBalance = [
		sepoliaBalance,
		arbitrumBalance,
		optimismBalance,
	].reduce((sum, balance) => {
		return sum + (balance.data?.totalUsd || 0);
	}, 0);

	const getExplorerLink = (address: string, chainId: number = sepolia.id) => {
		const baseUrl = CHAIN_EXPLORERS[chainId as keyof typeof CHAIN_EXPLORERS];
		return baseUrl ? `${baseUrl}/address/${address}` : "#";
	};

	if (!isConnected) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="mx-auto mb-12 max-w-sm text-center md:mx-0 md:max-w-md md:text-left">
					<H1 color="monad-purple" weight="bold" className="mb-4">
						Monfolio
					</H1>
					<BodyL color="secondary">
						Track and manage your crypto
						<br />
						and NFT portfolio with ease.
					</BodyL>
				</div>

				<div className="mx-auto max-w-sm md:mx-0">
					<div className="rounded-2xl border border-gray-200 bg-white py-6 shadow-lg">
						<div className="mb-4 flex items-center justify-center">
							<img src="/LMark.png" alt="Monfolio" className="size-8" />
						</div>

						<div className="mb-6 text-center">
							<BodyL weight="medium" className="text-gray-800">
								Connect to Monfolio.
							</BodyL>
						</div>
						<WalletButton />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto space-y-8 px-4 py-8">
			<div className="flex items-start justify-between">
				<div className="space-y-4">
					<H1 color="monad-purple" weight="bold">
						Monfolio
					</H1>
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => disconnect()}
						className="rounded p-1 hover:bg-gray-100"
						title="Disconnect wallet"
					>
						<LogOut className="size-4" aria-label="Disconnect wallet" />
					</button>
				</div>
			</div>

			<div className="flex flex-col gap-4 md:flex-row md:gap-12">
				<div>
					<p className="mb-1 text-muted-foreground text-sm">Address</p>
					<div className="flex items-center gap-2">
						<span className="font-mono text-sm">
							{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""}
						</span>
						<button
							type="button"
							onClick={() => navigator.clipboard.writeText(address || "")}
							className="rounded p-1 hover:bg-gray-100"
							title="Copy address"
						>
							<Copy className="size-3" />
						</button>
						<a
							href={getExplorerLink(address || "")}
							target="_blank"
							rel="noopener noreferrer"
							className="rounded p-1 hover:bg-gray-100"
							title="View on Etherscan"
						>
							<ExternalLink className="size-3" />
						</a>
					</div>
				</div>
				<div>
					<p className="mb-1 text-muted-foreground text-sm">Total Balance</p>
					<p className="font-bold text-lg">${totalBalance.toFixed(2)}</p>
				</div>
			</div>

			<div className="flex gap-8 border-b">
				<button
					type="button"
					onClick={() => setActiveTab("balances")}
					className={`pb-2 ${activeTab === "balances"
						? "border-monad-purple border-b-2 font-medium"
						: "text-muted-foreground"
						}`}
				>
					Balances
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("transactions")}
					className={`pb-2 ${activeTab === "transactions"
						? "border-monad-purple border-b-2 font-medium"
						: "text-muted-foreground"
						}`}
				>
					Past Transactions
				</button>
			</div>

			{activeTab === "balances" ? (
				<div className="space-y-4">
					<H5>Balances</H5>
					<div className="w-64">
						<NetworkSelector
							selectedNetworks={selectedNetworks}
							onNetworkChange={setSelectedNetworks}
						/>
					</div>
					<BalanceDisplay selectedNetworks={selectedNetworks} />
				</div>
			) : (
				<div className="space-y-4">
					<H5>Past Transactions</H5>
					<div className="w-64">
						<NetworkSelector
							selectedNetworks={transactionNetworks}
							onNetworkChange={setTransactionNetworks}
						/>
					</div>
					<TransactionHistory selectedNetworks={transactionNetworks} />
				</div>
			)}
		</div>
	);
}
