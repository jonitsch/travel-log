-- AlterTable
ALTER TABLE `image` ADD COLUMN `createdOn` DATETIME(3) NULL,
    ADD COLUMN `fileType` VARCHAR(191) NULL;
