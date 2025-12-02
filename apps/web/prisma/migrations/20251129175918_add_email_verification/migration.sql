/*
  Warnings:

  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `TwoFactorSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TwoFactorSettings" DROP CONSTRAINT "TwoFactorSettings_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phone",
DROP COLUMN "phoneVerified";

-- DropTable
DROP TABLE "TwoFactorSettings";
