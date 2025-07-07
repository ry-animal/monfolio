import { and, count, desc, eq, lt, max, sql } from "drizzle-orm";
import { db } from "./index";
import { transactions } from "./schema";

export async function getLatestTxBlockNumber(
	address: string,
	chainId: number,
): Promise<number> {
	const result = await db
		.select({ blockNumber: max(transactions.blockNumber) })
		.from(transactions)
		.where(
			and(eq(transactions.address, address), eq(transactions.chainId, chainId)),
		)
		.limit(1);

	return result[0]?.blockNumber ?? 0;
}

export async function getTransactionHistory(
	address: string,
	chainId: number,
	limit = 12,
	offset = 0,
) {
	return await db
		.select()
		.from(transactions)
		.where(
			and(eq(transactions.address, address), eq(transactions.chainId, chainId)),
		)
		.orderBy(desc(transactions.timestamp), desc(transactions.blockNumber))
		.limit(limit)
		.offset(offset);
}

export async function getTransactionHistoryCursor(
	address: string,
	chainId: number,
	limit = 12,
	cursor?: { timestamp: number; blockNumber: number },
) {
	const baseQuery = db
		.select()
		.from(transactions)
		.where(
			and(eq(transactions.address, address), eq(transactions.chainId, chainId)),
		);

	if (cursor) {
		return await db
			.select()
			.from(transactions)
			.where(
				and(
					eq(transactions.address, address),
					eq(transactions.chainId, chainId),
					and(
						lt(transactions.timestamp, cursor.timestamp),
						lt(transactions.blockNumber, cursor.blockNumber),
					),
				),
			)
			.orderBy(desc(transactions.timestamp), desc(transactions.blockNumber))
			.limit(limit);
	}

	return await baseQuery
		.orderBy(desc(transactions.timestamp), desc(transactions.blockNumber))
		.limit(limit);
}

export async function getTransactionCount(
	address: string,
	chainId: number,
): Promise<number> {
	const result = await db
		.select({ count: count() })
		.from(transactions)
		.where(
			and(eq(transactions.address, address), eq(transactions.chainId, chainId)),
		)
		.limit(1);

	return result[0]?.count ?? 0;
}

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
	}>,
) {
	if (txs.length === 0) return;

	// SQLite has batch size limits, so chunk large batches
	// With 9 fields per transaction, use smaller batch size to stay under 999 parameter limit
	const BATCH_SIZE = 10;
	const chunks = [];

	for (let i = 0; i < txs.length; i += BATCH_SIZE) {
		chunks.push(txs.slice(i, i + BATCH_SIZE));
	}

	// Process chunks sequentially to avoid overwhelming the database
	for (const chunk of chunks) {
		try {
			await db.insert(transactions).values(chunk).onConflictDoNothing();
		} catch (error) {
			console.error(
				`Error inserting batch of ${chunk.length} transactions:`,
				error,
			);
		}
	}
}

export async function getTransactionHistoryMultiAddress(
	addresses: string[],
	chainId: number,
	limit = 12,
) {
	if (addresses.length === 0) return [];

	return await db
		.select()
		.from(transactions)
		.where(
			and(
				eq(transactions.chainId, chainId),
				sql`${transactions.address} IN (${addresses.map((a) => `'${a}'`).join(", ")})`,
			),
		)
		.orderBy(desc(transactions.timestamp), desc(transactions.blockNumber))
		.limit(limit);
}

export async function getRecentTransactionsAllChains(
	address: string,
	limit = 12,
) {
	return await db
		.select()
		.from(transactions)
		.where(eq(transactions.address, address))
		.orderBy(desc(transactions.timestamp), desc(transactions.blockNumber))
		.limit(limit);
}
