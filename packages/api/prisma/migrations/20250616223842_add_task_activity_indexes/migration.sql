-- CreateIndex
CREATE INDEX "IDX_task_activity_task_timeline" ON "task-activity"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "IDX_task_activity_user_timeline" ON "task-activity"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "IDX_task_activity_created_at" ON "task-activity"("createdAt");

-- CreateIndex
CREATE INDEX "IDX_task_activity_task_id" ON "task-activity"("taskId");

-- CreateIndex
CREATE INDEX "IDX_task_activity_action" ON "task-activity"("action");
