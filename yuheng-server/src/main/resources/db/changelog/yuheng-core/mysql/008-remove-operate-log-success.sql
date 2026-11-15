-- Older schema snapshots include this unused column; fresh installs omit it.
ALTER TABLE `system_operate_log` DROP COLUMN `success`;
