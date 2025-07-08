import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAccount } from "wagmi";
import { arbitrumSepolia, optimismSepolia, sepolia } from "wagmi/chains";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const networks = [
	{ id: sepolia.id, name: "Ethereum", icon: "🔵" },
	{ id: optimismSepolia.id, name: "Optimism", icon: "🔴" },
	{ id: arbitrumSepolia.id, name: "Arbitrum", icon: "⚡" },
];

interface NetworkSelectorProps {
	selectedNetworks?: number[];
	onNetworkChange?: (networks: number[]) => void;
	variant?: "single" | "multi";
}

export function NetworkSelector({
	selectedNetworks = [sepolia.id],
	onNetworkChange,
	variant = "multi",
}: NetworkSelectorProps) {
	const { isConnected } = useAccount();
	const [internalSelected, setInternalSelected] = useState<number[]>(
		selectedNetworks.length > 0 ? selectedNetworks : [sepolia.id],
	);

	const currentSelected = onNetworkChange ? selectedNetworks : internalSelected;
	const handleChange = onNetworkChange || setInternalSelected;

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

	const handleNetworkToggle = (networkId: number) => {
		if (variant === "single") {
			handleChange([networkId]);
		} else {
			if (currentSelected.includes(networkId)) {
				// Prevent deselecting if it's the only selected network
				if (currentSelected.length > 1) {
					handleChange(currentSelected.filter((id) => id !== networkId));
				}
			} else {
				handleChange([...currentSelected, networkId]);
			}
		}
	};

	const selectedCount = currentSelected.length;
	const buttonText =
		selectedCount === 1 ? "(1) Network" : `(${selectedCount}) Networks`;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className="w-full justify-between">
					{buttonText}
					<ChevronDown className="ml-2 h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				{networks.map((network) => (
					<DropdownMenuCheckboxItem
						key={network.id}
						checked={currentSelected.includes(network.id)}
						onCheckedChange={() => handleNetworkToggle(network.id)}
					>
						<div className="flex items-center gap-2">
							<span className="text-lg">{network.icon}</span>
							<span>{network.name}</span>
						</div>
					</DropdownMenuCheckboxItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
