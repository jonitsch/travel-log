/*
  Warnings:

  - Made the column `color` on table `marker` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nextId` on table `marker` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `marker` MODIFY `color` VARCHAR(191) NOT NULL DEFAULT 'bg-white',
    MODIFY `nextId` VARCHAR(191) NOT NULL DEFAULT 'default';
