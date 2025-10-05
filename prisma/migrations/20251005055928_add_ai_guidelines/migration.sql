-- CreateTable
CREATE TABLE "ai_guidelines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "guidanceText" TEXT NOT NULL,
    "conditions" JSONB,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "ai_guidelines_category_isActive_idx" ON "ai_guidelines"("category", "isActive");

-- CreateIndex
CREATE INDEX "ai_guidelines_priority_isActive_idx" ON "ai_guidelines"("priority", "isActive");
