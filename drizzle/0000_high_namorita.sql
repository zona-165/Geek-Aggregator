CREATE TABLE `articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_id` integer,
	`title` text NOT NULL,
	`source_name` text NOT NULL,
	`source_url` text NOT NULL,
	`category` text DEFAULT 'AI 前沿' NOT NULL,
	`original_content` text DEFAULT '' NOT NULL,
	`rewritten_title` text,
	`rewritten_content` text,
	`status` text DEFAULT '待改写' NOT NULL,
	`published_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `articles_status_created_idx` ON `articles` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `articles_category_created_idx` ON `articles` (`category`,`created_at`);--> statement-breakpoint
CREATE TABLE `rewrite_versions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`article_id` integer NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`provider` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `rewrite_versions_article_created_idx` ON `rewrite_versions` (`article_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`feed_url` text NOT NULL,
	`category` text DEFAULT 'AI 前沿' NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sources_feed_url_unique` ON `sources` (`feed_url`);