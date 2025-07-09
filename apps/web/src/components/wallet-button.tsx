import { useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { BodyM, CaptionM } from "./design-system";

interface WalletOption {
	id: string;
	name: string;
	icon: string;
}

const walletOptions: WalletOption[] = [
	{
		id: "phantom",
		name: "Phantom",
		icon: "/Phantom.png",
	},
	{
		id: "metamask",
		name: "MetaMask",
		icon: "/MetaMask.png",
	},
];

export function WalletButton() {
	const { connectAsync, connectors, isPending } = useConnect();
	const { isConnected } = useAccount();
	const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

	const handleWalletConnect = async (walletId: string) => {
		setConnectingWallet(walletId);
		console.log(
			"Available connectors:",
			connectors.map((c) => ({ id: c.id, name: c.name, type: c.type })),
		);
		console.log("Trying to connect to:", walletId);

		if (walletId === "phantom") {
			console.log(
				"All injected connectors:",
				connectors.filter((c) => c.id === "injected"),
			);
		}

		if (walletId === "metamask") {
			console.log(
				"MetaMask installed?",
				typeof window !== "undefined" && window.ethereum?.isMetaMask,
			);
			if (!window.ethereum?.isMetaMask) {
				alert(
					"MetaMask is not installed. Please install MetaMask to continue.",
				);
				setConnectingWallet(null);
				return;
			}
		}

		if (walletId === "phantom") {
			console.log(
				"Phantom installed?",
				typeof window !== "undefined" &&
				(window.ethereum?.isPhantom || window.solana?.isPhantom),
			);
			if (!window.ethereum?.isPhantom && !window.solana?.isPhantom) {
				alert("Phantom is not installed. Please install Phantom to continue.");
				setConnectingWallet(null);
				return;
			}
		}

		const connector = connectors.find((c) => {
			if (walletId === "metamask") {
				return (
					c.id === "metaMaskSDK" ||
					c.id === "metaMask" ||
					(c.id === "injected" && c.name?.toLowerCase().includes("metamask"))
				);
			}
			if (walletId === "phantom") {
				return (
					c.id === "app.phantom" ||
					(c.id === "injected" && c.name?.toLowerCase().includes("phantom"))
				);
			}
			return false;
		});

		console.log(
			"Found connector:",
			connector
				? { id: connector.id, name: connector.name, type: connector.type }
				: "none",
		);

		if (connector) {
			try {
				const result = await connectAsync({ connector });
				console.log("Connection successful:", result);
			} catch (error) {
				console.error("Connection failed:", error);
				if (error instanceof Error && "code" in error && error.code === 4001) {
					console.log("User rejected the connection");
				} else {
					alert(
						`Failed to connect to ${walletId}: ${error instanceof Error ? error.message : String(error)}`,
					);
				}
			} finally {
				setConnectingWallet(null);
			}
		} else {
			console.error(`No connector found for wallet: ${walletId}`);
			setConnectingWallet(null);
		}
	};

	if (isConnected) {
		return null;
	}

	return (
		<div className="space-y-3">
			{walletOptions.map((wallet) => (
				<button
					type="button"
					key={wallet.id}
					onClick={() => handleWalletConnect(wallet.id)}
					disabled={isPending}
					className="ml-6 flex w-[85%] cursor-pointer items-center gap-4 rounded-xl bg-muted px-4 pt-4 pb-2 transition-colors hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<img
						src={wallet.icon}
						alt={wallet.name}
						className="mb-4 size-8 rounded-lg"
					/>
					<div className="flex flex-col items-start">
						<BodyM weight="medium">{wallet.name}</BodyM>
						<div className="min-h-[16px]">
							{connectingWallet === wallet.id && (
								<CaptionM color="secondary">
									Continue in your {wallet.name} wallet.
								</CaptionM>
							)}
						</div>
					</div>
				</button>
			))}
		</div>
	);
}
