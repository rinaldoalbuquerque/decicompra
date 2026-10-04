import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contents_picks" ALTER COLUMN "product_id" DROP NOT NULL;
  ALTER TABLE "contents_also_considered" ALTER COLUMN "product_id" DROP NOT NULL;
  ALTER TABLE "contents_badges" ALTER COLUMN "product_id" DROP NOT NULL;
  ALTER TABLE "contents_choose_if" ALTER COLUMN "product_id" DROP NOT NULL;
  ALTER TABLE "_contents_v_version_picks" ALTER COLUMN "product_id" DROP NOT NULL;
  ALTER TABLE "_contents_v_version_also_considered" ALTER COLUMN "product_id" DROP NOT NULL;
  ALTER TABLE "_contents_v_version_badges" ALTER COLUMN "product_id" DROP NOT NULL;
  ALTER TABLE "_contents_v_version_choose_if" ALTER COLUMN "product_id" DROP NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contents_picks" ALTER COLUMN "product_id" SET NOT NULL;
  ALTER TABLE "contents_also_considered" ALTER COLUMN "product_id" SET NOT NULL;
  ALTER TABLE "contents_badges" ALTER COLUMN "product_id" SET NOT NULL;
  ALTER TABLE "contents_choose_if" ALTER COLUMN "product_id" SET NOT NULL;
  ALTER TABLE "_contents_v_version_picks" ALTER COLUMN "product_id" SET NOT NULL;
  ALTER TABLE "_contents_v_version_also_considered" ALTER COLUMN "product_id" SET NOT NULL;
  ALTER TABLE "_contents_v_version_badges" ALTER COLUMN "product_id" SET NOT NULL;
  ALTER TABLE "_contents_v_version_choose_if" ALTER COLUMN "product_id" SET NOT NULL;`)
}
