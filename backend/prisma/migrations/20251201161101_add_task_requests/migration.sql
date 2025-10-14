-- CreateTable
CREATE TABLE "TaskRequest" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "taskId" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "TaskRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskRequest_taskId_key" ON "TaskRequest"("taskId");

-- AddForeignKey
ALTER TABLE "TaskRequest" ADD CONSTRAINT "TaskRequest_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskRequest" ADD CONSTRAINT "TaskRequest_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskRequest" ADD CONSTRAINT "TaskRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
