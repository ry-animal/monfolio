import { z } from "zod";

export const CHAIN_CONFIG = {
	11155111: {
		name: "Ethereum Sepolia",
		rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
		explorerApiUrl: "https://api.etherscan.io/v2/api",
		balanceApiUrl: "https://api.etherscan.io/v2/api",
		nativeToken: "ETH",
		usdcAddress: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
		chainId: 11155111,
	},
	421614: {
		name: "Arbitrum Sepolia",
		rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
		explorerApiUrl: "https://api.etherscan.io/v2/api",
		balanceApiUrl: "https://api.etherscan.io/v2/api",
		nativeToken: "ETH",
		usdcAddress: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
		chainId: 421614,
	},
	11155420: {
		name: "Optimism Sepolia",
		rpcUrl: "https://sepolia.optimism.io",
		explorerApiUrl: "https://api.etherscan.io/v2/api",
		balanceApiUrl: "https://api.etherscan.io/v2/api",
		nativeToken: "ETH",
		usdcAddress: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
		chainId: 11155420,
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
		const ethTransactions = await fetchNativeTransactions(
			address,
			config.explorerApiUrl,
			apiKey,
			chainId,
			page,
			offset,
		);

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
		return [];
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
	const config = CHAIN_CONFIG[chainId];

	// Use URLSearchParams for proper URL encoding
	const params = new URLSearchParams({
		chainid: config.chainId.toString(),
		module: "account",
		action: "txlist",
		address: address,
		page: page.toString(),
		offset: offset.toString(),
		sort: "desc",
	});

	if (apiKey) {
		params.append("apikey", apiKey);
	}

	const url = `${apiUrl}?${params.toString()}`;

	const response = await fetch(url);
	const data = (await response.json()) as EtherscanResponse;

	if (data.status !== "1") {
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
	const config = CHAIN_CONFIG[chainId];

	// Use URLSearchParams for proper URL encoding
	const params = new URLSearchParams({
		chainid: config.chainId.toString(),
		module: "account",
		action: "tokentx",
		contractaddress: contractAddress,
		address: address,
		page: page.toString(),
		offset: offset.toString(),
		sort: "desc",
	});

	if (apiKey) {
		params.append("apikey", apiKey);
	}

	const url = `${apiUrl}?${params.toString()}`;

	const response = await fetch(url);
	const data = (await response.json()) as EtherscanResponse;

	if (data.status !== "1") {
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
		case 11155111:
			return etherscanKey;
		case 421614:
			return etherscanKey;
		case 11155420:
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
		console.log(`Fetching balance for chain ${chainId}, address: ${address}`);

		// Use URLSearchParams for proper URL encoding
		const ethBalanceParams = new URLSearchParams({
			chainid: config.chainId.toString(),
			module: "account",
			action: "balance",
			address: address,
			tag: "latest",
		});

		if (apiKey) {
			ethBalanceParams.append("apikey", apiKey);
		}

		const ethBalanceUrl = `${config.balanceApiUrl}?${ethBalanceParams.toString()}`;

		console.log(`ETH balance URL for chain ${chainId}: ${ethBalanceUrl}`);
		const ethResponse = await fetch(ethBalanceUrl);
		const ethData = (await ethResponse.json()) as BalanceResponse;

		console.log(`ETH balance response for chain ${chainId}:`, ethData);

		if (ethData.status !== "1") {
			console.error(
				`ETH balance API error for chain ${chainId}: ${ethData.message}, URL: ${ethBalanceUrl}`,
			);
			return { eth: "0", usdc: "0" };
		}

		// Add debugging to see what balance we're getting
		console.log(`ETH balance for ${address} on chain ${chainId}: ${ethData.result}`);

		// Use URLSearchParams for proper URL encoding
		const usdcBalanceParams = new URLSearchParams({
			chainid: config.chainId.toString(),
			module: "account",
			action: "tokenbalance",
			contractaddress: config.usdcAddress,
			address: address,
			tag: "latest",
		});

		if (apiKey) {
			usdcBalanceParams.append("apikey", apiKey);
		}

		const usdcBalanceUrl = `${config.balanceApiUrl}?${usdcBalanceParams.toString()}`;

		console.log(`USDC balance URL for chain ${chainId}: ${usdcBalanceUrl}`);
		const usdcResponse = await fetch(usdcBalanceUrl);
		const usdcData = (await usdcResponse.json()) as BalanceResponse;

		console.log(`USDC balance response for chain ${chainId}:`, usdcData);

		const usdcBalance = usdcData.status === "1" ? usdcData.result : "0";

		const result = {
			eth: ethData.result,
			usdc: usdcBalance,
		};

		console.log(`Final balance result for chain ${chainId}:`, result);
		return result;
	} catch (error) {
		console.error(`Error fetching balance for chain ${chainId}:`, error);
		console.error(
			"Stack trace:",
			error instanceof Error ? error.stack : "No stack trace",
		);
		return { eth: "0", usdc: "0" };
	}
}
