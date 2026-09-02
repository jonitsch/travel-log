ALTER TABLE `account`
    ADD COLUMN `issuer` VARCHAR(191) NULL,
    MODIFY COLUMN `accountId` VARCHAR(191) NOT NULL;

UPDATE `account`
SET `issuer` = CONCAT('local:', `providerId`)
WHERE `issuer` IS NULL;

ALTER TABLE `account`
    MODIFY COLUMN `issuer` VARCHAR(191) NOT NULL,
    DROP INDEX `account_userId_idx`,
    ADD UNIQUE INDEX `account_issuer_accountId_uidx` (`issuer`, `accountId`),
    ADD INDEX `account_userId_idx` (`userId`);
