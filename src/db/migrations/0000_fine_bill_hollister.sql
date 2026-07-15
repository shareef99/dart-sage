CREATE TABLE `drill_results` (
	`id` text PRIMARY KEY NOT NULL,
	`drill_type` text NOT NULL,
	`player_id` text,
	`score` integer NOT NULL,
	`total` integer NOT NULL,
	`details_json` text,
	`completed_at` integer NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `legs` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`leg_number` integer NOT NULL,
	`winner_player_id` text NOT NULL,
	`checkout_score` integer,
	`darts_used` integer,
	`turns_json` text NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `match_players` (
	`match_id` text NOT NULL,
	`player_id` text NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`mode` text NOT NULL,
	`config_json` text NOT NULL,
	`winner_player_id` text,
	`started_at` integer NOT NULL,
	`finished_at` integer
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_bot` integer DEFAULT false NOT NULL,
	`bot_skill` integer,
	`created_at` integer NOT NULL
);
