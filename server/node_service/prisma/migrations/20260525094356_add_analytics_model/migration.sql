-- CreateTable
CREATE TABLE "Analytics" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "referenceId" INTEGER NOT NULL,
    "amount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);
