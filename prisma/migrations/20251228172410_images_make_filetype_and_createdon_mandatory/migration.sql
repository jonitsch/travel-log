/*
  Warnings:

  - Made the column `createdOn` on table `image` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fileType` on table `image` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `image` MODIFY `createdOn` DATETIME(3) NOT NULL,
    MODIFY `fileType` VARCHAR(191) NOT NULL;
