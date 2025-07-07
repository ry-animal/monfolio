import { useAccount, useDisconnect } from "wagmi";
import { BalanceDisplay } from "./balance-display";
import { BodyL, BodyM, H1 } from "./design-system";
import { NetworkSelector } from "./network-selector";
import { TransactionHistory } from "./transaction-history";
import { WalletButton } from "./wallet-button";

export function Dashboard() {
	const { isConnected, address } = useAccount();
	const { disconnect } = useDisconnect();

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
					<BodyL className="text-muted-foreground">
						Your portfolio across Ethereum, Arbitrum, and Optimism testnets
					</BodyL>
				</div>

				<div className="flex items-center gap-2">
					<BodyL weight="medium" className="text-gray-700">
						{address
							? `${address.slice(0, 6)}...${address.slice(-4)}`
							: "Connected"}
					</BodyL>
					<button
						type="button"
						onClick={() => navigator.clipboard.writeText(address || "")}
						className="rounded p-1 hover:bg-gray-100"
						title="Copy address"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
							<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
						</svg>
					</button>
					<button
						type="button"
						onClick={() => disconnect()}
						className="ml-2 rounded p-1 hover:bg-gray-100"
						title="Disconnect wallet"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
							<polyline points="16,17 21,12 16,7" />
							<line x1="21" y1="12" x2="9" y2="12" />
						</svg>
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				<div className="lg:col-span-1">
					<NetworkSelector />
				</div>
				<div className="lg:col-span-2">
					<BalanceDisplay />
				</div>
			</div>

			<div className="w-full">
				<TransactionHistory />
			</div>
		</div>
	);
}
