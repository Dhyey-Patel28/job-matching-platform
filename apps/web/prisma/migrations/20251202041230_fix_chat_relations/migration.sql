/*
  Warnings:

  - You are about to drop the column `kind` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Message` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Message_conversationId_createdAt_idx";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "kind",
DROP COLUMN "metadata";

-- DropEnum
DROP TYPE "MessageKind";
