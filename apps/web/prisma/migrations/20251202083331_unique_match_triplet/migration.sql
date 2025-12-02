/*
  Warnings:

  - A unique constraint covering the columns `[candidateId,employerId,jobId]` on the table `Match` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Match_candidateId_employerId_jobId_key" ON "Match"("candidateId", "employerId", "jobId");
