-- CreateTable
CREATE TABLE "web_search_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "resultsCount" INTEGER NOT NULL,
    "processingTime" INTEGER,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "web_search_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "web_search_logs_userId_idx" ON "web_search_logs"("userId");

-- CreateIndex
CREATE INDEX "web_search_logs_timestamp_idx" ON "web_search_logs"("timestamp");

-- CreateIndex
CREATE INDEX "web_search_logs_category_idx" ON "web_search_logs"("category");
