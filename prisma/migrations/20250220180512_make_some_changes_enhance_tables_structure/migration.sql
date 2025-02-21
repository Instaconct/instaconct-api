/*
  Warnings:

  - You are about to alter the column `role` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(4))` to `Enum(EnumId(3))`.
  - A unique constraint covering the columns `[email,organizationId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Ticket` DROP FOREIGN KEY `Ticket_customerId_fkey`;

-- DropIndex
DROP INDEX `Ticket_customerId_fkey` ON `Ticket`;

-- AlterTable
ALTER TABLE `Message` ADD COLUMN `customerId` VARCHAR(191) NULL,
    MODIFY `senderId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('SUPER_MANAGER', 'MANAGER', 'AGENT') NOT NULL DEFAULT 'SUPER_MANAGER';

-- CreateTable
CREATE TABLE `Customer` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(255) NULL,
    `metadata` JSON NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Customer_email_idx`(`email`),
    UNIQUE INDEX `Customer_email_organizationId_key`(`email`, `organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `User_email_idx` ON `User`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `User_email_organizationId_key` ON `User`(`email`, `organizationId`);

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
