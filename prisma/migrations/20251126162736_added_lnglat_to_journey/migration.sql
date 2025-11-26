/*
  Warnings:

  - You are about to drop the column `nextId` on the `marker` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `journey` ADD COLUMN `lat` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `lng` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `marker` DROP COLUMN `nextId`;
