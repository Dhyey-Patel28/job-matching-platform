-- CreateTable
CREATE TABLE "JobListing" (
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployerListing" (
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployerListing_pkey" PRIMARY KEY ("id")
);
