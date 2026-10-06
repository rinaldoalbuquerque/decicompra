import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "indexing_enabled" boolean DEFAULT false;
  ALTER TABLE "site_settings" ADD COLUMN "search_console_verification" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "responsible_name" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "privacy_email" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "indexing_enabled";
  ALTER TABLE "site_settings" DROP COLUMN "search_console_verification";
  ALTER TABLE "site_settings" DROP COLUMN "responsible_name";
  ALTER TABLE "site_settings" DROP COLUMN "privacy_email";`)
}
