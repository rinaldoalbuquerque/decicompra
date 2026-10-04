import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_offers_status" AS ENUM('active', 'unavailable');
  CREATE TABLE "offers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"variant_id" integer NOT NULL,
  	"store_id" integer NOT NULL,
  	"url" varchar NOT NULL,
  	"affiliate_url" varchar NOT NULL,
  	"price_min" numeric NOT NULL,
  	"price_max" numeric NOT NULL,
  	"verified_at" timestamp(3) with time zone NOT NULL,
  	"status" "enum_offers_status" DEFAULT 'active' NOT NULL,
  	"notes" varchar,
  	"title" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "offers_id" integer;
  ALTER TABLE "offers" ADD CONSTRAINT "offers_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offers" ADD CONSTRAINT "offers_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offers" ADD CONSTRAINT "offers_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "offers_product_idx" ON "offers" USING btree ("product_id");
  CREATE INDEX "offers_variant_idx" ON "offers" USING btree ("variant_id");
  CREATE INDEX "offers_store_idx" ON "offers" USING btree ("store_id");
  CREATE INDEX "offers_updated_at_idx" ON "offers" USING btree ("updated_at");
  CREATE INDEX "offers_created_at_idx" ON "offers" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_offers_fk" FOREIGN KEY ("offers_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_offers_id_idx" ON "payload_locked_documents_rels" USING btree ("offers_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "offers" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "offers" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_offers_fk";
  
  DROP INDEX "payload_locked_documents_rels_offers_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "offers_id";
  DROP TYPE "public"."enum_offers_status";`)
}
