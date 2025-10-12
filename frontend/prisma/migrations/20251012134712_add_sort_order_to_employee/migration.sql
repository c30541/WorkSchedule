-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Employee_sortOrder_idx" ON "Employee"("sortOrder");
