import { cn } from "@/lib/utils";

interface TokenIconProps {
	token: "ETH" | "USDC";
	networkId?: number;
	size?: "sm" | "md" | "lg";
	className?: string;
}

const TOKEN_ICONS = {
	ETH: "/eth.svg",
	USDC: "/USDC.png",
};

const NETWORK_ICONS = {
	11155111: "/eth.svg", // Sepolia
	421614: "/arb.png", // Arbitrum Sepolia
	11155420: "/op.png", // Optimism Sepolia
	84532: "/base.png", // Base Sepolia - we'll need to add this
};

const NETWORK_LABELS = {
	11155111: "ETH",
	421614: "ARB",
	11155420: "OP",
	84532: "BASE",
};

const SIZE_CONFIGS = {
	sm: {
		container: "w-8 h-8",
		badge: "w-3 h-3",
		badgeOffset: "-top-0.5 -right-0.5",
	},
	md: {
		container: "w-10 h-10",
		badge: "w-4 h-4",
		badgeOffset: "-top-1 -right-1",
	},
	lg: {
		container: "w-16 h-16",
		badge: "w-5 h-5",
		badgeOffset: "-top-1 -right-1",
	},
};

export function TokenIcon({
	token,
	networkId,
	size = "md",
	className,
}: TokenIconProps) {
	const config = SIZE_CONFIGS[size];
	const tokenIcon = TOKEN_ICONS[token];
	const networkIcon = networkId
		? NETWORK_ICONS[networkId as keyof typeof NETWORK_ICONS]
		: null;
	const networkLabel = networkId
		? NETWORK_LABELS[networkId as keyof typeof NETWORK_LABELS]
		: null;

	return (
		<div className={cn("relative", config.container, className)}>
			{/* Main token icon */}
			<div className="h-full w-full overflow-hidden rounded-full bg-white dark:bg-gray-100">
				{tokenIcon ? (
					<img
						src={tokenIcon}
						alt={token}
						className="h-full w-full object-cover"
					/>
				) : (
					<div
						className={cn(
							"flex h-full w-full items-center justify-center rounded-full",
							token === "ETH" ? "bg-blue-500" : "bg-blue-600",
						)}
					>
						<span className="font-bold text-white">
							{token === "ETH" ? "Ξ" : "$"}
						</span>
					</div>
				)}
			</div>

			{/* Network badge */}
			{networkId && (
				<div
					className={cn(
						"absolute rounded-full border border-gray-200 bg-white p-px shadow-sm dark:border-gray-700 dark:bg-gray-900",
						config.badgeOffset,
					)}
				>
					<div className={cn("overflow-hidden rounded-full", config.badge)}>
						{networkIcon ? (
							<img
								src={networkIcon}
								alt={networkLabel || "Network"}
								className="h-full w-full object-cover"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center rounded-full bg-gray-400">
								<span className="font-bold text-[10px] text-white">
									{networkLabel?.slice(0, 2)}
								</span>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
