/*
  Warnings:

  - Added the required column `product_image` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `products` ADD COLUMN `product_image` VARCHAR(255) NOT NULL;
