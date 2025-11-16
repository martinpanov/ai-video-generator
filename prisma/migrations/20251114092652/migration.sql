/*
  Warnings:

  - You are about to drop the column `compressData` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `metaData` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `transcribeData` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `translateData` on the `Job` table. All the data in the column will be lost.
  - Added the required column `pipelineType` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pipelineType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentStep" TEXT NOT NULL,
    "completedSteps" TEXT NOT NULL DEFAULT '[]',
    "stepData" TEXT NOT NULL DEFAULT '{}',
    "formData" TEXT NOT NULL DEFAULT '{}',
    "failedStep" TEXT,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("createdAt", "currentStep", "id", "status", "updatedAt") SELECT "createdAt", "currentStep", "id", "status", "updatedAt" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
