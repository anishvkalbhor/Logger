-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('FEATURE', 'BUG_FIX', 'IMPROVEMENT', 'TECH_DEBT', 'OTHER');

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "EntryType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "problemContext" TEXT,
    "whatIDid" TEXT NOT NULL,
    "techTags" TEXT[],
    "impact" TEXT,
    "challenges" TEXT,
    "referenceLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Entry_userId_idx" ON "Entry"("userId");

-- CreateIndex
CREATE INDEX "Entry_userId_date_idx" ON "Entry"("userId", "date");
