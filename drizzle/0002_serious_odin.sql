ALTER TABLE `locations` ADD `qr_code` text;--> statement-breakpoint
CREATE UNIQUE INDEX `locations_qr_code_unique` ON `locations` (`qr_code`);