/*
  Warnings:

  - You are about to alter the column `username` on the `products` table. The data in that column could be lost. The data in that column will be cast from `VarChar(155)` to `VarChar(100)`.

*/
-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_username_fkey`;

-- DropIndex
DROP INDEX `products_username_fkey` ON `products`;

-- AlterTable
ALTER TABLE `products` MODIFY `username` VARCHAR(100) NOT NULL;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_username_fkey` FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON DELETE CASCADE ON UPDATE CASCADE;
