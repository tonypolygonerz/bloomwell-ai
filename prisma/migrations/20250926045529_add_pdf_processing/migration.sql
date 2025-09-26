-- AlterTable
ALTER TABLE "Message" ADD COLUMN "aiModel" TEXT;
ALTER TABLE "Message" ADD COLUMN "contextLength" INTEGER;
ALTER TABLE "Message" ADD COLUMN "modelTier" TEXT;
ALTER TABLE "Message" ADD COLUMN "processingTime" INTEGER;
ALTER TABLE "Message" ADD COLUMN "queryType" TEXT;
ALTER TABLE "Message" ADD COLUMN "tokenEstimate" INTEGER;

-- CreateTable
CREATE TABLE "project_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "estimatedTime" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "prerequisites" JSONB,
    "outcomes" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "AdminUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "project_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "questionKey" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "validationRules" JSONB,
    "helpText" TEXT,
    "options" JSONB,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "project_steps_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "project_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "progress" REAL NOT NULL DEFAULT 0.0,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "lastActiveAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "intelligenceProfile" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_projects_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "project_templates" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "template_responses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "rawAnswer" TEXT NOT NULL,
    "enhancedAnswer" TEXT,
    "confidence" REAL,
    "qualityScore" REAL,
    "isComplete" BOOLEAN NOT NULL DEFAULT true,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "template_responses_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "user_projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "template_responses_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "project_steps" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pdf_processings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "pageCount" INTEGER NOT NULL,
    "extractedText" TEXT NOT NULL,
    "documentType" TEXT,
    "summary" TEXT,
    "keyPoints" JSONB,
    "recommendations" JSONB,
    "confidence" REAL,
    "aiModel" TEXT,
    "processingTime" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pdf_processings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "project_templates_category_idx" ON "project_templates"("category");

-- CreateIndex
CREATE INDEX "project_templates_isActive_isPublic_idx" ON "project_templates"("isActive", "isPublic");

-- CreateIndex
CREATE INDEX "project_steps_templateId_order_idx" ON "project_steps"("templateId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "project_steps_templateId_stepNumber_key" ON "project_steps"("templateId", "stepNumber");

-- CreateIndex
CREATE INDEX "user_projects_userId_status_idx" ON "user_projects"("userId", "status");

-- CreateIndex
CREATE INDEX "user_projects_status_lastActiveAt_idx" ON "user_projects"("status", "lastActiveAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_projects_userId_templateId_key" ON "user_projects"("userId", "templateId");

-- CreateIndex
CREATE INDEX "template_responses_projectId_submittedAt_idx" ON "template_responses"("projectId", "submittedAt");

-- CreateIndex
CREATE INDEX "template_responses_stepId_qualityScore_idx" ON "template_responses"("stepId", "qualityScore");

-- CreateIndex
CREATE UNIQUE INDEX "template_responses_projectId_stepId_key" ON "template_responses"("projectId", "stepId");

-- CreateIndex
CREATE INDEX "pdf_processings_userId_createdAt_idx" ON "pdf_processings"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "pdf_processings_status_createdAt_idx" ON "pdf_processings"("status", "createdAt");
