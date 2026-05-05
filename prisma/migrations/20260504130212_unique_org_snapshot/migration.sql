/*
  Warnings:

  - A unique constraint covering the columns `[organizationId]` on the table `ComplianceSnapshot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ComplianceSnapshot_organizationId_key" ON "ComplianceSnapshot"("organizationId");
