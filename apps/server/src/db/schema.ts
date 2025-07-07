import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const transactions = sqliteTable(
  "transactions",
  {
    hash: text("hash").primaryKey(),
    address: text("address").notNull(),
    chainId: integer("chain_id").notNull(),
    blockNumber: integer("block_number").notNull(),
    timestamp: integer("timestamp").notNull(),
    from: text("from").notNull(),
    to: text("to").notNull(),
    amount: text("amount").notNull(),
    token: text("token").notNull(),
  },
  (table) => ({
    addressIdx: index("idx_address").on(table.address),
    chainIdIdx: index("idx_chain_id").on(table.chainId),
    addressChainIdx: index("idx_address_chain").on(table.address, table.chainId),
    timestampIdx: index("idx_timestamp").on(table.timestamp),
    blockNumberIdx: index("idx_block_number").on(table.blockNumber),
    // Composite index for efficient ordering and filtering
    addressChainTimestampIdx: index("idx_address_chain_timestamp").on(
      table.address,
      table.chainId,
      table.timestamp
    ),
    // Index for efficient pagination
    addressChainBlockIdx: index("idx_address_chain_block").on(
      table.address,
      table.chainId,
      table.blockNumber
    ),
  })
);

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;