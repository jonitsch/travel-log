-- CreateTable
CREATE TABLE `Journey` (
    `journeyId` VARCHAR(191) NOT NULL DEFAULT 'journey',
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT 'bg-white',

    PRIMARY KEY (`journeyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Marker` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `lng` DOUBLE NOT NULL,
    `lat` DOUBLE NOT NULL,
    `color` VARCHAR(191) NULL,
    `journeyId` VARCHAR(191) NOT NULL,
    `nextId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Marker` ADD CONSTRAINT `Marker_journeyId_fkey` FOREIGN KEY (`journeyId`) REFERENCES `Journey`(`journeyId`) ON DELETE RESTRICT ON UPDATE CASCADE;
