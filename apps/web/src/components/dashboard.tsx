import { useState } from "react";
import { useAccount } from "wagmi";
import { arbitrumSepolia, optimismSepolia, sepolia } from "wagmi/chains";
import { formatCurrency } from "../lib/format-utils";
import { CHAIN_EXPLORERS } from "../lib/web3";
import { trpc } from "../utils/trpc";
import { BalanceDisplay } from "./balance-display";
import { BodyL, CaptionL, H1, H5 } from "./design-system";
import { NetworkSelector } from "./network-selector";
import { TransactionHistory } from "./transaction-history";
import { AddressDisplay } from "./ui/address-display";
import { TabButton } from "./ui/tab-button";
import { WalletButton } from "./wallet-button";

export function Dashboard() {
	const { isConnected, address } = useAccount();
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
					<div className="rounded-2xl border bg-card py-6 shadow-lg">
						<div className="mb-4 flex items-center justify-center">
							<img src="/LMark.png" alt="Monfolio" className="size-8" />
						</div>

						<div className="mb-6 text-center">
							<BodyL weight="medium" className="text-card-foreground">
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
			</div>

			<div className="flex flex-col gap-4 md:flex-row md:gap-12">
				<AddressDisplay
					address={address || ""}
					label="Address"
					explorerUrl={getExplorerLink(address || "")}
				/>
				<div>
					<CaptionL color="secondary" className="mb-1">
						Total Balance
					</CaptionL>
					<H5 weight="bold">{formatCurrency(totalBalance)}</H5>
				</div>
			</div>

			<div className="flex gap-8 border-b">
				<TabButton
					isActive={activeTab === "balances"}
					onClick={() => setActiveTab("balances")}
				>
					Balances
				</TabButton>
				<TabButton
					isActive={activeTab === "transactions"}
					onClick={() => setActiveTab("transactions")}
				>
					Past Transactions
				</TabButton>
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
