CREATE TABLE `transactions` (
	`hash` text PRIMARY KEY NOT NULL,
	`address` text NOT NULL,
	`chain_id` integer NOT NULL,
	`block_number` integer NOT NULL,
	`timestamp` integer NOT NULL,
	`from` text NOT NULL,
	`to` text NOT NULL,
	`amount` text NOT NULL,
	`token` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_address` ON `transactions` (`address`);--> statement-breakpoint
CREATE INDEX `idx_chain_id` ON `transactions` (`chain_id`);--> statement-breakpoint
CREATE INDEX `idx_address_chain` ON `transactions` (`address`,`chain_id`);CREATE INDEX `idx_timestamp` ON `transactions` (`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_block_number` ON `transactions` (`block_number`);--> statement-breakpoint
CREATE INDEX `idx_address_chain_timestamp` ON `transactions` (`address`,`chain_id`,`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_address_chain_block` ON `transactions` (`address`,`chain_id`,`block_number`);