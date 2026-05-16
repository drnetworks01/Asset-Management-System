CREATE TABLE `assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`assignee_name` text NOT NULL,
	`assignee_role` text,
	`qty` integer DEFAULT 1 NOT NULL,
	`notes` text,
	`issued_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`returned_at` text,
	`issued_by_user_id` text,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`issued_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `assignments_item_id_idx` ON `assignments` (`item_id`);--> statement-breakpoint
CREATE INDEX `assignments_active_idx` ON `assignments` (`returned_at`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `items` ADD `unit_value_lkr` integer;--> statement-breakpoint
ALTER TABLE `items` ADD `low_stock_threshold` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `name` text;