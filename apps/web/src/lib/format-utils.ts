export const formatAddress = (address: string): string => {
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatDate = (timestamp: number): string => {
	return new Date(timestamp).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

export const formatTokenAmount = (amount: string, token: string): string => {
	const decimals = token === "ETH" ? 1e18 : 1e6;
	const precision = token === "ETH" ? 4 : 2;
	return `${(Number.parseFloat(amount) / decimals).toFixed(precision)} ${token}`;
};

export const formatCurrency = (amount: number): string => {
	return `$${amount.toFixed(2)}`;
};
