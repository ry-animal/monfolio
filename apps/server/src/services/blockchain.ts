import { z } from "zod";

// Chain configurations
export const CHAIN_CONFIG = {
	11155111: {
		// Ethereum Sepolia
		name: "Ethereum Sepolia",
		rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
		explorerApiUrl: "https://api-sepolia.etherscan.io/api",
		balanceApiUrl: "https://api.etherscan.io/v2/api",
		nativeToken: "ETH",
		usdcAddress: "0xA0b86a33E6A9b644f3c4c9f6dC80b0d0D1C1Ca01",
	},
	421614: {
		// Arbitrum Sepolia
		name: "Arbitrum Sepolia",
		rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
		explorerApiUrl: "https://api-sepolia.arbiscan.io/api",
		balanceApiUrl: "https://api.etherscan.io/v2/api",
		nativeToken: "ETH",
		usdcAddress: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
	},
	11155420: {
		// Optimism Sepolia
		name: "Optimism Sepolia",
		rpcUrl: "https://sepolia.optimism.io",
		explorerApiUrl: "https://api-sepolia-optimistic.etherscan.io/api",
		balanceApiUrl: "https://api.etherscan.io/v2/api",
		nativeToken: "ETH",
		usdcAddress: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
	},
} as const;

export type ChainId = keyof typeof CHAIN_CONFIG;

export const TransactionSchema = z.object({
	hash: z.string(),
	blockNumber: z.string(),
	timeStamp: z.string(),
	from: z.string(),
	to: z.string(),
	value: z.string(),
	contractAddress: z.string().optional(),
	tokenName: z.string().optional(),
	tokenSymbol: z.string().optional(),
	tokenDecimal: z.string().optional(),
});

export type BlockchainTransaction = z.infer<typeof TransactionSchema>;

export async function fetchTransactions(
	address: string,
	chainId: ChainId,
	startBlock = 0,
	endBlock: number | string = "latest",
	page = 1,
	offset = 12,
	env?: any,
): Promise<BlockchainTransaction[]> {
	const config = CHAIN_CONFIG[chainId];
	const apiKey = getApiKey(chainId, env);

	if (!apiKey) {
		console.warn(`No API key for chain ${chainId}, trying public API`);
	}

	try {
		// Fetch native token transactions
		const ethTransactions = await fetchNativeTransactions(
			address,
			config.explorerApiUrl,
			apiKey,
			chainId,
			page,
			offset,
		);

		// Fetch USDC token transactions
		const usdcTransactions = await fetchTokenTransactions(
			address,
			config.usdcAddress,
			config.explorerApiUrl,
			apiKey,
			chainId,
			page,
			offset,
		);

		return [...ethTransactions, ...usdcTransactions];
	} catch (error) {
		console.error(`Error fetching transactions for chain ${chainId}:`, error);
		return []; // Return empty array instead of throwing
	}
}

interface EtherscanResponse {
	status: string;
	message: string;
	result: EtherscanTransaction[];
}

interface EtherscanTransaction {
	hash: string;
	blockNumber: string;
	timeStamp: string;
	from: string;
	to: string;
	value: string;
	contractAddress?: string;
	tokenName?: string;
	tokenSymbol?: string;
	tokenDecimal?: string;
}

async function fetchNativeTransactions(
	address: string,
	apiUrl: string,
	apiKey: string | undefined,
	chainId: ChainId,
	page: number,
	offset: number,
): Promise<BlockchainTransaction[]> {
	const url = apiKey
		? `${apiUrl}?module=account&action=txlist&address=${address}&page=${page}&offset=${offset}&sort=desc&apikey=${apiKey}`
		: `${apiUrl}?module=account&action=txlist&address=${address}&page=${page}&offset=${offset}&sort=desc`;

	const response = await fetch(url);
	const data = (await response.json()) as EtherscanResponse;

	if (data.status !== "1") {
		// Handle common API errors gracefully
		if (data.message === "No transactions found" || data.message === "NOTOK") {
			return [];
		}
		throw new Error(`API error: ${data.message}`);
	}

	return data.result.map((tx: EtherscanTransaction) => ({
		...tx,
		tokenSymbol: "ETH",
		tokenName: "Ethereum",
		tokenDecimal: "18",
	}));
}

async function fetchTokenTransactions(
	address: string,
	contractAddress: string,
	apiUrl: string,
	apiKey: string | undefined,
	chainId: ChainId,
	page: number,
	offset: number,
): Promise<BlockchainTransaction[]> {
	const url = apiKey
		? `${apiUrl}?module=account&action=tokentx&contractaddress=${contractAddress}&address=${address}&page=${page}&offset=${offset}&sort=desc&apikey=${apiKey}`
		: `${apiUrl}?module=account&action=tokentx&contractaddress=${contractAddress}&address=${address}&page=${page}&offset=${offset}&sort=desc`;

	const response = await fetch(url);
	const data = (await response.json()) as EtherscanResponse;

	if (data.status !== "1") {
		// Handle common API errors gracefully
		if (data.message === "No transactions found" || data.message === "NOTOK") {
			return [];
		}
		throw new Error(`API error: ${data.message}`);
	}

	return data.result;
}

function getApiKey(chainId: ChainId, env?: any): string | undefined {
	const etherscanKey = env?.ETHERSCAN_API_KEY;
	switch (chainId) {
		case 11155111: // Ethereum Sepolia
			return etherscanKey;
		case 421614: // Arbitrum Sepolia
			return etherscanKey;
		case 11155420: // Optimism Sepolia
			return etherscanKey;
		default:
			return undefined;
	}
}

interface BalanceResponse {
	status: string;
	message: string;
	result: string;
}

export async function fetchBalance(
	address: string,
	chainId: ChainId,
	env?: any,
): Promise<{ eth: string; usdc: string }> {
	const config = CHAIN_CONFIG[chainId];
	const apiKey = getApiKey(chainId, env);

	if (!apiKey) {
		console.warn(`No API key for chain ${chainId}, trying public API`);
	}

	try {
		// Fetch ETH balance
		const ethBalanceUrl = apiKey
			? `${config.balanceApiUrl}?chainid=${chainId}&module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
			: `${config.balanceApiUrl}?chainid=${chainId}&module=account&action=balance&address=${address}&tag=latest`;
		const ethResponse = await fetch(ethBalanceUrl);
		const ethData = (await ethResponse.json()) as BalanceResponse;

		if (ethData.status !== "1") {
			console.error(
				`ETH balance API error for chain ${chainId}: ${ethData.message}, URL: ${ethBalanceUrl}`,
			);
			// Handle NOTOK gracefully by returning zero balance
			if (ethData.message === "NOTOK") {
				console.warn(
					`ETH balance API returned NOTOK for chain ${chainId}, using zero balance`,
				);
				return { eth: "0", usdc: "0" };
			}
			throw new Error(`ETH balance API error: ${ethData.message}`);
		}

		// Fetch USDC balance
		const usdcBalanceUrl = apiKey
			? `${config.balanceApiUrl}?chainid=${chainId}&module=account&action=tokenbalance&contractaddress=${config.usdcAddress}&address=${address}&tag=latest&apikey=${apiKey}`
			: `${config.balanceApiUrl}?chainid=${chainId}&module=account&action=tokenbalance&contractaddress=${config.usdcAddress}&address=${address}&tag=latest`;
		const usdcResponse = await fetch(usdcBalanceUrl);
		const usdcData = (await usdcResponse.json()) as BalanceResponse;

		const usdcBalance = usdcData.status === "1" ? usdcData.result : "0";

		return {
			eth: ethData.result,
			usdc: usdcBalance,
		};
	} catch (error) {
		console.error(`Error fetching balance for chain ${chainId}:`, error);
		return { eth: "0", usdc: "0" }; // Return zero balances instead of throwing
	}
}
