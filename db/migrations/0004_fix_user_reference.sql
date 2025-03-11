-- First, ensure the default user exists
INSERT INTO "users" ("id", "privy_id", "wallet_address", "email", "created_at", "updated_at")
VALUES (1, 'default-user', 'default-wallet-address', 'default@example.com', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Now update any existing chat_sessions that have null user_id to reference the default user
UPDATE "chat_sessions" SET "user_id" = 1 WHERE "user_id" IS NULL; 