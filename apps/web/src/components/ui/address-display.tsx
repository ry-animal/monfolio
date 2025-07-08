import { Copy, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { BodyS, H6 } from "../design-system";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface AddressDisplayProps {
	address: string;
	label?: string;
	showCopy?: boolean;
	showExplorer?: boolean;
	explorerUrl?: string;
	className?: string;
}

export function AddressDisplay({
	address,
	label,
	showCopy = true,
	showExplorer = true,
	explorerUrl,
	className,
}: AddressDisplayProps) {
	const [copied, setCopied] = useState(false);
	const [tooltipOpen, setTooltipOpen] = useState(false);

	const formatAddress = (addr: string) => {
		return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
	};

	const handleCopy = () => {
		navigator.clipboard.writeText(address);
		setCopied(true);
		setTooltipOpen(true);
		setTimeout(() => {
			setCopied(false);
		}, 2000);
	};

	useEffect(() => {
		if (!tooltipOpen && copied) {
			setCopied(false);
		}
	}, [tooltipOpen, copied]);

	return (
		<div className={className}>
			{label && (
				<BodyS color="secondary" className="mb-1">
					{label}
				</BodyS>
			)}
			<div className="flex items-center gap-2">
				<H6 weight="bold">{formatAddress(address)}</H6>
				{showCopy && (
					<Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
						<TooltipTrigger asChild>
							<button
								type="button"
								onClick={handleCopy}
								className="cursor-pointer rounded p-1 hover:bg-muted"
							>
								<Copy className="size-3" />
							</button>
						</TooltipTrigger>
						<TooltipContent key={copied ? "copied" : "copy"}>
							{copied ? "Copied!" : "Copy address"}
						</TooltipContent>
					</Tooltip>
				)}
				{showExplorer && explorerUrl && (
					<Tooltip>
						<TooltipTrigger asChild>
							<a
								href={explorerUrl}
								target="_blank"
								rel="noopener noreferrer nofollow"
								className="cursor-pointer rounded p-1 hover:bg-muted"
							>
								<ExternalLink className="size-3" />
							</a>
						</TooltipTrigger>
						<TooltipContent>View on explorer</TooltipContent>
					</Tooltip>
				)}
			</div>
		</div>
	);
}
