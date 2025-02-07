/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_organizationId_fkey`;

-- DropIndex
DROP INDEX `User_organizationId_fkey` ON `User`;

-- CreateIndex
CREATE UNIQUE INDEX `User_token_key` ON `User`(`token`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
