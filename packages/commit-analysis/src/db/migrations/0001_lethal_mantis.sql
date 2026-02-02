CREATE TABLE `causality_investigations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bug_fix_sha` text NOT NULL,
	`investigator` text NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	`conclusion_type` text,
	`final_cause_sha` text,
	`confidence_override` real,
	`summary` text,
	FOREIGN KEY (`bug_fix_sha`) REFERENCES `commits`(`sha`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`final_cause_sha`) REFERENCES `commits`(`sha`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `causality_investigations_bug_fix_sha_idx` ON `causality_investigations` (`bug_fix_sha`);--> statement-breakpoint
CREATE INDEX `causality_investigations_investigator_idx` ON `causality_investigations` (`investigator`);--> statement-breakpoint
CREATE INDEX `causality_investigations_conclusion_type_idx` ON `causality_investigations` (`conclusion_type`);--> statement-breakpoint
CREATE TABLE `investigation_candidates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`investigation_id` integer NOT NULL,
	`candidate_sha` text NOT NULL,
	`verdict` text NOT NULL,
	`rejection_reason` text,
	`reasoning` text,
	`order_examined` integer,
	FOREIGN KEY (`investigation_id`) REFERENCES `causality_investigations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`candidate_sha`) REFERENCES `commits`(`sha`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `investigation_candidates_investigation_id_idx` ON `investigation_candidates` (`investigation_id`);--> statement-breakpoint
CREATE INDEX `investigation_candidates_verdict_idx` ON `investigation_candidates` (`verdict`);--> statement-breakpoint
CREATE UNIQUE INDEX `investigation_candidates_unique_idx` ON `investigation_candidates` (`investigation_id`,`candidate_sha`);--> statement-breakpoint
CREATE TABLE `investigation_evidence` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`investigation_id` integer NOT NULL,
	`evidence_type` text NOT NULL,
	`file_path` text,
	`content_hash` text,
	`content_preview` text,
	`captured_at` integer NOT NULL,
	FOREIGN KEY (`investigation_id`) REFERENCES `causality_investigations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `investigation_evidence_investigation_id_idx` ON `investigation_evidence` (`investigation_id`);--> statement-breakpoint
CREATE INDEX `investigation_evidence_evidence_type_idx` ON `investigation_evidence` (`evidence_type`);--> statement-breakpoint
ALTER TABLE `bug_causality` ADD `investigation_id` integer REFERENCES causality_investigations(id);--> statement-breakpoint
ALTER TABLE `bug_causality` ADD `human_verified` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `bug_causality` ADD `human_confidence` real;--> statement-breakpoint
ALTER TABLE `bug_causality` ADD `automation_was_correct` integer;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `bug_causality_relationship_type_idx` ON `bug_causality` (`relationship_type`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `analysis_cache_file_path_idx` ON `analysis_cache` (`file_path`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `commits_analyzed_at_idx` ON `commits` (`analyzed_at`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `commits_deep_analyzed_at_idx` ON `commits` (`deep_analyzed_at`);