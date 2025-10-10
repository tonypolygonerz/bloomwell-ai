-- CreateTable
CREATE TABLE "maintenance_mode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "environment" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "enabledAt" DATETIME,
    "enabledBy" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_mode_environment_key" ON "maintenance_mode"("environment");
