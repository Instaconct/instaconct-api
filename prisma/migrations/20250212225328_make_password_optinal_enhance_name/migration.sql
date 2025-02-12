/*
  Warnings:

  - The values [USER] on the enum `Message_senderType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Message` MODIFY `senderType` ENUM('AGENT', 'BOT', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER';
