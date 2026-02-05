/*
  Warnings:

  - You are about to drop the column `userName` on the `valentinescore` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `ValentineScore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playerId` to the `ValentineScore` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `username` VARCHAR(191) NOT NULL,
    MODIFY `email` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `valentinescore` DROP COLUMN `userName`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `playerId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `user_username_key` ON `user`(`username`);

-- CreateIndex
CREATE INDEX `ValentineScore_playerId_idx` ON `ValentineScore`(`playerId`);

-- CreateIndex
CREATE INDEX `ValentineScore_score_idx` ON `ValentineScore`(`score`);
