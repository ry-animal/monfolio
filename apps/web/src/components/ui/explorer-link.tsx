import { ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface ExplorerLinkProps {
	href: string;
	children: React.ReactNode;
	className?: string;
	tooltip?: string;
}

export function ExplorerLink({
	href,
	children,
	className,
	tooltip,
}: ExplorerLinkProps) {
	if (href === "#") {
		return <span className={className}>{children}</span>;
	}

	const linkElement = (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer nofollow"
			className={`inline-flex items-center gap-1 font-mono text-blue-600 hover:underline ${className}`}
		>
			{children}
			<ExternalLink className="size-3" />
		</a>
	);

	if (tooltip) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>{linkElement}</TooltipTrigger>
				<TooltipContent>{tooltip}</TooltipContent>
			</Tooltip>
		);
	}

	return linkElement;
}
