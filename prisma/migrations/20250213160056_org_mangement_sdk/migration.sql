-- CreateTable
CREATE TABLE `OrgManagementSDK` (
    `organizationId` VARCHAR(191) NOT NULL,
    `sdk` ENUM('WEB', 'FLUTTER') NOT NULL,
    `public_key` VARCHAR(191) NOT NULL,
    `private_key` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OrgManagementSDK_public_key_key`(`public_key`),
    UNIQUE INDEX `OrgManagementSDK_private_key_key`(`private_key`),
    PRIMARY KEY (`organizationId`, `sdk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrgManagementSDK` ADD CONSTRAINT `OrgManagementSDK_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
