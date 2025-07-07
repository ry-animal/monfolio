CREATE INDEX `idx_timestamp` ON `transactions` (`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_block_number` ON `transactions` (`block_number`);--> statement-breakpoint
CREATE INDEX `idx_address_chain_timestamp` ON `transactions` (`address`,`chain_id`,`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_address_chain_block` ON `transactions` (`address`,`chain_id`,`block_number`);