-- CreateEnum
CREATE TYPE "SwipeDirection" AS ENUM ('left', 'right');

-- CreateEnum
CREATE TYPE "SwipeTargetType" AS ENUM ('job', 'candidate');

-- CreateTable
CREATE TABLE "Swipe" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" "SwipeTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "direction" "SwipeDirection" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Swipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Swipe_userId_targetType_targetId_idx" ON "Swipe"("userId", "targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "Swipe_userId_targetType_targetId_key" ON "Swipe"("userId", "targetType", "targetId");

-- AddForeignKey
ALTER TABLE "Swipe" ADD CONSTRAINT "Swipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
