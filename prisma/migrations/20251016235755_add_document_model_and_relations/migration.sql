-- AlterTable
ALTER TABLE "User" ADD COLUMN "resetPasswordExpires" DATETIME;
ALTER TABLE "User" ADD COLUMN "resetPasswordToken" TEXT;

-- CreateTable
CREATE TABLE "onboarding_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "completedSections" JSONB NOT NULL,
    "sectionScores" JSONB NOT NULL,
    "overallScore" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "onboarding_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "whoServed" TEXT,
    "location" TEXT,
    "frequency" TEXT,
    "peopleServed" INTEGER,
    "goals" TEXT,
    "successMetrics" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "programs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "livedExperience" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "team_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "funding_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "funderName" TEXT NOT NULL,
    "amount" REAL,
    "year" INTEGER,
    "purpose" TEXT,
    "status" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "funding_history_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'legal',
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "processedByAI" BOOLEAN NOT NULL DEFAULT false,
    "extractedData" JSONB,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "documents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "mission" TEXT,
    "budget" TEXT,
    "staffSize" TEXT,
    "focusAreas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "organizationType" TEXT,
    "state" TEXT,
    "ein" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "fullTimeStaff" INTEGER,
    "partTimeStaff" INTEGER,
    "contractors" INTEGER,
    "volunteers" INTEGER,
    "boardSize" INTEGER,
    "keyRoles" JSONB,
    "budgetPriorities" JSONB,
    "hasReceivedGrants" BOOLEAN,
    "fundingGoals" JSONB,
    "seekingAmount" TEXT,
    "timeline" TEXT,
    "successStory" TEXT,
    "problemSolving" TEXT,
    "beneficiaries" TEXT,
    "dreamScenario" TEXT,
    "emailPreferences" JSONB,
    "preferredContact" TEXT,
    "bestTimeToReach" TEXT,
    "profileCompleteness" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Organization" ("budget", "createdAt", "focusAreas", "id", "mission", "name", "organizationType", "staffSize", "state", "updatedAt") SELECT "budget", "createdAt", "focusAreas", "id", "mission", "name", "organizationType", "staffSize", "state", "updatedAt" FROM "Organization";
DROP TABLE "Organization";
ALTER TABLE "new_Organization" RENAME TO "Organization";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_progress_userId_key" ON "onboarding_progress"("userId");

-- CreateIndex
CREATE INDEX "programs_organizationId_idx" ON "programs"("organizationId");

-- CreateIndex
CREATE INDEX "team_members_organizationId_idx" ON "team_members"("organizationId");

-- CreateIndex
CREATE INDEX "funding_history_organizationId_idx" ON "funding_history"("organizationId");

-- CreateIndex
CREATE INDEX "documents_organizationId_idx" ON "documents"("organizationId");

-- CreateIndex
CREATE INDEX "documents_documentType_idx" ON "documents"("documentType");
