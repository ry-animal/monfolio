export interface TokenPrice {
	usd: number;
	last_updated_at: number;
}

export interface PriceData {
	ethereum: TokenPrice;
	"usd-coin": TokenPrice;
}

export async function fetchTokenPrices(): Promise<PriceData> {
	const apiKey = process.env.COINGECKO_API_KEY;
	const baseUrl = apiKey
		? "https://pro-api.coingecko.com/api/v3"
		: "https://api.coingecko.com/api/v3";

	const params = new URLSearchParams({
		ids: "ethereum,usd-coin",
		vs_currencies: "usd",
		include_last_updated_at: "true",
	});

	if (apiKey) {
		params.append("x_cg_pro_api_key", apiKey);
	}

	const url = `${baseUrl}/simple/price?${params.toString()}`;

	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(
				`CoinGecko API error: ${response.status} ${response.statusText}`,
			);
		}

		const data = await response.json();
		return data as PriceData;
	} catch (error) {
		console.error("Error fetching token prices:", error);
		throw error;
	}
}

export function calculateUsdValue(
	amount: string,
	decimals: number,
	priceUsd: number,
): number {
	const amountNumber = Number.parseFloat(amount);
	const adjustedAmount = amountNumber / 10 ** decimals;
	return adjustedAmount * priceUsd;
}
