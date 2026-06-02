/*
  Warnings:

  - You are about to alter the column `price` on the `products` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `MediumInt`.
  - You are about to alter the column `quantity` on the `products` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `MediumInt`.

*/
-- AlterTable
ALTER TABLE `products` MODIFY `price` MEDIUMINT NOT NULL,
    MODIFY `quantity` MEDIUMINT NOT NULL;

-- CreateTable
CREATE TABLE `CART` (
    `product_id` INTEGER NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `product_name` VARCHAR(100) NOT NULL,
    `price` MEDIUMINT NOT NULL,
    `quantity` MEDIUMINT NOT NULL,
    `product_image` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `CART_username_product_id_key`(`username`, `product_id`),
    PRIMARY KEY (`product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CART` ADD CONSTRAINT `CART_username_fkey` FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CART` ADD CONSTRAINT `CART_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
