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
				"pb-2 transition-colors",
				isActive
					? "border-monad-purple border-b-2 font-medium"
					: "text-muted-foreground hover:text-foreground",
				className,
			)}
		>
			<CaptionL weight="medium" color={isActive ? "primary" : "secondary"}>
				{children}
			</CaptionL>
		</button>
	);
}
