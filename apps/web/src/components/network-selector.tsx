import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { arbitrumSepolia, optimismSepolia, sepolia } from "wagmi/chains";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

const SUPPORTED_NETWORKS = [
	{ chain: sepolia, name: "Ethereum Sepolia", logo: "⚡" },
	{ chain: arbitrumSepolia, name: "Arbitrum Sepolia", logo: "🔵" },
	{ chain: optimismSepolia, name: "Optimism Sepolia", logo: "🔴" },
];

export function NetworkSelector() {
	const { isConnected } = useAccount();
	const chainId = useChainId();
	const [selectedNetworks, setSelectedNetworks] = useState<number[]>([
		sepolia.id,
	]);

	const toggleNetwork = (networkId: number) => {
		setSelectedNetworks((prev) => {
			const newSelection = prev.includes(networkId)
				? prev.filter((id) => id !== networkId)
				: [...prev, networkId];

			// Ensure at least one network is always selected
			return newSelection.length === 0 ? [networkId] : newSelection;
		});
	};

	if (!isConnected) {
		return (
			<Card className="mx-auto w-full max-w-md">
				<CardHeader>
					<CardTitle>Network Selection</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-center text-muted-foreground">
						Please connect your wallet to select networks
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader>
				<CardTitle>Select Networks</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{SUPPORTED_NETWORKS.map(({ chain, name, logo }) => (
					<div key={chain.id} className="flex items-center space-x-2">
						<Checkbox
							id={`network-${chain.id}`}
							checked={selectedNetworks.includes(chain.id)}
							onCheckedChange={() => toggleNetwork(chain.id)}
						/>
						<Label
							htmlFor={`network-${chain.id}`}
							className="flex cursor-pointer items-center gap-2"
						>
							<span>{logo}</span>
							<span>{name}</span>
							{chainId === chain.id && (
								<span className="rounded bg-green-500 px-2 py-1 text-white text-xs">
									Connected
								</span>
							)}
						</Label>
					</div>
				))}
				<div className="text-muted-foreground text-sm">
					At least one network must be selected
				</div>
			</CardContent>
		</Card>
	);
}
