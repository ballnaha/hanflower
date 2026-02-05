/*
  Warnings:

  - You are about to drop the column `username` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `collection` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `User_username_key` ON `user`;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `categoryId` VARCHAR(191) NULL,
    ADD COLUMN `discountVelvet` INTEGER NULL,
    ADD COLUMN `hasQrCode` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isBestSeller` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isNew` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `originalPriceVelvet` DECIMAL(10, 2) NULL,
    ADD COLUMN `priceVelvet` DECIMAL(10, 2) NULL,
    ADD COLUMN `qrCodePrice` DECIMAL(10, 2) NULL DEFAULT 150.00,
    ADD COLUMN `stockVelvet` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `username`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NULL,
    MODIFY `role` VARCHAR(191) NOT NULL DEFAULT 'user';

-- DropTable
DROP TABLE `collection`;

-- CreateTable
CREATE TABLE `category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `image` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productshipping` (
    `id` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    INDEX `ProductShipping_productId_fkey`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerEmail` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(191) NOT NULL,
    `customerAddress` TEXT NOT NULL,
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'unpaid',
    `paymentMethod` VARCHAR(191) NULL,
    `shippingMethod` VARCHAR(191) NULL,
    `shippingFee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_orderNumber_key`(`orderNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orderitem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,

    INDEX `OrderItem_orderId_fkey`(`orderId`),
    INDEX `OrderItem_productId_fkey`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `setting` (
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `description` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupon` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `discount` DOUBLE NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'fixed',
    `minSpend` DOUBLE NOT NULL DEFAULT 0,
    `maxDiscount` DOUBLE NULL,
    `limit` INTEGER NULL,
    `expireAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `coupon_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shippingmethod` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `estimatedDays` VARCHAR(191) NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `shippingmethod_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ValentineCard` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `jobName` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `openingText` VARCHAR(191) NULL,
    `greeting` VARCHAR(191) NULL,
    `subtitle` VARCHAR(191) NULL,
    `message` TEXT NULL,
    `signer` VARCHAR(191) NULL,
    `backgroundColor` VARCHAR(191) NULL DEFAULT '#FFF0F3',
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `disabledAt` DATETIME(3) NULL,
    `backgroundMusicYoutubeId` VARCHAR(191) NULL,
    `backgroundMusicUrl` TEXT NULL,
    `swipeHintColor` VARCHAR(191) NULL DEFAULT 'white',
    `swipeHintText` VARCHAR(191) NULL DEFAULT 'Swipe up',
    `showGame` BOOLEAN NOT NULL DEFAULT true,
    `campaignName` VARCHAR(191) NULL DEFAULT 'Valentine''s',
    `customerPhone` VARCHAR(191) NULL,
    `customerAddress` TEXT NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ValentineCard_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ValentineMemory` (
    `id` VARCHAR(191) NOT NULL,
    `cardId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'image',
    `url` TEXT NOT NULL,
    `caption` VARCHAR(191) NULL,
    `thumbnail` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ValentineScore` (
    `id` VARCHAR(191) NOT NULL,
    `cardId` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `userName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ValentineCardToproduct` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ValentineCardToproduct_AB_unique`(`A`, `B`),
    INDEX `_ValentineCardToproduct_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Product_categoryId_fkey` ON `product`(`categoryId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_email_key` ON `user`(`email`);

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productshipping` ADD CONSTRAINT `ProductShipping_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderitem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderitem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ValentineMemory` ADD CONSTRAINT `ValentineMemory_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `ValentineCard`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ValentineScore` ADD CONSTRAINT `ValentineScore_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `ValentineCard`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ValentineCardToproduct` ADD CONSTRAINT `_ValentineCardToproduct_A_fkey` FOREIGN KEY (`A`) REFERENCES `ValentineCard`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ValentineCardToproduct` ADD CONSTRAINT `_ValentineCardToproduct_B_fkey` FOREIGN KEY (`B`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
