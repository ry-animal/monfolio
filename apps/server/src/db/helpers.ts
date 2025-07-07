import { desc, eq, and, max, count, asc, lt, gt, sql } from "drizzle-orm";
import { db } from "./index";
import { transactions } from "./schema";

export async function getLatestTxBlockNumber(
  address: string,
  chainId: number
): Promise<number> {
  const result = await db
    .select({ blockNumber: max(transactions.blockNumber) })
    .from(transactions)
    .where(and(eq(transactions.address, address), eq(transactions.chainId, chainId)))
    .limit(1);

  return result[0]?.blockNumber ?? 0;
}

export async function getTransactionHistory(
  address: string,
  chainId: number,
  limit = 12,
  offset = 0
) {
  return await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.address, address), eq(transactions.chainId, chainId)))
    .orderBy(desc(transactions.timestamp), desc(transactions.blockNumber))
    .limit(limit)
    .offset(offset);
}

// Optimized version for large datasets using cursor-based pagination
export async function getTransactionHistoryCursor(
  address: string,
  chainId: number,
  limit = 12,
  cursor?: { timestamp: number; blockNumber: number }
) {
  const baseQuery = db
    .select()
    .from(transactions)
    .where(and(eq(transactions.address, address), eq(transactions.chainId, chainId)));

  if (cursor) {
    // Use cursor-based pagination for better performance
    return await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.address, address),
          eq(transactions.chainId, chainId),
          // Use timestamp and blockNumber for stable ordering
          and(
            lt(transactions.timestamp, cursor.timestamp),
            lt(transactions.blockNumber, cursor.blockNumber)
          )
        )
      )
      .orderBy(desc(transactions.timestamp), desc(transactions.blockNumber))
      .limit(limit);
  }

  return await baseQuery
    .orderBy(desc(transactions.timestamp), desc(transactions.blockNumber))
    .limit(limit);
}

// Get transaction count for pagination info
export async function getTransactionCount(
  address: string,
  chainId: number
): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(transactions)
    .where(and(eq(transactions.address, address), eq(transactions.chainId, chainId)))
    .limit(1);

  return result[0]?.count ?? 0;
}

// Batch insert with conflict handling for better performance
export async function batchInsertTransactions(
  txs: Array<{
    hash: string;
    address: string;
    chainId: number;
    blockNumber: number;
    timestamp: number;
    from: string;
    to: string;
    amount: string;
    token: string;
  }>
) {
  if (txs.length === 0) return;

  // Use batch insert with conflict handling
  return await db
    .insert(transactions)
    .values(txs)
    .onConflictDoNothing(); // Ignore duplicates
}

// Get transactions for multiple addresses efficiently
export async function getTransactionHistoryMultiAddress(
  addresses: string[],
  chainId: number,
  limit = 12
) {
  if (addresses.length === 0) return [];

  // Use IN clause for multiple addresses
  return await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.chainId, chainId),
        // Use SQL IN for multiple addresses
        sql`${transactions.address} IN (${addresses.map(a => `'${a}'`).join(', ')})`
      )
    )
    .orderBy(desc(transactions.timestamp), desc(transactions.blockNumber))
    .limit(limit);
}

// Optimized query for recent transactions across all chains
export async function getRecentTransactionsAllChains(
  address: string,
  limit = 12
) {
  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.address, address))
    .orderBy(desc(transactions.timestamp), desc(transactions.blockNumber))
    .limit(limit);
}