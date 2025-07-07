import { z } from "zod";
import {
  publicProcedure,
  router,
} from "../lib/trpc";
import { fetchBalance, fetchTransactions, CHAIN_CONFIG, type ChainId } from "../services/blockchain";
import { fetchTokenPrices, calculateUsdValue } from "../services/coingecko";
import { 
  getLatestTxBlockNumber, 
  getTransactionHistory, 
  getTransactionHistoryCursor,
  getTransactionCount,
  batchInsertTransactions,
  getRecentTransactionsAllChains
} from "../db/helpers";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),

  getBalance: publicProcedure
    .input(
      z.object({
        address: z.string(),
        chainId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { address, chainId } = input;
      
      if (!(chainId in CHAIN_CONFIG)) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
      }

      const balance = await fetchBalance(address, chainId as ChainId);
      const prices = await fetchTokenPrices();

      const ethUsdValue = calculateUsdValue(balance.eth, 18, prices.ethereum.usd);
      const usdcUsdValue = calculateUsdValue(balance.usdc, 6, prices["usd-coin"].usd);

      return {
        eth: balance.eth,
        usdc: balance.usdc,
        ethUsd: ethUsdValue,
        usdcUsd: usdcUsdValue,
        totalUsd: ethUsdValue + usdcUsdValue,
      };
    }),

  getTransactions: publicProcedure
    .input(
      z.object({
        address: z.string(),
        chainId: z.number().optional(), // Make optional to support all chains
        limit: z.number().optional().default(12),
        offset: z.number().optional().default(0),
        cursor: z.object({
          timestamp: z.number(),
          blockNumber: z.number(),
        }).optional(),
        useCursor: z.boolean().optional().default(false),
      })
    )
    .query(async ({ input }) => {
      const { address, chainId, limit, offset, cursor, useCursor } = input;
      
      // If no chainId specified, get transactions from all chains
      if (!chainId) {
        const cachedTransactions = await getRecentTransactionsAllChains(address, limit);
        
        // If we have enough cached transactions, return them
        if (cachedTransactions.length >= limit) {
          return cachedTransactions;
        }
        
        // Otherwise, fetch from all supported chains
        const allChainIds = Object.keys(CHAIN_CONFIG).map(Number);
        const promises = allChainIds.map(async (cid) => {
          const latestBlock = await getLatestTxBlockNumber(address, cid);
          const blockchainTxs = await fetchTransactions(address, cid as ChainId, latestBlock);
          
          // Batch insert for better performance
          const txsToInsert = blockchainTxs.map(tx => ({
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
        });
        
        await Promise.allSettled(promises); // Don't fail if one chain fails
        
        return await getRecentTransactionsAllChains(address, limit);
      }
      
      if (!(chainId in CHAIN_CONFIG)) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
      }

      // Use cursor-based pagination for better performance with large datasets
      if (useCursor) {
        const cachedTransactions = await getTransactionHistoryCursor(address, chainId, limit, cursor);
        
        // If we have cached transactions, return them
        if (cachedTransactions.length > 0) {
          return cachedTransactions;
        }
      } else {
        // Use offset-based pagination for smaller datasets
        const cachedTransactions = await getTransactionHistory(address, chainId, limit, offset);
        
        // If we have cached transactions, return them
        if (cachedTransactions.length > 0) {
          return cachedTransactions;
        }
      }

      // Fetch from blockchain and cache
      const latestBlock = await getLatestTxBlockNumber(address, chainId);
      const blockchainTransactions = await fetchTransactions(address, chainId as ChainId, latestBlock);

      // Batch insert for better performance
      const txsToInsert = blockchainTransactions.map(tx => ({
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

      // Return the requested transactions
      return useCursor 
        ? await getTransactionHistoryCursor(address, chainId, limit, cursor)
        : await getTransactionHistory(address, chainId, limit, offset);
    }),

  getTransactionCount: publicProcedure
    .input(
      z.object({
        address: z.string(),
        chainId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { address, chainId } = input;
      
      if (!(chainId in CHAIN_CONFIG)) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
      }

      return await getTransactionCount(address, chainId);
    }),

  getTokenPrices: publicProcedure.query(async () => {
    return await fetchTokenPrices();
  }),
});

export type AppRouter = typeof appRouter;
