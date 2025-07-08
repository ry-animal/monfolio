import { cn } from "@/lib/utils";
import { CaptionL } from "../design-system";

interface TabButtonProps {
	isActive: boolean;
	onClick: () => void;
	children: React.ReactNode;
	className?: string;
}

export function TabButton({
	isActive,
	onClick,
	children,
	className,
}: TabButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"rounded-lg border px-4 py-2 transition-all duration-200",
				isActive
					? "border-border bg-background shadow-sm"
					: "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40 hover:bg-muted/50 hover:text-foreground",
				className,
			)}
		>
			<CaptionL weight="medium" color={isActive ? "primary" : "secondary"}>
				{children}
			</CaptionL>
		</button>
	);
}
