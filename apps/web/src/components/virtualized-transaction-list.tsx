import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { TokenIcon } from "./ui/token-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

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

interface VirtualizedTransactionListProps {
	transactions: Transaction[];
	getNetworkInfo: (chainId: number) => { name: string } | undefined;
	formatAddress: (address: string) => string;
	formatDate: (timestamp: number) => string;
	getExplorerLink: (
		hash: string,
		chainId: number,
		type: "tx" | "address",
	) => string;
}

export function VirtualizedTransactionList({
	transactions,
	getNetworkInfo,
	formatAddress,
	formatDate,
	getExplorerLink,
}: VirtualizedTransactionListProps) {
	const parentRef = useRef<HTMLDivElement>(null);

	const virtualizer = useVirtualizer({
		count: transactions.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 120, // Estimated height of each transaction item
		overscan: 5, // Render 5 items outside the visible area
	});

	if (transactions.length === 0) {
		return (
			<div className="py-8 text-center">
				<p className="text-muted-foreground">No transactions found</p>
			</div>
		);
	}

	return (
		<div
			ref={parentRef}
			className="h-[600px] overflow-auto" // Fixed height for virtualization
		>
			<div
				style={{
					height: `${virtualizer.getTotalSize()}px`,
					width: "100%",
					position: "relative",
				}}
			>
				{virtualizer.getVirtualItems().map((virtualItem) => {
					const tx = transactions[virtualItem.index];
					const networkInfo = getNetworkInfo(tx.chainId);

					return (
						<div
							key={virtualItem.key}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								height: `${virtualItem.size}px`,
								transform: `translateY(${virtualItem.start}px)`,
							}}
						>
							<div className="mx-1 mb-2 space-y-2 rounded-lg border p-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<TokenIcon
											token={tx.token as "ETH" | "USDC"}
											networkId={tx.chainId}
											size="sm"
										/>
										<div className="flex flex-col">
											<span className="font-medium">{tx.token}</span>
											{networkInfo && (
												<span className="text-xs text-muted-foreground">
													{networkInfo.name}
												</span>
											)}
										</div>
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
										<Tooltip>
											<TooltipTrigger asChild>
												<a
													href={getExplorerLink(tx.from, tx.chainId, "address")}
													target="_blank"
													rel="noopener noreferrer"
													className="font-mono text-blue-600 hover:underline"
												>
													{formatAddress(tx.from)}
												</a>
											</TooltipTrigger>
											<TooltipContent>
												View sender address on explorer
											</TooltipContent>
										</Tooltip>
									</div>
									<div>
										<p className="text-muted-foreground">To</p>
										<Tooltip>
											<TooltipTrigger asChild>
												<a
													href={getExplorerLink(tx.to, tx.chainId, "address")}
													target="_blank"
													rel="noopener noreferrer"
													className="font-mono text-blue-600 hover:underline"
												>
													{formatAddress(tx.to)}
												</a>
											</TooltipTrigger>
											<TooltipContent>
												View recipient address on explorer
											</TooltipContent>
										</Tooltip>
									</div>
								</div>

								<div className="flex items-center justify-between text-sm">
									<Tooltip>
										<TooltipTrigger asChild>
											<a
												href={getExplorerLink(tx.hash, tx.chainId, "tx")}
												target="_blank"
												rel="noopener noreferrer"
												className="font-mono text-blue-600 hover:underline"
											>
												{formatAddress(tx.hash)}
											</a>
										</TooltipTrigger>
										<TooltipContent>
											View transaction on explorer
										</TooltipContent>
									</Tooltip>
									<span className="text-muted-foreground">
										Block #{tx.blockNumber}
									</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
