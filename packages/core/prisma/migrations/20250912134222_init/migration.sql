-- CreateEnum
CREATE TYPE "os"."AddressType" AS ENUM ('E911', 'Billing', 'Shipping');

-- CreateEnum
CREATE TYPE "os"."CreditSource" AS ENUM ('PROMO_CODE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "os"."DeviceType" AS ENUM ('IOS', 'ANDROID');

-- CreateEnum
CREATE TYPE "os"."InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'VOID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "os"."LogEventType" AS ENUM ('USER_CREATED', 'USER_VERIFIED', 'USER_DELETED', 'ONBOARDING_STAGE_STARTED', 'ONBOARDING_STAGE_COMPLETED', 'ORDER_CREATED', 'ORDER_CONFIRMED', 'ORDER_COMPLETED', 'ORDER_ERRORED', 'ORDER_ABORTED', 'ORDER_CANCELLED', 'SUBSCRIPTION_CREATED', 'SUBSCRIPTION_ACTIVATED', 'SUBSCRIPTION_CANCELLED', 'SUBSCRIPTION_UNCANCELLED', 'SUBSCRIPTION_REACTIVATED', 'SUBSCRIPTION_DEACTIVATED', 'SUBSCRIPTION_SUSPENDED', 'LEGACY_REQUEST');

-- CreateEnum
CREATE TYPE "os"."OnboardingStageType" AS ENUM ('CONTENT', 'ADDRESS', 'PAYMENT', 'ORDER_PLAN', 'ORDER_MSISDN', 'ORDER_SIM_TYPE', 'ORDER_CONFIRM', 'ORDER_PROCESS', 'KYC');

-- CreateEnum
CREATE TYPE "os"."OrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'PENDING', 'PROCESSING', 'ERROR', 'DONE', 'ABORTED');

-- CreateEnum
CREATE TYPE "os"."OrderAction" AS ENUM ('RUN', 'ABORT');

-- CreateEnum
CREATE TYPE "os"."OrderType" AS ENUM ('ADD_PLAN', 'RENEW_PLAN', 'CHANGE_PLAN', 'CHANGE_SIM', 'CHANGE_PHONE_NUMBER', 'DEACTIVATE_PLAN', 'REACTIVATE_PLAN', 'PORT_IN', 'PORT_OUT');

-- CreateEnum
CREATE TYPE "os"."OrderStepStatus" AS ENUM ('PENDING', 'PROCESSING', 'ERROR', 'DONE', 'ABORTED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "os"."OrderRunStatus" AS ENUM ('PROCESSING', 'DONE', 'ERROR');

-- CreateEnum
CREATE TYPE "os"."OrderRunStepStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'ERROR', 'SKIPPED');

-- CreateEnum
CREATE TYPE "os"."PhoneNumberSource" AS ENUM ('GENERATED', 'IMPORTED');

-- CreateEnum
CREATE TYPE "os"."PhoneNumberStatus" AS ENUM ('INITIAL', 'RESERVED', 'AVAILABLE', 'ASSIGNED');

-- CreateEnum
CREATE TYPE "os"."RewardType" AS ENUM ('CASHBACK_CREDITS', 'CASHBACK_CRYPTO');

-- CreateEnum
CREATE TYPE "os"."SettingKey" AS ENUM ('MOBILE_APP', 'PRIVACY_POLICY', 'TERMS_AND_CONDITIONS', 'FAQ', 'ORDER_STEP_RETRIES');

-- CreateEnum
CREATE TYPE "os"."SimType" AS ENUM ('P_SIM', 'E_SIM');

-- CreateEnum
CREATE TYPE "os"."SimStatus" AS ENUM ('INITIAL', 'RESERVED', 'AVAILABLE', 'ASSIGNED');

-- CreateEnum
CREATE TYPE "os"."SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'CANCELLED', 'DEACTIVATED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "os"."SubscriptionPeriodStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "os"."TaxProvider" AS ENUM ('MOCK');

-- CreateEnum
CREATE TYPE "os"."TelcoProvider" AS ENUM ('MOCK');

-- CreateEnum
CREATE TYPE "os"."WalletCashbackCurrency" AS ENUM ('SOL', 'USDC', 'WBTC');

-- CreateEnum
CREATE TYPE "os"."VolumeType" AS ENUM ('DATA', 'TEXT', 'CALL', 'CREDIT');

-- CreateEnum
CREATE TYPE "os"."WalletProvider" AS ENUM ('SOLANA');

-- CreateEnum
CREATE TYPE "os"."EdgeType" AS ENUM ('LEADING', 'TRAILING');

-- CreateTable
CREATE TABLE "os"."Address" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "os"."AddressType" NOT NULL,
    "name" TEXT,
    "line1" TEXT NOT NULL,
    "line2" TEXT NOT NULL,
    "line3" TEXT NOT NULL,
    "line4" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."Admin" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."Session" (
    "id" UUID NOT NULL,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."UserAuthData" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "UserAuthData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."AdminAuthData" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "adminId" UUID NOT NULL,

    CONSTRAINT "AdminAuthData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."UserBillingData" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "UserBillingData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."InvoiceBillingData" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "invoiceId" UUID NOT NULL,

    CONSTRAINT "InvoiceBillingData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."Country" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "favourite" BOOLEAN NOT NULL DEFAULT false,
    "roaming" BOOLEAN NOT NULL DEFAULT false,
    "rate" DECIMAL(19,4),

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."Credit" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "providedCost" DECIMAL(19,4) NOT NULL,
    "usedCost" DECIMAL(19,4) NOT NULL,
    "content" JSONB NOT NULL,
    "userId" UUID NOT NULL,
    "subscriptionId" UUID,

    CONSTRAINT "Credit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."CreditUsage" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedCost" DECIMAL(19,4) NOT NULL,
    "creditId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,

    CONSTRAINT "CreditUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."Device" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "os"."DeviceType" NOT NULL,
    "name" TEXT NOT NULL,
    "eSimSupport" BOOLEAN NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."Invoice" (
    "id" UUID NOT NULL,
    "status" "os"."InvoiceStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoicedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "voidedAt" TIMESTAMP(3),
    "totalCost" DECIMAL(19,4) NOT NULL,
    "orderId" UUID NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."InvoiceItem" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "costPerItem" DECIMAL(19,4) NOT NULL,
    "totalCost" DECIMAL(19,4) NOT NULL,
    "invoiceId" UUID NOT NULL,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."UserKycData" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "UserKycData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."LogEvent" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "os"."LogEventType" NOT NULL,
    "data" JSONB NOT NULL,
    "userId" UUID,
    "subscriptionId" UUID,
    "orderId" UUID,

    CONSTRAINT "LogEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."Offer" (
    "id" UUID NOT NULL,
    "legalId" TEXT NOT NULL DEFAULT 'legal-id',
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL,
    "isPublic" BOOLEAN NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "content" JSONB NOT NULL,
    "originalCost" DECIMAL(19,4),
    "cost" DECIMAL(19,4) NOT NULL,
    "providedCredits" DECIMAL(19,4),
    "planId" UUID NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."OfferToOffer" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parentId" UUID NOT NULL,
    "childId" UUID NOT NULL,

    CONSTRAINT "OfferToOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."OnboardingStage" (
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sort" INTEGER NOT NULL,
    "type" "os"."OnboardingStageType" NOT NULL,
    "required" BOOLEAN NOT NULL,
    "content" JSONB NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "OnboardingStage_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "os"."OnboardingProgress" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "stageName" TEXT NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "OnboardingProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."OrderPortOutDetails" (
    "accountNumber" TEXT,
    "password" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "request" JSONB,
    "error" JSONB,
    "orderId" UUID NOT NULL,

    CONSTRAINT "OrderPortOutDetails_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "os"."OrderRenewPlanDetails" (
    "orderId" UUID NOT NULL,
    "offerId" UUID NOT NULL,
    "subscriptionPeriodId" UUID NOT NULL,
    "promoCodeId" UUID,

    CONSTRAINT "OrderRenewPlanDetails_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "os"."OrderChangePlanDetails" (
    "orderId" UUID NOT NULL,
    "offerId" UUID NOT NULL,
    "promoCodeId" UUID,

    CONSTRAINT "OrderChangePlanDetails_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "os"."OrderDeactivatePlanDetails" (
    "orderId" UUID NOT NULL,

    CONSTRAINT "OrderDeactivatePlanDetails_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "os"."OrderReactivatePlanDetails" (
    "orderId" UUID NOT NULL,
    "offerId" UUID,

    CONSTRAINT "OrderReactivatePlanDetails_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "os"."OrderChangeSimDetails" (
    "newSimType" "os"."SimType" NOT NULL,
    "newSimIccid" TEXT,
    "orderId" UUID NOT NULL,

    CONSTRAINT "OrderChangeSimDetails_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "os"."OrderChangePhoneNumberDetails" (
    "portIn" BOOLEAN NOT NULL DEFAULT false,
    "portInMsisdn" TEXT,
    "portInPostalCode" TEXT,
    "portInAccountNumber" TEXT,
    "portInPassword" TEXT,
    "orderId" UUID NOT NULL,

    CONSTRAINT "OrderChangePhoneNumberDetails_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "os"."OrderAddPlanDetails" (
    "simType" "os"."SimType" NOT NULL DEFAULT 'E_SIM',
    "simIccid" TEXT,
    "portIn" BOOLEAN NOT NULL DEFAULT false,
    "portInMsisdn" TEXT,
    "portInPostalCode" TEXT,
    "portInAccountNumber" TEXT,
    "portInPassword" TEXT,
    "orderId" UUID NOT NULL,
    "offerId" UUID NOT NULL,
    "parentSubscriptionId" UUID,
    "subscriptionPeriodId" UUID,
    "promoCodeId" UUID,

    CONSTRAINT "OrderAddPlanDetails_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "os"."OrderShippingDetails" (
    "name" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT NOT NULL,
    "line3" TEXT NOT NULL,
    "line4" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "shippedAt" TIMESTAMP(3),
    "orderId" UUID NOT NULL,

    CONSTRAINT "OrderShippingDetails_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "os"."OrderSigningDetails" (
    "message" TEXT,
    "signedAt" TIMESTAMP(3),
    "signature" TEXT,
    "orderId" UUID NOT NULL,
    "walletId" UUID,

    CONSTRAINT "OrderSigningDetails_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "os"."Order" (
    "id" UUID NOT NULL,
    "type" "os"."OrderType" NOT NULL,
    "status" "os"."OrderStatus" NOT NULL,
    "action" "os"."OrderAction" NOT NULL,
    "stepNo" INTEGER,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "runAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "userId" UUID NOT NULL,
    "subscriptionId" UUID,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."OrderStep" (
    "stepNo" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" "os"."OrderStepStatus" NOT NULL,
    "action" "os"."OrderAction" NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "result" JSONB,
    "error" JSONB,
    "orderId" UUID NOT NULL,

    CONSTRAINT "OrderStep_pkey" PRIMARY KEY ("orderId","stepNo")
);

-- CreateTable
CREATE TABLE "os"."OrderRun" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" "os"."OrderRunStatus" NOT NULL,
    "action" "os"."OrderAction" NOT NULL,
    "stepNo" INTEGER,
    "result" JSONB,
    "error" JSONB,
    "orderId" UUID NOT NULL,

    CONSTRAINT "OrderRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."OrderRunStep" (
    "stepNo" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" "os"."OrderRunStepStatus" NOT NULL,
    "action" "os"."OrderAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "result" JSONB,
    "error" JSONB,
    "runId" UUID NOT NULL,
    "orderId" UUID NOT NULL,

    CONSTRAINT "OrderRunStep_pkey" PRIMARY KEY ("runId","stepNo")
);

-- CreateTable
CREATE TABLE "os"."PhoneNumber" (
    "msisdn" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "os"."PhoneNumberSource" NOT NULL,
    "status" "os"."PhoneNumberStatus" NOT NULL,

    CONSTRAINT "PhoneNumber_pkey" PRIMARY KEY ("msisdn")
);

-- CreateTable
CREATE TABLE "os"."PhoneNumberAssignment" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "phoneNumberMsisdn" TEXT NOT NULL,
    "subscriptionId" UUID NOT NULL,

    CONSTRAINT "PhoneNumberAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."Plan" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "isStandalone" BOOLEAN NOT NULL,
    "validForSeconds" INTEGER NOT NULL,
    "doesAutoRenew" BOOLEAN NOT NULL,
    "billingEdge" "os"."EdgeType" NOT NULL,
    "billingOffset" INTEGER NOT NULL,
    "telcoEdge" "os"."EdgeType" NOT NULL,
    "telcoOffset" INTEGER NOT NULL,
    "content" JSONB NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."PlanToPlan" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parentId" UUID NOT NULL,
    "childId" UUID NOT NULL,

    CONSTRAINT "PlanToPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."PromoCode" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "maxActivations" INTEGER,
    "usedActivations" INTEGER NOT NULL DEFAULT 0,
    "receiverEmail" TEXT,
    "content" JSONB NOT NULL,
    "receiverId" UUID,
    "ownerId" UUID,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."PromoCodeActivation" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "promoCodeId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "subscriptionId" UUID,

    CONSTRAINT "PromoCodeActivation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."Reward" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "type" "os"."RewardType" NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "data" JSONB NOT NULL,
    "content" JSONB NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."RewardPayout" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB NOT NULL,
    "cost" DECIMAL(19,4) NOT NULL,
    "rewardId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "offerId" UUID NOT NULL,

    CONSTRAINT "RewardPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."Setting" (
    "key" "os"."SettingKey" NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "os"."Sim" (
    "iccid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "os"."SimType" NOT NULL,
    "status" "os"."SimStatus" NOT NULL,
    "pin" TEXT,
    "puk" TEXT,
    "pin2" TEXT,
    "puk2" TEXT,

    CONSTRAINT "Sim_pkey" PRIMARY KEY ("iccid")
);

-- CreateTable
CREATE TABLE "os"."SimAssignment" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "simIccid" TEXT NOT NULL,
    "subscriptionId" UUID NOT NULL,

    CONSTRAINT "SimAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."Subscription" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "os"."SubscriptionStatus" NOT NULL,
    "label" TEXT,
    "activatedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "deactivatedAt" TIMESTAMP(3),
    "billingEdge" "os"."EdgeType" NOT NULL,
    "billingOffset" INTEGER NOT NULL,
    "telcoEdge" "os"."EdgeType" NOT NULL,
    "telcoOffset" INTEGER NOT NULL,
    "userId" UUID NOT NULL,
    "offerId" UUID NOT NULL,
    "parentId" UUID,
    "simIccid" TEXT,
    "phoneNumberMsisdn" TEXT,
    "currentPeriodId" UUID,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."SubscriptionPeriod" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "os"."SubscriptionPeriodStatus" NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "subscriptionId" UUID NOT NULL,
    "offerId" UUID NOT NULL,

    CONSTRAINT "SubscriptionPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."SubscriptionHistory" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "subscriptionId" UUID NOT NULL,
    "simIccid" TEXT,
    "phoneNumberMsisdn" TEXT,

    CONSTRAINT "SubscriptionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."SubscriptionUsage" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "os"."VolumeType" NOT NULL,
    "isRoaming" BOOLEAN NOT NULL,
    "isUnlimited" BOOLEAN NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "total" DECIMAL(65,30),
    "historyId" UUID,

    CONSTRAINT "SubscriptionUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."OrderTaxData" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" "os"."TaxProvider" NOT NULL,
    "data" JSONB NOT NULL,
    "orderId" UUID NOT NULL,

    CONSTRAINT "OrderTaxData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."PlanTaxData" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" "os"."TaxProvider" NOT NULL,
    "data" JSONB NOT NULL,
    "planId" UUID NOT NULL,

    CONSTRAINT "PlanTaxData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."PlanTelcoData" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" "os"."TelcoProvider" NOT NULL,
    "data" JSONB NOT NULL,
    "planId" UUID NOT NULL,

    CONSTRAINT "PlanTelcoData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."SimTelcoData" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" "os"."TelcoProvider" NOT NULL,
    "data" JSONB NOT NULL,
    "simIccid" TEXT NOT NULL,

    CONSTRAINT "SimTelcoData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."PhoneNumberTelcoData" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" "os"."TelcoProvider" NOT NULL,
    "data" JSONB NOT NULL,
    "phoneNumberMsisdn" TEXT NOT NULL,

    CONSTRAINT "PhoneNumberTelcoData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."SubscriptionTelcoData" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" "os"."TelcoProvider" NOT NULL,
    "data" JSONB NOT NULL,
    "subscriptionId" UUID NOT NULL,

    CONSTRAINT "SubscriptionTelcoData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."SubscriptionHistoryTelcoData" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" "os"."TelcoProvider" NOT NULL,
    "data" JSONB NOT NULL,
    "subscriptionHistoryId" UUID NOT NULL,

    CONSTRAINT "SubscriptionHistoryTelcoData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."User" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "groupId" UUID,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."UserSettings" (
    "email" BOOLEAN NOT NULL DEFAULT true,
    "mail" BOOLEAN NOT NULL DEFAULT false,
    "sms" BOOLEAN NOT NULL DEFAULT true,
    "cpni" BOOLEAN NOT NULL DEFAULT true,
    "cashbackCurrency" "os"."WalletCashbackCurrency" NOT NULL DEFAULT 'WBTC',
    "userId" UUID NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "os"."UserGroup" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "isDefaultGroup" BOOLEAN NOT NULL DEFAULT false,
    "isNewWalletEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isPromoCodeFieldEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."Volume" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "os"."VolumeType" NOT NULL,
    "isRoaming" BOOLEAN NOT NULL,
    "isUnlimited" BOOLEAN NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "planId" UUID NOT NULL,

    CONSTRAINT "Volume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."Wallet" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "address" TEXT NOT NULL,
    "provider" "os"."WalletProvider" NOT NULL,
    "isReadOnly" BOOLEAN NOT NULL DEFAULT false,
    "isImported" BOOLEAN NOT NULL DEFAULT false,
    "cloudBackupAt" TIMESTAMP(3),
    "localBackupAt" TIMESTAMP(3),
    "data" JSONB NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."UserWalletData" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" "os"."WalletProvider" NOT NULL,
    "data" JSONB NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "UserWalletData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "os"."_OfferToPromoCode" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_OfferToPromoCode_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "os"."_OfferToReward" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_OfferToReward_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_userId_type_key" ON "os"."Address"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "os"."Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sid_key" ON "os"."Session"("sid");

-- CreateIndex
CREATE UNIQUE INDEX "UserAuthData_provider_strategy_userId_key" ON "os"."UserAuthData"("provider", "strategy", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminAuthData_provider_strategy_adminId_key" ON "os"."AdminAuthData"("provider", "strategy", "adminId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBillingData_provider_userId_key" ON "os"."UserBillingData"("provider", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceBillingData_provider_invoiceId_key" ON "os"."InvoiceBillingData"("provider", "invoiceId");

-- CreateIndex
CREATE INDEX "Country_favourite_name_idx" ON "os"."Country"("favourite", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "os"."Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Device_type_name_key" ON "os"."Device"("type", "name");

-- CreateIndex
CREATE UNIQUE INDEX "UserKycData_provider_userId_key" ON "os"."UserKycData"("provider", "userId");

-- CreateIndex
CREATE INDEX "LogEvent_createdAt_type_idx" ON "os"."LogEvent"("createdAt" DESC, "type");

-- CreateIndex
CREATE INDEX "LogEvent_type_idx" ON "os"."LogEvent"("type");

-- CreateIndex
CREATE INDEX "LogEvent_userId_idx" ON "os"."LogEvent"("userId");

-- CreateIndex
CREATE INDEX "LogEvent_subscriptionId_idx" ON "os"."LogEvent"("subscriptionId");

-- CreateIndex
CREATE INDEX "LogEvent_orderId_idx" ON "os"."LogEvent"("orderId");

-- CreateIndex
CREATE INDEX "Offer_isActive_idx" ON "os"."Offer"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_name_version_key" ON "os"."Offer"("name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "OfferToOffer_parentId_childId_key" ON "os"."OfferToOffer"("parentId", "childId");

-- CreateIndex
CREATE INDEX "OnboardingStage_sort_idx" ON "os"."OnboardingStage"("sort");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingProgress_userId_stageName_key" ON "os"."OnboardingProgress"("userId", "stageName");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "os"."Order"("createdAt");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "os"."Order"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Order_id_stepNo_key" ON "os"."Order"("id", "stepNo");

-- CreateIndex
CREATE INDEX "OrderRun_orderId_createdAt_idx" ON "os"."OrderRun"("orderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrderRun_id_stepNo_key" ON "os"."OrderRun"("id", "stepNo");

-- CreateIndex
CREATE INDEX "OrderRunStep_orderId_stepNo_idx" ON "os"."OrderRunStep"("orderId", "stepNo");

-- CreateIndex
CREATE INDEX "PhoneNumberAssignment_subscriptionId_idx" ON "os"."PhoneNumberAssignment"("subscriptionId");

-- CreateIndex
CREATE INDEX "PhoneNumberAssignment_createdAt_idx" ON "os"."PhoneNumberAssignment"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_version_key" ON "os"."Plan"("name", "version");

-- CreateIndex
CREATE UNIQUE INDEX "PlanToPlan_parentId_childId_key" ON "os"."PlanToPlan"("parentId", "childId");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "os"."PromoCode"("code");

-- CreateIndex
CREATE INDEX "SimAssignment_subscriptionId_idx" ON "os"."SimAssignment"("subscriptionId");

-- CreateIndex
CREATE INDEX "SimAssignment_createdAt_idx" ON "os"."SimAssignment"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_simIccid_key" ON "os"."Subscription"("simIccid");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_phoneNumberMsisdn_key" ON "os"."Subscription"("phoneNumberMsisdn");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_currentPeriodId_key" ON "os"."Subscription"("currentPeriodId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "os"."Subscription"("status");

-- CreateIndex
CREATE INDEX "SubscriptionPeriod_startsAt_idx" ON "os"."SubscriptionPeriod"("startsAt");

-- CreateIndex
CREATE INDEX "SubscriptionPeriod_endsAt_idx" ON "os"."SubscriptionPeriod"("endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrderTaxData_provider_orderId_key" ON "os"."OrderTaxData"("provider", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanTaxData_provider_planId_key" ON "os"."PlanTaxData"("provider", "planId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanTelcoData_provider_planId_key" ON "os"."PlanTelcoData"("provider", "planId");

-- CreateIndex
CREATE UNIQUE INDEX "SimTelcoData_provider_simIccid_key" ON "os"."SimTelcoData"("provider", "simIccid");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumberTelcoData_provider_phoneNumberMsisdn_key" ON "os"."PhoneNumberTelcoData"("provider", "phoneNumberMsisdn");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionTelcoData_provider_subscriptionId_key" ON "os"."SubscriptionTelcoData"("provider", "subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionHistoryTelcoData_provider_subscriptionHistoryId_key" ON "os"."SubscriptionHistoryTelcoData"("provider", "subscriptionHistoryId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "os"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserGroup_name_key" ON "os"."UserGroup"("name");

-- CreateIndex
CREATE INDEX "UserGroup_isDefaultGroup_idx" ON "os"."UserGroup"("isDefaultGroup");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_address_key" ON "os"."Wallet"("userId", "address");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_provider_key" ON "os"."Wallet"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "UserWalletData_provider_userId_key" ON "os"."UserWalletData"("provider", "userId");

-- CreateIndex
CREATE INDEX "_OfferToPromoCode_B_index" ON "os"."_OfferToPromoCode"("B");

-- CreateIndex
CREATE INDEX "_OfferToReward_B_index" ON "os"."_OfferToReward"("B");

-- AddForeignKey
ALTER TABLE "os"."Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "os"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."UserAuthData" ADD CONSTRAINT "UserAuthData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "os"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."AdminAuthData" ADD CONSTRAINT "AdminAuthData_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "os"."Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."UserBillingData" ADD CONSTRAINT "UserBillingData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "os"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."InvoiceBillingData" ADD CONSTRAINT "InvoiceBillingData_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "os"."Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."Credit" ADD CONSTRAINT "Credit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "os"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."Credit" ADD CONSTRAINT "Credit_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "os"."Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."CreditUsage" ADD CONSTRAINT "CreditUsage_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "os"."Credit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."CreditUsage" ADD CONSTRAINT "CreditUsage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "os"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."CreditUsage" ADD CONSTRAINT "CreditUsage_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "os"."Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "os"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "os"."Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."UserKycData" ADD CONSTRAINT "UserKycData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "os"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."LogEvent" ADD CONSTRAINT "LogEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "os"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."LogEvent" ADD CONSTRAINT "LogEvent_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "os"."Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."LogEvent" ADD CONSTRAINT "LogEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "os"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."Offer" ADD CONSTRAINT "Offer_planId_fkey" FOREIGN KEY ("planId") REFERENCES "os"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OfferToOffer" ADD CONSTRAINT "OfferToOffer_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "os"."Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OfferToOffer" ADD CONSTRAINT "OfferToOffer_childId_fkey" FOREIGN KEY ("childId") REFERENCES "os"."Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OnboardingProgress" ADD CONSTRAINT "OnboardingProgress_stageName_fkey" FOREIGN KEY ("stageName") REFERENCES "os"."OnboardingStage"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OnboardingProgress" ADD CONSTRAINT "OnboardingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "os"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderPortOutDetails" ADD CONSTRAINT "OrderPortOutDetails_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "os"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderRenewPlanDetails" ADD CONSTRAINT "OrderRenewPlanDetails_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "os"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderRenewPlanDetails" ADD CONSTRAINT "OrderRenewPlanDetails_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "os"."Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderRenewPlanDetails" ADD CONSTRAINT "OrderRenewPlanDetails_subscriptionPeriodId_fkey" FOREIGN KEY ("subscriptionPeriodId") REFERENCES "os"."SubscriptionPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderRenewPlanDetails" ADD CONSTRAINT "OrderRenewPlanDetails_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "os"."PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderChangePlanDetails" ADD CONSTRAINT "OrderChangePlanDetails_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "os"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderChangePlanDetails" ADD CONSTRAINT "OrderChangePlanDetails_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "os"."Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderChangePlanDetails" ADD CONSTRAINT "OrderChangePlanDetails_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "os"."PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderDeactivatePlanDetails" ADD CONSTRAINT "OrderDeactivatePlanDetails_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "os"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderReactivatePlanDetails" ADD CONSTRAINT "OrderReactivatePlanDetails_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "os"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderReactivatePlanDetails" ADD CONSTRAINT "OrderReactivatePlanDetails_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "os"."Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderChangeSimDetails" ADD CONSTRAINT "OrderChangeSimDetails_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "os"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderChangePhoneNumberDetails" ADD CONSTRAINT "OrderChangePhoneNumberDetails_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "os"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderAddPlanDetails" ADD CONSTRAINT "OrderAddPlanDetails_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "os"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderAddPlanDetails" ADD CONSTRAINT "OrderAddPlanDetails_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "os"."Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderAddPlanDetails" ADD CONSTRAINT "OrderAddPlanDetails_parentSubscriptionId_fkey" FOREIGN KEY ("parentSubscriptionId") REFERENCES "os"."Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderAddPlanDetails" ADD CONSTRAINT "OrderAddPlanDetails_subscriptionPeriodId_fkey" FOREIGN KEY ("subscriptionPeriodId") REFERENCES "os"."SubscriptionPeriod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderAddPlanDetails" ADD CONSTRAINT "OrderAddPlanDetails_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "os"."PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderShippingDetails" ADD CONSTRAINT "OrderShippingDetails_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "os"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderSigningDetails" ADD CONSTRAINT "OrderSigningDetails_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "os"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderSigningDetails" ADD CONSTRAINT "OrderSigningDetails_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "os"."Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "os"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."Order" ADD CONSTRAINT "Order_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "os"."Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."Order" ADD CONSTRAINT "Order_id_stepNo_fkey" FOREIGN KEY ("id", "stepNo") REFERENCES "os"."OrderStep"("orderId", "stepNo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderStep" ADD CONSTRAINT "OrderStep_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "os"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderRun" ADD CONSTRAINT "OrderRun_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "os"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderRun" ADD CONSTRAINT "OrderRun_id_stepNo_fkey" FOREIGN KEY ("id", "stepNo") REFERENCES "os"."OrderRunStep"("runId", "stepNo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderRunStep" ADD CONSTRAINT "OrderRunStep_runId_fkey" FOREIGN KEY ("runId") REFERENCES "os"."OrderRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderRunStep" ADD CONSTRAINT "OrderRunStep_orderId_stepNo_fkey" FOREIGN KEY ("orderId", "stepNo") REFERENCES "os"."OrderStep"("orderId", "stepNo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."PhoneNumberAssignment" ADD CONSTRAINT "PhoneNumberAssignment_phoneNumberMsisdn_fkey" FOREIGN KEY ("phoneNumberMsisdn") REFERENCES "os"."PhoneNumber"("msisdn") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."PhoneNumberAssignment" ADD CONSTRAINT "PhoneNumberAssignment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "os"."Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."PlanToPlan" ADD CONSTRAINT "PlanToPlan_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "os"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."PlanToPlan" ADD CONSTRAINT "PlanToPlan_childId_fkey" FOREIGN KEY ("childId") REFERENCES "os"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."PromoCode" ADD CONSTRAINT "PromoCode_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "os"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."PromoCode" ADD CONSTRAINT "PromoCode_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "os"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."PromoCodeActivation" ADD CONSTRAINT "PromoCodeActivation_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "os"."PromoCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."PromoCodeActivation" ADD CONSTRAINT "PromoCodeActivation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "os"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."PromoCodeActivation" ADD CONSTRAINT "PromoCodeActivation_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "os"."Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."RewardPayout" ADD CONSTRAINT "RewardPayout_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "os"."Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."RewardPayout" ADD CONSTRAINT "RewardPayout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "os"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."RewardPayout" ADD CONSTRAINT "RewardPayout_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "os"."Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."SimAssignment" ADD CONSTRAINT "SimAssignment_simIccid_fkey" FOREIGN KEY ("simIccid") REFERENCES "os"."Sim"("iccid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."SimAssignment" ADD CONSTRAINT "SimAssignment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "os"."Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "os"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."Subscription" ADD CONSTRAINT "Subscription_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "os"."Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."Subscription" ADD CONSTRAINT "Subscription_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "os"."Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."Subscription" ADD CONSTRAINT "Subscription_simIccid_fkey" FOREIGN KEY ("simIccid") REFERENCES "os"."Sim"("iccid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."Subscription" ADD CONSTRAINT "Subscription_phoneNumberMsisdn_fkey" FOREIGN KEY ("phoneNumberMsisdn") REFERENCES "os"."PhoneNumber"("msisdn") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."Subscription" ADD CONSTRAINT "Subscription_currentPeriodId_fkey" FOREIGN KEY ("currentPeriodId") REFERENCES "os"."SubscriptionPeriod"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."SubscriptionPeriod" ADD CONSTRAINT "SubscriptionPeriod_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "os"."Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."SubscriptionPeriod" ADD CONSTRAINT "SubscriptionPeriod_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "os"."Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."SubscriptionHistory" ADD CONSTRAINT "SubscriptionHistory_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "os"."Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."SubscriptionHistory" ADD CONSTRAINT "SubscriptionHistory_simIccid_fkey" FOREIGN KEY ("simIccid") REFERENCES "os"."Sim"("iccid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."SubscriptionHistory" ADD CONSTRAINT "SubscriptionHistory_phoneNumberMsisdn_fkey" FOREIGN KEY ("phoneNumberMsisdn") REFERENCES "os"."PhoneNumber"("msisdn") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."SubscriptionUsage" ADD CONSTRAINT "SubscriptionUsage_historyId_fkey" FOREIGN KEY ("historyId") REFERENCES "os"."SubscriptionHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."OrderTaxData" ADD CONSTRAINT "OrderTaxData_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "os"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."PlanTaxData" ADD CONSTRAINT "PlanTaxData_planId_fkey" FOREIGN KEY ("planId") REFERENCES "os"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."PlanTelcoData" ADD CONSTRAINT "PlanTelcoData_planId_fkey" FOREIGN KEY ("planId") REFERENCES "os"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."SimTelcoData" ADD CONSTRAINT "SimTelcoData_simIccid_fkey" FOREIGN KEY ("simIccid") REFERENCES "os"."Sim"("iccid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."PhoneNumberTelcoData" ADD CONSTRAINT "PhoneNumberTelcoData_phoneNumberMsisdn_fkey" FOREIGN KEY ("phoneNumberMsisdn") REFERENCES "os"."PhoneNumber"("msisdn") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."SubscriptionTelcoData" ADD CONSTRAINT "SubscriptionTelcoData_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "os"."Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."SubscriptionHistoryTelcoData" ADD CONSTRAINT "SubscriptionHistoryTelcoData_subscriptionHistoryId_fkey" FOREIGN KEY ("subscriptionHistoryId") REFERENCES "os"."SubscriptionHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."User" ADD CONSTRAINT "User_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "os"."UserGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "os"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."Volume" ADD CONSTRAINT "Volume_planId_fkey" FOREIGN KEY ("planId") REFERENCES "os"."Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "os"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."UserWalletData" ADD CONSTRAINT "UserWalletData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "os"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."_OfferToPromoCode" ADD CONSTRAINT "_OfferToPromoCode_A_fkey" FOREIGN KEY ("A") REFERENCES "os"."Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."_OfferToPromoCode" ADD CONSTRAINT "_OfferToPromoCode_B_fkey" FOREIGN KEY ("B") REFERENCES "os"."PromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."_OfferToReward" ADD CONSTRAINT "_OfferToReward_A_fkey" FOREIGN KEY ("A") REFERENCES "os"."Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "os"."_OfferToReward" ADD CONSTRAINT "_OfferToReward_B_fkey" FOREIGN KEY ("B") REFERENCES "os"."Reward"("id") ON DELETE CASCADE ON UPDATE CASCADE;
