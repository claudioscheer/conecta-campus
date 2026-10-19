CREATE TYPE "public"."demanda_status" AS ENUM('aberta', 'em_andamento', 'concluida', 'arquivada', 'cancelada');--> statement-breakpoint
CREATE TABLE "demanda_habilidades" (
	"demanda_id" text NOT NULL,
	"habilidade" text NOT NULL,
	CONSTRAINT "demanda_habilidades_demanda_id_habilidade_pk" PRIMARY KEY("demanda_id","habilidade")
);
--> statement-breakpoint
CREATE TABLE "demanda_links" (
	"demanda_id" text NOT NULL,
	"url" text NOT NULL,
	CONSTRAINT "demanda_links_demanda_id_url_pk" PRIMARY KEY("demanda_id","url")
);
--> statement-breakpoint
CREATE TABLE "demandas" (
	"id" text PRIMARY KEY NOT NULL,
	"responsavel_id" text NOT NULL,
	"titulo" text NOT NULL,
	"area" text NOT NULL,
	"problema" text NOT NULL,
	"resultado_esperado" text NOT NULL,
	"status" "demanda_status" DEFAULT 'aberta' NOT NULL,
	"resultado_url" text,
	"hidden_at" timestamp with time zone,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "demanda_habilidades" ADD CONSTRAINT "demanda_habilidades_demanda_id_demandas_id_fk" FOREIGN KEY ("demanda_id") REFERENCES "public"."demandas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demanda_links" ADD CONSTRAINT "demanda_links_demanda_id_demandas_id_fk" FOREIGN KEY ("demanda_id") REFERENCES "public"."demandas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demandas" ADD CONSTRAINT "demandas_responsavel_id_usuarios_id_fk" FOREIGN KEY ("responsavel_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;