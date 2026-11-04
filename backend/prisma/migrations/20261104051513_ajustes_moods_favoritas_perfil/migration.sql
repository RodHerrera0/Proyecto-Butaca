/*
  Warnings:

  - The values [TIRED,ADRENALINE] on the enum `Mood` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Mood_new" AS ENUM ('NEUTRAL', 'HAPPY', 'SAD', 'ANGRY', 'FEARFUL', 'DISGUSTED', 'SURPRISED');
ALTER TABLE "MoodEntry" ALTER COLUMN "mood" TYPE "Mood_new" USING ("mood"::text::"Mood_new");
ALTER TYPE "Mood" RENAME TO "Mood_old";
ALTER TYPE "Mood_new" RENAME TO "Mood";
DROP TYPE "public"."Mood_old";
COMMIT;

-- AlterTable
ALTER TABLE "Favorite" ADD COLUMN     "genres" TEXT[],
ADD COLUMN     "overview" TEXT,
ADD COLUMN     "voteAverage" DOUBLE PRECISION,
ADD COLUMN     "year" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "name" TEXT;
