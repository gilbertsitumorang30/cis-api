CREATE TABLE `survey_answers` (
	`id` char(36) NOT NULL,
	`survey_id` char(36) NOT NULL,
	`section` varchar(32) NOT NULL,
	`question_id` varchar(64) NOT NULL,
	`answer` boolean,
	`types_specifications` text,
	CONSTRAINT `survey_answers_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_survey_answers` UNIQUE(`survey_id`,`section`,`question_id`)
);
--> statement-breakpoint
CREATE TABLE `survey_media` (
	`id` char(36) NOT NULL,
	`survey_id` char(36) NOT NULL,
	`kind` varchar(16) NOT NULL,
	`side` varchar(16),
	`position` varchar(16),
	`filename` varchar(255) NOT NULL,
	`stored_path` varchar(512) NOT NULL,
	`mime_type` varchar(100),
	`size_bytes` int,
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `survey_media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `surveys` (
	`id` char(36) NOT NULL,
	`equipment_number` varchar(191) NOT NULL,
	`equipment_type` varchar(100) NOT NULL,
	`client` varchar(191) NOT NULL,
	`remarks` text,
	`seal_manlid` varchar(191),
	`seal_airline_top` varchar(191),
	`seal_bottom_outlet` varchar(191),
	`created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`raw_payload` json,
	CONSTRAINT `surveys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `survey_answers` ADD CONSTRAINT `survey_answers_survey_id_surveys_id_fk` FOREIGN KEY (`survey_id`) REFERENCES `surveys`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `survey_media` ADD CONSTRAINT `survey_media_survey_id_surveys_id_fk` FOREIGN KEY (`survey_id`) REFERENCES `surveys`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_survey_media_survey` ON `survey_media` (`survey_id`);--> statement-breakpoint
CREATE INDEX `idx_surveys_equipment_number` ON `surveys` (`equipment_number`);--> statement-breakpoint
CREATE INDEX `idx_surveys_created_at` ON `surveys` (`created_at`);