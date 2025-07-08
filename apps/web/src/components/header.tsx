import { LogOut } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";
import { ModeToggle } from "./mode-toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function Header() {
	const { isConnected } = useAccount();
	const { disconnect } = useDisconnect();

	return (
		<div>
			<div className="flex flex-row items-center justify-end px-2 py-4">
				<div className="flex items-center gap-2">
					{isConnected && (
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type="button"
									onClick={() => disconnect()}
									className="cursor-pointer rounded p-1 hover:bg-muted"
								>
									<LogOut className="size-4" aria-label="Disconnect wallet" />
								</button>
							</TooltipTrigger>
							<TooltipContent>Disconnect wallet</TooltipContent>
						</Tooltip>
					)}
					<ModeToggle />
				</div>
			</div>
		</div>
	);
}
