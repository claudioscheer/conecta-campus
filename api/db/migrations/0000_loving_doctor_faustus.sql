CREATE TYPE "public"."papel" AS ENUM('aluno', 'professor', 'moderador');--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" text PRIMARY KEY NOT NULL,
	"google_sub" text NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"papel" "papel" DEFAULT 'aluno' NOT NULL,
	"curso" text,
	"semestre" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_google_sub_unique" UNIQUE("google_sub"),
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
