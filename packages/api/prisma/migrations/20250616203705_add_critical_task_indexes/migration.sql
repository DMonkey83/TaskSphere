-- CreateIndex
CREATE INDEX "IDX_task_project_id" ON "tasks"("projectId");

-- CreateIndex
CREATE INDEX "IDX_task_project_status" ON "tasks"("projectId", "statusId");

-- CreateIndex
CREATE INDEX "IDX_task_project_assignee" ON "tasks"("projectId", "assigneeId");

-- CreateIndex
CREATE INDEX "IDX_task_project_creator" ON "tasks"("projectId", "creatorId");

-- CreateIndex
CREATE INDEX "IDX_task_project_team" ON "tasks"("projectId", "teamId");

-- CreateIndex
CREATE INDEX "IDX_task_assignee" ON "tasks"("assigneeId");

-- CreateIndex
CREATE INDEX "IDX_task_creator" ON "tasks"("creatorId");

-- CreateIndex
CREATE INDEX "IDX_task_status" ON "tasks"("statusId");

-- CreateIndex
CREATE INDEX "IDX_task_team" ON "tasks"("teamId");

-- CreateIndex
CREATE INDEX "IDX_task_parent" ON "tasks"("parentId");

-- CreateIndex
CREATE INDEX "IDX_task_type" ON "tasks"("type");

-- CreateIndex
CREATE INDEX "IDX_task_priority" ON "tasks"("priority");

-- CreateIndex
CREATE INDEX "IDX_task_created_at" ON "tasks"("createdAt");

-- CreateIndex
CREATE INDEX "IDX_task_updated_at" ON "tasks"("updatedAt");

-- CreateIndex
CREATE INDEX "IDX_task_project_timeline" ON "tasks"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "IDX_task_user_timeline" ON "tasks"("assigneeId", "createdAt");

-- CreateIndex
CREATE INDEX "IDX_task_title" ON "tasks"("title");

-- CreateIndex
CREATE INDEX "IDX_task_due_status" ON "tasks"("dueDate", "statusId");
