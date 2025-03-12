CREATE TABLE "tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"symbol" varchar(50) NOT NULL,
	"description" text,
	"logo_url" varchar(255),
	"price" numeric(18, 8) DEFAULT '0',
	"market_cap" numeric(24, 2) DEFAULT '0',
	"volume_24h" numeric(24, 2) DEFAULT '0',
	"change_24h" numeric(10, 2) DEFAULT '0',
	"mint_address" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD COLUMN "is_shared" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;