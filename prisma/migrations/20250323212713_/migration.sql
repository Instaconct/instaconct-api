/*
  Warnings:

  - You are about to drop the column `assigendToId` on the `Ticket` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Ticket` DROP FOREIGN KEY `Ticket_assigendToId_fkey`;

-- DropIndex
DROP INDEX `Ticket_assigendToId_fkey` ON `Ticket`;

-- AlterTable
ALTER TABLE `Ticket` DROP COLUMN `assigendToId`,
    ADD COLUMN `assignedToId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
