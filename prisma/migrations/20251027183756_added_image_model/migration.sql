-- CreateTable
CREATE TABLE `image` (
    `path` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `width` INTEGER NOT NULL,
    `heigt` INTEGER NOT NULL,
    `lng` DOUBLE NULL,
    `lat` DOUBLE NULL,
    `journeyId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`path`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `image` ADD CONSTRAINT `Image_journeyId_fkey` FOREIGN KEY (`journeyId`) REFERENCES `journey`(`journeyId`) ON DELETE RESTRICT ON UPDATE CASCADE;
