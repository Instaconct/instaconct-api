/*
  Warnings:

  - You are about to drop the column `userId` on the `Organization` table. All the data in the column will be lost.
  - Added the required column `organizationId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Organization` DROP FOREIGN KEY `Organization_userId_fkey`;

-- DropIndex
DROP INDEX `Organization_userId_fkey` ON `Organization`;

-- AlterTable
ALTER TABLE `Organization` DROP COLUMN `userId`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `organizationId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
