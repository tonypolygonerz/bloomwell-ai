/*
  Warnings:

  - Added the required column `slug` to the `Webinar` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Webinar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scheduledDate" DATETIME NOT NULL,
    "timezone" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "thumbnailUrl" TEXT,
    "uniqueSlug" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "slug" TEXT NOT NULL,
    "metaDescription" TEXT,
    "socialImageUrl" TEXT,
    "maxAttendees" INTEGER NOT NULL DEFAULT 100,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "categories" JSONB,
    "guestSpeakers" JSONB,
    "materials" JSONB,
    "jitsiRoomUrl" TEXT,
    CONSTRAINT "Webinar_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "AdminUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Webinar" ("createdAt", "createdBy", "description", "duration", "id", "scheduledDate", "status", "thumbnailUrl", "timezone", "title", "uniqueSlug", "updatedAt") SELECT "createdAt", "createdBy", "description", "duration", "id", "scheduledDate", "status", "thumbnailUrl", "timezone", "title", "uniqueSlug", "updatedAt" FROM "Webinar";
DROP TABLE "Webinar";
ALTER TABLE "new_Webinar" RENAME TO "Webinar";
CREATE UNIQUE INDEX "Webinar_uniqueSlug_key" ON "Webinar"("uniqueSlug");
CREATE UNIQUE INDEX "Webinar_slug_key" ON "Webinar"("slug");
CREATE TABLE "new_WebinarRSVP" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "webinarId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rsvpDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "WebinarRSVP_webinarId_fkey" FOREIGN KEY ("webinarId") REFERENCES "Webinar" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WebinarRSVP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WebinarRSVP" ("attended", "id", "rsvpDate", "userId", "webinarId") SELECT "attended", "id", "rsvpDate", "userId", "webinarId" FROM "WebinarRSVP";
DROP TABLE "WebinarRSVP";
ALTER TABLE "new_WebinarRSVP" RENAME TO "WebinarRSVP";
CREATE UNIQUE INDEX "WebinarRSVP_webinarId_userId_key" ON "WebinarRSVP"("webinarId", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
