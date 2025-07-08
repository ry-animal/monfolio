import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function NetworkSelector() {
	const { isConnected } = useAccount();

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

	return null;
}
