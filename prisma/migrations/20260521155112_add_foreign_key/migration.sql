/*
  Warnings:

  - Added the required column `username` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `products` ADD COLUMN `username` VARCHAR(155) NOT NULL;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_username_fkey` FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON DELETE CASCADE ON UPDATE CASCADE;
