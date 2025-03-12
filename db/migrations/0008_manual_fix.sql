-- Add isShared column to chat_sessions table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'chat_sessions' 
        AND column_name = 'is_shared'
    ) THEN
        ALTER TABLE "chat_sessions" ADD COLUMN "is_shared" boolean DEFAULT false;
    END IF;
END $$; 