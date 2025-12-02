-- CreateEnum
CREATE TYPE "MessageKind" AS ENUM ('TEXT', 'MEETING');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "kind" "MessageKind" NOT NULL DEFAULT 'TEXT',
ADD COLUMN     "metadata" JSONB;

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");
