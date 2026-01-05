-- CreateTable
CREATE TABLE "PipelineLossReason" (
    "id" UUID NOT NULL,
    "pipelineId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PipelineLossReason_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PipelineLossReason_pipelineId_idx" ON "PipelineLossReason"("pipelineId");

-- AddForeignKey
ALTER TABLE "PipelineLossReason" ADD CONSTRAINT "PipelineLossReason_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Deal" ADD COLUMN "lossReasonId" UUID;

-- CreateIndex
CREATE INDEX "Deal_lossReasonId_idx" ON "Deal"("lossReasonId");

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_lossReasonId_fkey" FOREIGN KEY ("lossReasonId") REFERENCES "PipelineLossReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;
