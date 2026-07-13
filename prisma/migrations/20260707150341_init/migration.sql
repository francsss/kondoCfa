-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'SENDER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('CREATED', 'IN_PROGRESS', 'CANCELLED', 'SUCCESS');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ORANGE_MONEY', 'MTN_MOMO');

-- CreateEnum
CREATE TYPE "PaymentProviderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentAttemptStatus" AS ENUM ('CREATED', 'PENDING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT,
    "role" "Role" NOT NULL DEFAULT 'SENDER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "refCode" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'CREATED',
    "amountXaf" INTEGER NOT NULL,
    "exchangeRate" DECIMAL(10,6) NOT NULL,
    "feeXaf" INTEGER NOT NULL,
    "totalXaf" INTEGER NOT NULL,
    "payoutAmountCnyFen" INTEGER NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "payerCountryCode" TEXT,
    "payerPhoneNational" TEXT,
    "payerPhoneE164" TEXT,
    "payerOperator" TEXT,
    "paymentProviderStatus" "PaymentProviderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentProviderRequestId" TEXT,
    "paymentProviderReference" TEXT,
    "paymentInitiatedAt" TIMESTAMP(3),
    "paymentConfirmedAt" TIMESTAMP(3),
    "paymentConfirmedById" TEXT,
    "paymentFailureReason" TEXT,
    "beneficiaryName" TEXT NOT NULL,
    "beneficiaryAlipayId" TEXT NOT NULL,
    "beneficiaryPhone" TEXT,
    "purpose" TEXT,
    "alipayPayoutReference" TEXT,
    "alipayPayoutCompletedAt" TIMESTAMP(3),
    "alipayPayoutCompletedById" TEXT,
    "cancelReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelledById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "provider" "PaymentMethod" NOT NULL,
    "payerOperator" TEXT NOT NULL,
    "payerCountryCode" TEXT NOT NULL DEFAULT '+237',
    "payerPhoneNational" TEXT NOT NULL,
    "payerPhoneE164" TEXT NOT NULL,
    "amountXaf" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'XAF',
    "status" "PaymentAttemptStatus" NOT NULL DEFAULT 'CREATED',
    "providerRequestId" TEXT,
    "providerReference" TEXT,
    "failureReason" TEXT,
    "initiatedAt" TIMESTAMP(3),
    "succeededAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "rawProviderResponse" JSONB,
    "rawWebhookPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipient" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "alipayId" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT NOT NULL DEFAULT 'CN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Transfer_refCode_key" ON "Transfer"("refCode");

-- CreateIndex
CREATE INDEX "Transfer_senderId_idx" ON "Transfer"("senderId");

-- CreateIndex
CREATE INDEX "Transfer_status_idx" ON "Transfer"("status");

-- CreateIndex
CREATE INDEX "Transfer_createdAt_idx" ON "Transfer"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAttempt_providerRequestId_key" ON "PaymentAttempt"("providerRequestId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_transferId_idx" ON "PaymentAttempt"("transferId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_provider_idx" ON "PaymentAttempt"("provider");

-- CreateIndex
CREATE INDEX "PaymentAttempt_status_idx" ON "PaymentAttempt"("status");

-- CreateIndex
CREATE INDEX "PaymentAttempt_createdAt_idx" ON "PaymentAttempt"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AppSetting_key_key" ON "AppSetting"("key");

-- CreateIndex
CREATE INDEX "Recipient_userId_idx" ON "Recipient"("userId");

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_paymentConfirmedById_fkey" FOREIGN KEY ("paymentConfirmedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_alipayPayoutCompletedById_fkey" FOREIGN KEY ("alipayPayoutCompletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "Transfer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipient" ADD CONSTRAINT "Recipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
