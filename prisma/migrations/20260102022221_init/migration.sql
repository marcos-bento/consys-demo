/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Candidato` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Colaborador` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ferias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ImportacaoPonto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NotaCandidato` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RegistroPonto` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roleId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Candidato" DROP CONSTRAINT "Candidato_responsavelId_fkey";

-- DropForeignKey
ALTER TABLE "Ferias" DROP CONSTRAINT "Ferias_colaboradorId_fkey";

-- DropForeignKey
ALTER TABLE "ImportacaoPonto" DROP CONSTRAINT "ImportacaoPonto_colaboradorId_fkey";

-- DropForeignKey
ALTER TABLE "NotaCandidato" DROP CONSTRAINT "NotaCandidato_candidatoId_fkey";

-- DropForeignKey
ALTER TABLE "NotaCandidato" DROP CONSTRAINT "NotaCandidato_responsavelId_fkey";

-- DropForeignKey
ALTER TABLE "RegistroPonto" DROP CONSTRAINT "RegistroPonto_colaboradorId_fkey";

-- DropForeignKey
ALTER TABLE "RegistroPonto" DROP CONSTRAINT "RegistroPonto_importacaoId_fkey";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "role",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "roleId" UUID NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Candidato";

-- DropTable
DROP TABLE "Colaborador";

-- DropTable
DROP TABLE "Ferias";

-- DropTable
DROP TABLE "ImportacaoPonto";

-- DropTable
DROP TABLE "NotaCandidato";

-- DropTable
DROP TABLE "RegistroPonto";

-- DropEnum
DROP TYPE "StatusCandidato";

-- DropEnum
DROP TYPE "StatusColaborador";

-- DropEnum
DROP TYPE "StatusFerias";

-- DropEnum
DROP TYPE "TipoArquivoPonto";

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" UUID,
    "unit" TEXT NOT NULL,
    "isStockControlled" BOOLEAN NOT NULL DEFAULT true,
    "minStock" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "baseCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "basePrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockBalance" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "note" TEXT,
    "referenceType" TEXT,
    "referenceId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tradeName" TEXT,
    "document" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientAddress" (
    "id" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT,
    "complement" TEXT,
    "district" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierCategory" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "tradeName" TEXT,
    "document" TEXT NOT NULL,
    "categoryId" UUID,
    "email" TEXT,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierAddress" (
    "id" UUID NOT NULL,
    "supplierId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT,
    "complement" TEXT,
    "district" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierContact" (
    "id" UUID NOT NULL,
    "supplierId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplierContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentType" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentStatus" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DocumentStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "typeId" UUID NOT NULL,
    "statusId" UUID NOT NULL,
    "clientId" UUID,
    "supplierId" UUID,
    "title" TEXT,
    "description" TEXT,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentItem" (
    "id" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "productId" UUID,
    "description" TEXT,
    "quantity" DECIMAL(12,2) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentFile" (
    "id" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT,
    "storageKey" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentEvent" (
    "id" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "eventType" TEXT NOT NULL,
    "message" TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pipeline" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineStage" (
    "id" UUID NOT NULL,
    "pipelineId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isWon" BOOLEAN NOT NULL DEFAULT false,
    "isLost" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PipelineStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "pipelineId" UUID NOT NULL,
    "stageId" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "title" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "estimatedValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "ownerId" UUID,
    "source" TEXT,
    "expectedCloseDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealActivity" (
    "id" UUID NOT NULL,
    "dealId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealDocument" (
    "id" UUID NOT NULL,
    "dealId" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialCategory" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialEntry" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "description" TEXT NOT NULL,
    "categoryId" UUID,
    "clientId" UUID,
    "supplierId" UUID,
    "documentId" UUID,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "amount" DECIMAL(12,2) NOT NULL,
    "paidAmount" DECIMAL(12,2),
    "interest" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialEvent" (
    "id" UUID NOT NULL,
    "financialEntryId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "supplierId" UUID,
    "requestedById" UUID,
    "responsibleId" UUID,
    "type" TEXT NOT NULL DEFAULT 'REQUEST',
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "title" TEXT,
    "notes" TEXT,
    "estimatedTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseItem" (
    "id" UUID NOT NULL,
    "purchaseId" UUID NOT NULL,
    "productId" UUID,
    "description" TEXT,
    "quantity" DECIMAL(12,2) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseEvent" (
    "id" UUID NOT NULL,
    "purchaseId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseReceipt" (
    "id" UUID NOT NULL,
    "purchaseId" UUID NOT NULL,
    "receivedById" UUID,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "PurchaseReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseReceiptItem" (
    "id" UUID NOT NULL,
    "receiptId" UUID NOT NULL,
    "purchaseItemId" UUID NOT NULL,
    "quantityReceived" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "PurchaseReceiptItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assistance" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "clientId" UUID NOT NULL,
    "addressId" UUID,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "stage" TEXT NOT NULL DEFAULT 'NEW',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "title" TEXT,
    "description" TEXT NOT NULL,
    "responsibleId" UUID,
    "scheduledAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assistance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssistanceEvent" (
    "id" UUID NOT NULL,
    "assistanceId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssistanceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssistanceFile" (
    "id" UUID NOT NULL,
    "assistanceId" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT,
    "storageKey" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssistanceFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssistanceDocument" (
    "id" UUID NOT NULL,
    "assistanceId" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssistanceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "capacity" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "driverId" UUID,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleSchedule" (
    "id" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "clientId" UUID,
    "addressId" UUID,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceOrder" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "vehicleId" UUID NOT NULL,
    "scheduleId" UUID,
    "date" TIMESTAMP(3) NOT NULL,
    "driverId" UUID,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceOrderItem" (
    "id" UUID NOT NULL,
    "serviceOrderId" UUID NOT NULL,
    "clientId" UUID,
    "addressId" UUID,
    "sequence" INTEGER NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "ServiceOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "entityType" TEXT NOT NULL,
    "entityId" UUID,
    "action" TEXT NOT NULL,
    "message" TEXT,
    "metadata" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "StockBalance_productId_key" ON "StockBalance"("productId");

-- CreateIndex
CREATE INDEX "StockMovement_productId_idx" ON "StockMovement"("productId");

-- CreateIndex
CREATE INDEX "StockMovement_referenceId_idx" ON "StockMovement"("referenceId");

-- CreateIndex
CREATE INDEX "ClientAddress_clientId_idx" ON "ClientAddress"("clientId");

-- CreateIndex
CREATE INDEX "Supplier_categoryId_idx" ON "Supplier"("categoryId");

-- CreateIndex
CREATE INDEX "SupplierAddress_supplierId_idx" ON "SupplierAddress"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierContact_supplierId_idx" ON "SupplierContact"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentType_name_key" ON "DocumentType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentStatus_name_key" ON "DocumentStatus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Document_code_key" ON "Document"("code");

-- CreateIndex
CREATE INDEX "Document_clientId_idx" ON "Document"("clientId");

-- CreateIndex
CREATE INDEX "Document_supplierId_idx" ON "Document"("supplierId");

-- CreateIndex
CREATE INDEX "Document_createdById_idx" ON "Document"("createdById");

-- CreateIndex
CREATE INDEX "Document_typeId_idx" ON "Document"("typeId");

-- CreateIndex
CREATE INDEX "Document_statusId_idx" ON "Document"("statusId");

-- CreateIndex
CREATE INDEX "DocumentItem_documentId_idx" ON "DocumentItem"("documentId");

-- CreateIndex
CREATE INDEX "DocumentItem_productId_idx" ON "DocumentItem"("productId");

-- CreateIndex
CREATE INDEX "DocumentFile_documentId_idx" ON "DocumentFile"("documentId");

-- CreateIndex
CREATE INDEX "DocumentEvent_documentId_idx" ON "DocumentEvent"("documentId");

-- CreateIndex
CREATE INDEX "DocumentEvent_createdById_idx" ON "DocumentEvent"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "Pipeline_name_key" ON "Pipeline"("name");

-- CreateIndex
CREATE INDEX "PipelineStage_pipelineId_idx" ON "PipelineStage"("pipelineId");

-- CreateIndex
CREATE UNIQUE INDEX "Deal_code_key" ON "Deal"("code");

-- CreateIndex
CREATE INDEX "Deal_pipelineId_idx" ON "Deal"("pipelineId");

-- CreateIndex
CREATE INDEX "Deal_stageId_idx" ON "Deal"("stageId");

-- CreateIndex
CREATE INDEX "Deal_clientId_idx" ON "Deal"("clientId");

-- CreateIndex
CREATE INDEX "Deal_ownerId_idx" ON "Deal"("ownerId");

-- CreateIndex
CREATE INDEX "DealActivity_dealId_idx" ON "DealActivity"("dealId");

-- CreateIndex
CREATE INDEX "DealActivity_createdById_idx" ON "DealActivity"("createdById");

-- CreateIndex
CREATE INDEX "DealDocument_documentId_idx" ON "DealDocument"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "DealDocument_dealId_documentId_key" ON "DealDocument"("dealId", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialCategory_name_key" ON "FinancialCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialEntry_code_key" ON "FinancialEntry"("code");

-- CreateIndex
CREATE INDEX "FinancialEntry_categoryId_idx" ON "FinancialEntry"("categoryId");

-- CreateIndex
CREATE INDEX "FinancialEntry_clientId_idx" ON "FinancialEntry"("clientId");

-- CreateIndex
CREATE INDEX "FinancialEntry_supplierId_idx" ON "FinancialEntry"("supplierId");

-- CreateIndex
CREATE INDEX "FinancialEntry_documentId_idx" ON "FinancialEntry"("documentId");

-- CreateIndex
CREATE INDEX "FinancialEntry_createdById_idx" ON "FinancialEntry"("createdById");

-- CreateIndex
CREATE INDEX "FinancialEvent_financialEntryId_idx" ON "FinancialEvent"("financialEntryId");

-- CreateIndex
CREATE INDEX "FinancialEvent_createdById_idx" ON "FinancialEvent"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_code_key" ON "Purchase"("code");

-- CreateIndex
CREATE INDEX "Purchase_supplierId_idx" ON "Purchase"("supplierId");

-- CreateIndex
CREATE INDEX "Purchase_requestedById_idx" ON "Purchase"("requestedById");

-- CreateIndex
CREATE INDEX "Purchase_responsibleId_idx" ON "Purchase"("responsibleId");

-- CreateIndex
CREATE INDEX "PurchaseItem_purchaseId_idx" ON "PurchaseItem"("purchaseId");

-- CreateIndex
CREATE INDEX "PurchaseItem_productId_idx" ON "PurchaseItem"("productId");

-- CreateIndex
CREATE INDEX "PurchaseEvent_purchaseId_idx" ON "PurchaseEvent"("purchaseId");

-- CreateIndex
CREATE INDEX "PurchaseEvent_createdById_idx" ON "PurchaseEvent"("createdById");

-- CreateIndex
CREATE INDEX "PurchaseReceipt_purchaseId_idx" ON "PurchaseReceipt"("purchaseId");

-- CreateIndex
CREATE INDEX "PurchaseReceipt_receivedById_idx" ON "PurchaseReceipt"("receivedById");

-- CreateIndex
CREATE INDEX "PurchaseReceiptItem_receiptId_idx" ON "PurchaseReceiptItem"("receiptId");

-- CreateIndex
CREATE INDEX "PurchaseReceiptItem_purchaseItemId_idx" ON "PurchaseReceiptItem"("purchaseItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Assistance_code_key" ON "Assistance"("code");

-- CreateIndex
CREATE INDEX "Assistance_clientId_idx" ON "Assistance"("clientId");

-- CreateIndex
CREATE INDEX "Assistance_addressId_idx" ON "Assistance"("addressId");

-- CreateIndex
CREATE INDEX "Assistance_responsibleId_idx" ON "Assistance"("responsibleId");

-- CreateIndex
CREATE INDEX "AssistanceEvent_assistanceId_idx" ON "AssistanceEvent"("assistanceId");

-- CreateIndex
CREATE INDEX "AssistanceEvent_createdById_idx" ON "AssistanceEvent"("createdById");

-- CreateIndex
CREATE INDEX "AssistanceFile_assistanceId_idx" ON "AssistanceFile"("assistanceId");

-- CreateIndex
CREATE INDEX "AssistanceDocument_documentId_idx" ON "AssistanceDocument"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "AssistanceDocument_assistanceId_documentId_key" ON "AssistanceDocument"("assistanceId", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plate_key" ON "Vehicle"("plate");

-- CreateIndex
CREATE INDEX "Vehicle_driverId_idx" ON "Vehicle"("driverId");

-- CreateIndex
CREATE INDEX "VehicleSchedule_vehicleId_idx" ON "VehicleSchedule"("vehicleId");

-- CreateIndex
CREATE INDEX "VehicleSchedule_clientId_idx" ON "VehicleSchedule"("clientId");

-- CreateIndex
CREATE INDEX "VehicleSchedule_addressId_idx" ON "VehicleSchedule"("addressId");

-- CreateIndex
CREATE INDEX "VehicleSchedule_createdById_idx" ON "VehicleSchedule"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceOrder_code_key" ON "ServiceOrder"("code");

-- CreateIndex
CREATE INDEX "ServiceOrder_vehicleId_idx" ON "ServiceOrder"("vehicleId");

-- CreateIndex
CREATE INDEX "ServiceOrder_scheduleId_idx" ON "ServiceOrder"("scheduleId");

-- CreateIndex
CREATE INDEX "ServiceOrder_driverId_idx" ON "ServiceOrder"("driverId");

-- CreateIndex
CREATE INDEX "ServiceOrderItem_serviceOrderId_idx" ON "ServiceOrderItem"("serviceOrderId");

-- CreateIndex
CREATE INDEX "ServiceOrderItem_clientId_idx" ON "ServiceOrderItem"("clientId");

-- CreateIndex
CREATE INDEX "ServiceOrderItem_addressId_idx" ON "ServiceOrderItem"("addressId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockBalance" ADD CONSTRAINT "StockBalance_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAddress" ADD CONSTRAINT "ClientAddress_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SupplierCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierAddress" ADD CONSTRAINT "SupplierAddress_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierContact" ADD CONSTRAINT "SupplierContact_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "DocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "DocumentStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentItem" ADD CONSTRAINT "DocumentItem_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentItem" ADD CONSTRAINT "DocumentItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentFile" ADD CONSTRAINT "DocumentFile_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentEvent" ADD CONSTRAINT "DocumentEvent_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentEvent" ADD CONSTRAINT "DocumentEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineStage" ADD CONSTRAINT "PipelineStage_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "PipelineStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealActivity" ADD CONSTRAINT "DealActivity_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealActivity" ADD CONSTRAINT "DealActivity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealDocument" ADD CONSTRAINT "DealDocument_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealDocument" ADD CONSTRAINT "DealDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialEntry" ADD CONSTRAINT "FinancialEntry_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FinancialCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialEntry" ADD CONSTRAINT "FinancialEntry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialEntry" ADD CONSTRAINT "FinancialEntry_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialEntry" ADD CONSTRAINT "FinancialEntry_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialEntry" ADD CONSTRAINT "FinancialEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialEvent" ADD CONSTRAINT "FinancialEvent_financialEntryId_fkey" FOREIGN KEY ("financialEntryId") REFERENCES "FinancialEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialEvent" ADD CONSTRAINT "FinancialEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseEvent" ADD CONSTRAINT "PurchaseEvent_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseEvent" ADD CONSTRAINT "PurchaseEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReceipt" ADD CONSTRAINT "PurchaseReceipt_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReceipt" ADD CONSTRAINT "PurchaseReceipt_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReceiptItem" ADD CONSTRAINT "PurchaseReceiptItem_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "PurchaseReceipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseReceiptItem" ADD CONSTRAINT "PurchaseReceiptItem_purchaseItemId_fkey" FOREIGN KEY ("purchaseItemId") REFERENCES "PurchaseItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assistance" ADD CONSTRAINT "Assistance_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assistance" ADD CONSTRAINT "Assistance_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "ClientAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assistance" ADD CONSTRAINT "Assistance_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistanceEvent" ADD CONSTRAINT "AssistanceEvent_assistanceId_fkey" FOREIGN KEY ("assistanceId") REFERENCES "Assistance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistanceEvent" ADD CONSTRAINT "AssistanceEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistanceFile" ADD CONSTRAINT "AssistanceFile_assistanceId_fkey" FOREIGN KEY ("assistanceId") REFERENCES "Assistance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistanceDocument" ADD CONSTRAINT "AssistanceDocument_assistanceId_fkey" FOREIGN KEY ("assistanceId") REFERENCES "Assistance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistanceDocument" ADD CONSTRAINT "AssistanceDocument_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleSchedule" ADD CONSTRAINT "VehicleSchedule_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleSchedule" ADD CONSTRAINT "VehicleSchedule_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleSchedule" ADD CONSTRAINT "VehicleSchedule_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "ClientAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleSchedule" ADD CONSTRAINT "VehicleSchedule_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOrder" ADD CONSTRAINT "ServiceOrder_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOrder" ADD CONSTRAINT "ServiceOrder_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "VehicleSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOrder" ADD CONSTRAINT "ServiceOrder_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOrderItem" ADD CONSTRAINT "ServiceOrderItem_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "ServiceOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOrderItem" ADD CONSTRAINT "ServiceOrderItem_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOrderItem" ADD CONSTRAINT "ServiceOrderItem_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "ClientAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
