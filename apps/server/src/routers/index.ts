import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
	batchInsertTransactions,
	getRecentTransactionsAllChains,
	getTransactionCount,
	getTransactionHistory,
	getTransactionHistoryCursor,
} from "../db/helpers";
import { publicProcedure, router } from "../lib/trpc";
import {
	CHAIN_CONFIG,
	type ChainId,
	fetchBalance,
	fetchTransactions,
} from "../services/blockchain";
import { calculateUsdValue, fetchTokenPrices } from "../services/coingecko";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),

	getBalance: publicProcedure
		.input(
			z.object({
				address: z.string().min(1, "Address is required"),
				chainId: z.number().positive("Chain ID must be positive"),
			}),
		)
		.query(async ({ input }) => {
			try {
				const { address, chainId } = input;

				if (!(chainId in CHAIN_CONFIG)) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: `Unsupported chain ID: ${chainId}. Supported chains: ${Object.keys(CHAIN_CONFIG).join(", ")}`,
					});
				}

				const balance = await fetchBalance(address, chainId as ChainId);
				const prices = await fetchTokenPrices();

				const ethUsdValue = calculateUsdValue(
					balance.eth,
					18,
					prices.ethereum.usd,
				);
				const usdcUsdValue = calculateUsdValue(
					balance.usdc,
					6,
					prices["usd-coin"].usd,
				);

				return {
					eth: balance.eth,
					usdc: balance.usdc,
					ethUsd: ethUsdValue,
					usdcUsd: usdcUsdValue,
					totalUsd: ethUsdValue + usdcUsdValue,
				};
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch balance",
					cause: error,
				});
			}
		}),

	getTransactions: publicProcedure
		.input(
			z.object({
				address: z.string().min(1, "Address is required"),
				chainId: z.number().positive("Chain ID must be positive").optional(),
				limit: z
					.number()
					.min(1, "Limit must be at least 1")
					.max(500, "Limit cannot exceed 500")
					.optional()
					.default(12),
				offset: z
					.number()
					.min(0, "Offset must be non-negative")
					.optional()
					.default(0),
				cursor: z
					.object({
						timestamp: z.number().positive("Timestamp must be positive"),
						blockNumber: z.number().positive("Block number must be positive"),
					})
					.optional(),
				useCursor: z.boolean().optional().default(false),
			}),
		)
		.query(async ({ input }) => {
			try {
				const { address, chainId, limit, offset, cursor, useCursor } = input;

				if (!chainId) {
					try {
						const cachedTransactions = await getRecentTransactionsAllChains(
							address,
							limit,
						);

						if (cachedTransactions.length >= limit) {
							return cachedTransactions;
						}

						const allChainIds = Object.keys(CHAIN_CONFIG).map(Number);
						const promises = allChainIds.map(async (cid) => {
							try {
								const blockchainTxs = await fetchTransactions(
									address,
									cid as ChainId,
									0, // startBlock (not used with pagination)
									"latest", // endBlock (not used with pagination)
									1, // page
									Math.floor(limit / allChainIds.length), // distribute limit across chains
								);

								const txsToInsert = blockchainTxs.map((tx) => ({
									hash: tx.hash,
									address: address,
									chainId: cid,
									blockNumber: Number.parseInt(tx.blockNumber),
									timestamp: Number.parseInt(tx.timeStamp),
									from: tx.from,
									to: tx.to,
									amount: tx.value,
									token: tx.tokenSymbol || "ETH",
								}));

								if (txsToInsert.length > 0) {
									await batchInsertTransactions(txsToInsert);
								}
							} catch (error) {
								console.error(
									`Failed to fetch transactions for chain ${cid}:`,
									error,
								);
							}
						});

						await Promise.allSettled(promises);

						return await getRecentTransactionsAllChains(address, limit);
					} catch (error) {
						throw new TRPCError({
							code: "INTERNAL_SERVER_ERROR",
							message: "Failed to fetch transactions from all chains",
							cause: error,
						});
					}
				}

				if (!(chainId in CHAIN_CONFIG)) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: `Unsupported chain ID: ${chainId}. Supported chains: ${Object.keys(CHAIN_CONFIG).join(", ")}`,
					});
				}

				if (useCursor) {
					const cachedTransactions = await getTransactionHistoryCursor(
						address,
						chainId,
						limit,
						cursor,
					);

					if (cachedTransactions.length > 0) {
						return cachedTransactions;
					}
				} else {
					const cachedTransactions = await getTransactionHistory(
						address,
						chainId,
						limit,
						offset,
					);

					if (cachedTransactions.length > 0) {
						return cachedTransactions;
					}
				}

				// Fetch the most recent transactions using pagination
				const blockchainTransactions = await fetchTransactions(
					address,
					chainId as ChainId,
					0, // startBlock (not used with pagination)
					"latest", // endBlock (not used with pagination)
					1, // page
					limit, // offset/limit
				);

				const txsToInsert = blockchainTransactions.map((tx) => ({
					hash: tx.hash,
					address: address,
					chainId: chainId,
					blockNumber: Number.parseInt(tx.blockNumber),
					timestamp: Number.parseInt(tx.timeStamp),
					from: tx.from,
					to: tx.to,
					amount: tx.value,
					token: tx.tokenSymbol || "ETH",
				}));

				if (txsToInsert.length > 0) {
					await batchInsertTransactions(txsToInsert);
				}

				return useCursor
					? await getTransactionHistoryCursor(address, chainId, limit, cursor)
					: await getTransactionHistory(address, chainId, limit, offset);
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch transactions",
					cause: error,
				});
			}
		}),

	getTransactionCount: publicProcedure
		.input(
			z.object({
				address: z.string().min(1, "Address is required"),
				chainId: z.number().positive("Chain ID must be positive"),
			}),
		)
		.query(async ({ input }) => {
			try {
				const { address, chainId } = input;

				if (!(chainId in CHAIN_CONFIG)) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: `Unsupported chain ID: ${chainId}. Supported chains: ${Object.keys(CHAIN_CONFIG).join(", ")}`,
					});
				}

				return await getTransactionCount(address, chainId);
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to get transaction count",
					cause: error,
				});
			}
		}),

	getTokenPrices: publicProcedure.query(async () => {
		try {
			return await fetchTokenPrices();
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to fetch token prices",
				cause: error,
			});
		}
	}),
});

export type AppRouter = typeof appRouter;
