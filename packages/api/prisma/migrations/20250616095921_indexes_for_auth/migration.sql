-- CreateIndex
CREATE INDEX "IDX_refresh_tokens_token" ON "refresh-tokens"("token");

-- CreateIndex
CREATE INDEX "IDX_user_accountId_account" ON "users"("accountId");
