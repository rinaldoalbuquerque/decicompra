import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Busca (spec §12.3): unaccent para ignorar acentos no full-text em português
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS unaccent;`)
}

// A extensão fica: removê-la não desfaz dados e pode afetar outros usos do banco
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`SELECT 1;`)
}
