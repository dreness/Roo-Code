CREATE TABLE `analysis_cache` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cache_key` text NOT NULL,
	`cache_type` text NOT NULL,
	`file_path` text,
	`line_range` text,
	`result_sha` text,
	`result_data` text,
	`created_at` integer NOT NULL,
	`expires_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `analysis_cache_cache_key_unique` ON `analysis_cache` (`cache_key`);--> statement-breakpoint
CREATE INDEX `analysis_cache_cache_type_idx` ON `analysis_cache` (`cache_type`);--> statement-breakpoint
CREATE INDEX `analysis_cache_expires_at_idx` ON `analysis_cache` (`expires_at`);--> statement-breakpoint
CREATE TABLE `bug_causality` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bug_fix_sha` text NOT NULL,
	`cause_sha` text NOT NULL,
	`relationship_type` text NOT NULL,
	`confidence` real DEFAULT 0 NOT NULL,
	`bug_age` integer,
	`bug_age_commits` integer,
	`analysis_method` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`verified_at` integer,
	`verified_by` text,
	FOREIGN KEY (`bug_fix_sha`) REFERENCES `commits`(`sha`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`cause_sha`) REFERENCES `commits`(`sha`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `bug_causality_bug_fix_sha_idx` ON `bug_causality` (`bug_fix_sha`);--> statement-breakpoint
CREATE INDEX `bug_causality_cause_sha_idx` ON `bug_causality` (`cause_sha`);--> statement-breakpoint
CREATE UNIQUE INDEX `bug_causality_unique_idx` ON `bug_causality` (`bug_fix_sha`,`cause_sha`);--> statement-breakpoint
CREATE TABLE `classifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`commit_sha` text NOT NULL,
	`category` text NOT NULL,
	`confidence` real DEFAULT 0 NOT NULL,
	`flags` text DEFAULT '[]',
	`risk_score` real DEFAULT 0 NOT NULL,
	`analysis_version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`commit_sha`) REFERENCES `commits`(`sha`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `classifications_commit_sha_idx` ON `classifications` (`commit_sha`);--> statement-breakpoint
CREATE INDEX `classifications_category_idx` ON `classifications` (`category`);--> statement-breakpoint
CREATE INDEX `classifications_risk_score_idx` ON `classifications` (`risk_score`);--> statement-breakpoint
CREATE TABLE `commits` (
	`sha` text PRIMARY KEY NOT NULL,
	`short_sha` text NOT NULL,
	`author` text NOT NULL,
	`author_email` text NOT NULL,
	`date` integer NOT NULL,
	`message` text NOT NULL,
	`message_type` text,
	`message_scope` text,
	`pr_number` integer,
	`files_changed` integer DEFAULT 0,
	`insertions` integer DEFAULT 0,
	`deletions` integer DEFAULT 0,
	`analyzed_at` integer,
	`deep_analyzed_at` integer
);
--> statement-breakpoint
CREATE INDEX `commits_date_idx` ON `commits` (`date`);--> statement-breakpoint
CREATE INDEX `commits_message_type_idx` ON `commits` (`message_type`);--> statement-breakpoint
CREATE TABLE `file_changes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`commit_sha` text NOT NULL,
	`file_path` text NOT NULL,
	`change_type` text NOT NULL,
	`insertions` integer DEFAULT 0,
	`deletions` integer DEFAULT 0,
	`subsystem` text,
	FOREIGN KEY (`commit_sha`) REFERENCES `commits`(`sha`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `file_changes_commit_file_idx` ON `file_changes` (`commit_sha`,`file_path`);--> statement-breakpoint
CREATE INDEX `file_changes_subsystem_idx` ON `file_changes` (`subsystem`);--> statement-breakpoint
CREATE TABLE `regression_patterns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pattern_hash` text NOT NULL,
	`subsystem` text,
	`keywords` text DEFAULT '[]',
	`file_patterns` text DEFAULT '[]',
	`first_occurrence` text,
	`occurrence_count` integer DEFAULT 1,
	`commit_shas` text DEFAULT '[]',
	`severity` text DEFAULT 'low',
	`status` text DEFAULT 'active',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`first_occurrence`) REFERENCES `commits`(`sha`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `regression_patterns_pattern_hash_unique` ON `regression_patterns` (`pattern_hash`);--> statement-breakpoint
CREATE INDEX `regression_patterns_subsystem_idx` ON `regression_patterns` (`subsystem`);--> statement-breakpoint
CREATE INDEX `regression_patterns_status_idx` ON `regression_patterns` (`status`);--> statement-breakpoint
CREATE TABLE `releases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`version` text NOT NULL,
	`date` integer NOT NULL,
	`tag_sha` text,
	`fix_count` integer DEFAULT 0,
	`feature_count` integer DEFAULT 0,
	`total_risk` real DEFAULT 0
);
--> statement-breakpoint
CREATE UNIQUE INDEX `releases_version_unique` ON `releases` (`version`);--> statement-breakpoint
CREATE INDEX `releases_date_idx` ON `releases` (`date`);