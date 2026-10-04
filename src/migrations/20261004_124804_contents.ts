import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('rascunho', 'ficha', 'analise');
  CREATE TYPE "public"."enum_contents_type" AS ENUM('melhores', 'comparativo', 'guia', 'entenda');
  CREATE TYPE "public"."enum_contents_status" AS ENUM('rascunho', 'em_revisao', 'publicado', 'agendado');
  CREATE TYPE "public"."enum__contents_v_version_type" AS ENUM('melhores', 'comparativo', 'guia', 'entenda');
  CREATE TYPE "public"."enum__contents_v_version_status" AS ENUM('rascunho', 'em_revisao', 'publicado', 'agendado');
  CREATE TABLE "_products_v_version_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_scores" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"label" varchar,
  	"score" numeric,
  	"justification" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_pros" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_cons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_slug" varchar,
  	"version_status" "enum__products_v_version_status" DEFAULT 'rascunho' NOT NULL,
  	"version_final_score" numeric,
  	"version_has_active_offer" boolean DEFAULT false,
  	"version_published_at" timestamp(3) with time zone,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_brand_id" integer NOT NULL,
  	"version_subcategory_id" integer NOT NULL,
  	"version_verdict" varchar,
  	"version_recommended_for" varchar,
  	"version_avoid_if" varchar,
  	"version_full_review" jsonb,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "contents_picks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"variant_id" integer,
  	"profile_label" varchar NOT NULL,
  	"position" numeric,
  	"why" varchar
  );
  
  CREATE TABLE "contents_also_considered" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"reason" varchar
  );
  
  CREATE TABLE "contents_badges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "contents_choose_if" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "contents_spec_overrides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"attribute_key" varchar NOT NULL,
  	"winner_id" integer,
  	"no_winner" boolean DEFAULT false,
  	"justification" varchar NOT NULL
  );
  
  CREATE TABLE "contents_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "contents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"type" "enum_contents_type" DEFAULT 'guia' NOT NULL,
  	"status" "enum_contents_status" DEFAULT 'rascunho' NOT NULL,
  	"publish_at" timestamp(3) with time zone,
  	"reviewed_at" timestamp(3) with time zone,
  	"author_id" integer,
  	"sponsored" boolean DEFAULT false,
  	"product_set_key" varchar,
  	"primary_subcategory_id" integer,
  	"summary" varchar,
  	"body" jsonb,
  	"models_analyzed" numeric,
  	"conclusion" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "_contents_v_version_picks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"variant_id" integer,
  	"profile_label" varchar NOT NULL,
  	"position" numeric,
  	"why" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contents_v_version_also_considered" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"reason" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contents_v_version_badges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"label" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contents_v_version_choose_if" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"text" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contents_v_version_spec_overrides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"attribute_key" varchar NOT NULL,
  	"winner_id" integer,
  	"no_winner" boolean DEFAULT false,
  	"justification" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contents_v_version_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contents_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_slug" varchar,
  	"version_type" "enum__contents_v_version_type" DEFAULT 'guia' NOT NULL,
  	"version_status" "enum__contents_v_version_status" DEFAULT 'rascunho' NOT NULL,
  	"version_publish_at" timestamp(3) with time zone,
  	"version_reviewed_at" timestamp(3) with time zone,
  	"version_author_id" integer,
  	"version_sponsored" boolean DEFAULT false,
  	"version_product_set_key" varchar,
  	"version_primary_subcategory_id" integer,
  	"version_summary" varchar,
  	"version_body" jsonb,
  	"version_models_analyzed" numeric,
  	"version_conclusion" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_contents_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"categories_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "contents_id" integer;
  ALTER TABLE "_products_v_version_specs" ADD CONSTRAINT "_products_v_version_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_scores" ADD CONSTRAINT "_products_v_version_scores_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_pros" ADD CONSTRAINT "_products_v_version_pros_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_cons" ADD CONSTRAINT "_products_v_version_cons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_sources" ADD CONSTRAINT "_products_v_version_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_faq" ADD CONSTRAINT "_products_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_brand_id_brands_id_fk" FOREIGN KEY ("version_brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_subcategory_id_categories_id_fk" FOREIGN KEY ("version_subcategory_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contents_picks" ADD CONSTRAINT "contents_picks_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contents_picks" ADD CONSTRAINT "contents_picks_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contents_picks" ADD CONSTRAINT "contents_picks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contents_also_considered" ADD CONSTRAINT "contents_also_considered_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contents_also_considered" ADD CONSTRAINT "contents_also_considered_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contents_badges" ADD CONSTRAINT "contents_badges_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contents_badges" ADD CONSTRAINT "contents_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contents_choose_if" ADD CONSTRAINT "contents_choose_if_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contents_choose_if" ADD CONSTRAINT "contents_choose_if_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contents_spec_overrides" ADD CONSTRAINT "contents_spec_overrides_winner_id_products_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contents_spec_overrides" ADD CONSTRAINT "contents_spec_overrides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contents_sources" ADD CONSTRAINT "contents_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contents" ADD CONSTRAINT "contents_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contents" ADD CONSTRAINT "contents_primary_subcategory_id_categories_id_fk" FOREIGN KEY ("primary_subcategory_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contents" ADD CONSTRAINT "contents_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contents_rels" ADD CONSTRAINT "contents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contents_rels" ADD CONSTRAINT "contents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contents_rels" ADD CONSTRAINT "contents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contents_v_version_picks" ADD CONSTRAINT "_contents_v_version_picks_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contents_v_version_picks" ADD CONSTRAINT "_contents_v_version_picks_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contents_v_version_picks" ADD CONSTRAINT "_contents_v_version_picks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contents_v_version_also_considered" ADD CONSTRAINT "_contents_v_version_also_considered_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contents_v_version_also_considered" ADD CONSTRAINT "_contents_v_version_also_considered_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contents_v_version_badges" ADD CONSTRAINT "_contents_v_version_badges_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contents_v_version_badges" ADD CONSTRAINT "_contents_v_version_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contents_v_version_choose_if" ADD CONSTRAINT "_contents_v_version_choose_if_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contents_v_version_choose_if" ADD CONSTRAINT "_contents_v_version_choose_if_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contents_v_version_spec_overrides" ADD CONSTRAINT "_contents_v_version_spec_overrides_winner_id_products_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contents_v_version_spec_overrides" ADD CONSTRAINT "_contents_v_version_spec_overrides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contents_v_version_sources" ADD CONSTRAINT "_contents_v_version_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contents_v" ADD CONSTRAINT "_contents_v_parent_id_contents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."contents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contents_v" ADD CONSTRAINT "_contents_v_version_author_id_authors_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contents_v" ADD CONSTRAINT "_contents_v_version_primary_subcategory_id_categories_id_fk" FOREIGN KEY ("version_primary_subcategory_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contents_v" ADD CONSTRAINT "_contents_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contents_v_rels" ADD CONSTRAINT "_contents_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_contents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contents_v_rels" ADD CONSTRAINT "_contents_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contents_v_rels" ADD CONSTRAINT "_contents_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_products_v_version_specs_order_idx" ON "_products_v_version_specs" USING btree ("_order");
  CREATE INDEX "_products_v_version_specs_parent_id_idx" ON "_products_v_version_specs" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_scores_order_idx" ON "_products_v_version_scores" USING btree ("_order");
  CREATE INDEX "_products_v_version_scores_parent_id_idx" ON "_products_v_version_scores" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_pros_order_idx" ON "_products_v_version_pros" USING btree ("_order");
  CREATE INDEX "_products_v_version_pros_parent_id_idx" ON "_products_v_version_pros" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_cons_order_idx" ON "_products_v_version_cons" USING btree ("_order");
  CREATE INDEX "_products_v_version_cons_parent_id_idx" ON "_products_v_version_cons" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_sources_order_idx" ON "_products_v_version_sources" USING btree ("_order");
  CREATE INDEX "_products_v_version_sources_parent_id_idx" ON "_products_v_version_sources" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_faq_order_idx" ON "_products_v_version_faq" USING btree ("_order");
  CREATE INDEX "_products_v_version_faq_parent_id_idx" ON "_products_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_brand_idx" ON "_products_v" USING btree ("version_brand_id");
  CREATE INDEX "_products_v_version_version_subcategory_idx" ON "_products_v" USING btree ("version_subcategory_id");
  CREATE INDEX "_products_v_version_seo_version_seo_og_image_idx" ON "_products_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_media_id_idx" ON "_products_v_rels" USING btree ("media_id");
  CREATE INDEX "contents_picks_order_idx" ON "contents_picks" USING btree ("_order");
  CREATE INDEX "contents_picks_parent_id_idx" ON "contents_picks" USING btree ("_parent_id");
  CREATE INDEX "contents_picks_product_idx" ON "contents_picks" USING btree ("product_id");
  CREATE INDEX "contents_picks_variant_idx" ON "contents_picks" USING btree ("variant_id");
  CREATE INDEX "contents_also_considered_order_idx" ON "contents_also_considered" USING btree ("_order");
  CREATE INDEX "contents_also_considered_parent_id_idx" ON "contents_also_considered" USING btree ("_parent_id");
  CREATE INDEX "contents_also_considered_product_idx" ON "contents_also_considered" USING btree ("product_id");
  CREATE INDEX "contents_badges_order_idx" ON "contents_badges" USING btree ("_order");
  CREATE INDEX "contents_badges_parent_id_idx" ON "contents_badges" USING btree ("_parent_id");
  CREATE INDEX "contents_badges_product_idx" ON "contents_badges" USING btree ("product_id");
  CREATE INDEX "contents_choose_if_order_idx" ON "contents_choose_if" USING btree ("_order");
  CREATE INDEX "contents_choose_if_parent_id_idx" ON "contents_choose_if" USING btree ("_parent_id");
  CREATE INDEX "contents_choose_if_product_idx" ON "contents_choose_if" USING btree ("product_id");
  CREATE INDEX "contents_spec_overrides_order_idx" ON "contents_spec_overrides" USING btree ("_order");
  CREATE INDEX "contents_spec_overrides_parent_id_idx" ON "contents_spec_overrides" USING btree ("_parent_id");
  CREATE INDEX "contents_spec_overrides_winner_idx" ON "contents_spec_overrides" USING btree ("winner_id");
  CREATE INDEX "contents_sources_order_idx" ON "contents_sources" USING btree ("_order");
  CREATE INDEX "contents_sources_parent_id_idx" ON "contents_sources" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "contents_slug_idx" ON "contents" USING btree ("slug");
  CREATE INDEX "contents_author_idx" ON "contents" USING btree ("author_id");
  CREATE UNIQUE INDEX "contents_product_set_key_idx" ON "contents" USING btree ("product_set_key");
  CREATE INDEX "contents_primary_subcategory_idx" ON "contents" USING btree ("primary_subcategory_id");
  CREATE INDEX "contents_seo_seo_og_image_idx" ON "contents" USING btree ("seo_og_image_id");
  CREATE INDEX "contents_updated_at_idx" ON "contents" USING btree ("updated_at");
  CREATE INDEX "contents_created_at_idx" ON "contents" USING btree ("created_at");
  CREATE INDEX "contents_rels_order_idx" ON "contents_rels" USING btree ("order");
  CREATE INDEX "contents_rels_parent_idx" ON "contents_rels" USING btree ("parent_id");
  CREATE INDEX "contents_rels_path_idx" ON "contents_rels" USING btree ("path");
  CREATE INDEX "contents_rels_products_id_idx" ON "contents_rels" USING btree ("products_id");
  CREATE INDEX "contents_rels_categories_id_idx" ON "contents_rels" USING btree ("categories_id");
  CREATE INDEX "_contents_v_version_picks_order_idx" ON "_contents_v_version_picks" USING btree ("_order");
  CREATE INDEX "_contents_v_version_picks_parent_id_idx" ON "_contents_v_version_picks" USING btree ("_parent_id");
  CREATE INDEX "_contents_v_version_picks_product_idx" ON "_contents_v_version_picks" USING btree ("product_id");
  CREATE INDEX "_contents_v_version_picks_variant_idx" ON "_contents_v_version_picks" USING btree ("variant_id");
  CREATE INDEX "_contents_v_version_also_considered_order_idx" ON "_contents_v_version_also_considered" USING btree ("_order");
  CREATE INDEX "_contents_v_version_also_considered_parent_id_idx" ON "_contents_v_version_also_considered" USING btree ("_parent_id");
  CREATE INDEX "_contents_v_version_also_considered_product_idx" ON "_contents_v_version_also_considered" USING btree ("product_id");
  CREATE INDEX "_contents_v_version_badges_order_idx" ON "_contents_v_version_badges" USING btree ("_order");
  CREATE INDEX "_contents_v_version_badges_parent_id_idx" ON "_contents_v_version_badges" USING btree ("_parent_id");
  CREATE INDEX "_contents_v_version_badges_product_idx" ON "_contents_v_version_badges" USING btree ("product_id");
  CREATE INDEX "_contents_v_version_choose_if_order_idx" ON "_contents_v_version_choose_if" USING btree ("_order");
  CREATE INDEX "_contents_v_version_choose_if_parent_id_idx" ON "_contents_v_version_choose_if" USING btree ("_parent_id");
  CREATE INDEX "_contents_v_version_choose_if_product_idx" ON "_contents_v_version_choose_if" USING btree ("product_id");
  CREATE INDEX "_contents_v_version_spec_overrides_order_idx" ON "_contents_v_version_spec_overrides" USING btree ("_order");
  CREATE INDEX "_contents_v_version_spec_overrides_parent_id_idx" ON "_contents_v_version_spec_overrides" USING btree ("_parent_id");
  CREATE INDEX "_contents_v_version_spec_overrides_winner_idx" ON "_contents_v_version_spec_overrides" USING btree ("winner_id");
  CREATE INDEX "_contents_v_version_sources_order_idx" ON "_contents_v_version_sources" USING btree ("_order");
  CREATE INDEX "_contents_v_version_sources_parent_id_idx" ON "_contents_v_version_sources" USING btree ("_parent_id");
  CREATE INDEX "_contents_v_parent_idx" ON "_contents_v" USING btree ("parent_id");
  CREATE INDEX "_contents_v_version_version_slug_idx" ON "_contents_v" USING btree ("version_slug");
  CREATE INDEX "_contents_v_version_version_author_idx" ON "_contents_v" USING btree ("version_author_id");
  CREATE INDEX "_contents_v_version_version_product_set_key_idx" ON "_contents_v" USING btree ("version_product_set_key");
  CREATE INDEX "_contents_v_version_version_primary_subcategory_idx" ON "_contents_v" USING btree ("version_primary_subcategory_id");
  CREATE INDEX "_contents_v_version_seo_version_seo_og_image_idx" ON "_contents_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_contents_v_version_version_updated_at_idx" ON "_contents_v" USING btree ("version_updated_at");
  CREATE INDEX "_contents_v_version_version_created_at_idx" ON "_contents_v" USING btree ("version_created_at");
  CREATE INDEX "_contents_v_created_at_idx" ON "_contents_v" USING btree ("created_at");
  CREATE INDEX "_contents_v_updated_at_idx" ON "_contents_v" USING btree ("updated_at");
  CREATE INDEX "_contents_v_rels_order_idx" ON "_contents_v_rels" USING btree ("order");
  CREATE INDEX "_contents_v_rels_parent_idx" ON "_contents_v_rels" USING btree ("parent_id");
  CREATE INDEX "_contents_v_rels_path_idx" ON "_contents_v_rels" USING btree ("path");
  CREATE INDEX "_contents_v_rels_products_id_idx" ON "_contents_v_rels" USING btree ("products_id");
  CREATE INDEX "_contents_v_rels_categories_id_idx" ON "_contents_v_rels" USING btree ("categories_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contents_fk" FOREIGN KEY ("contents_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_contents_id_idx" ON "payload_locked_documents_rels" USING btree ("contents_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_products_v_version_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_scores" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_pros" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_cons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contents_picks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contents_also_considered" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contents_badges" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contents_choose_if" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contents_spec_overrides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contents_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contents_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contents_v_version_picks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contents_v_version_also_considered" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contents_v_version_badges" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contents_v_version_choose_if" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contents_v_version_spec_overrides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contents_v_version_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contents_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contents_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_products_v_version_specs" CASCADE;
  DROP TABLE "_products_v_version_scores" CASCADE;
  DROP TABLE "_products_v_version_pros" CASCADE;
  DROP TABLE "_products_v_version_cons" CASCADE;
  DROP TABLE "_products_v_version_sources" CASCADE;
  DROP TABLE "_products_v_version_faq" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "contents_picks" CASCADE;
  DROP TABLE "contents_also_considered" CASCADE;
  DROP TABLE "contents_badges" CASCADE;
  DROP TABLE "contents_choose_if" CASCADE;
  DROP TABLE "contents_spec_overrides" CASCADE;
  DROP TABLE "contents_sources" CASCADE;
  DROP TABLE "contents" CASCADE;
  DROP TABLE "contents_rels" CASCADE;
  DROP TABLE "_contents_v_version_picks" CASCADE;
  DROP TABLE "_contents_v_version_also_considered" CASCADE;
  DROP TABLE "_contents_v_version_badges" CASCADE;
  DROP TABLE "_contents_v_version_choose_if" CASCADE;
  DROP TABLE "_contents_v_version_spec_overrides" CASCADE;
  DROP TABLE "_contents_v_version_sources" CASCADE;
  DROP TABLE "_contents_v" CASCADE;
  DROP TABLE "_contents_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_contents_fk";
  
  DROP INDEX "payload_locked_documents_rels_contents_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "contents_id";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum_contents_type";
  DROP TYPE "public"."enum_contents_status";
  DROP TYPE "public"."enum__contents_v_version_type";
  DROP TYPE "public"."enum__contents_v_version_status";`)
}
