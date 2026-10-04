import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { pt } from '@payloadcms/translations/languages/pt'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Brands } from './collections/Brands'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Products } from './collections/Products'
import { Stores } from './collections/Stores'
import { Users } from './collections/Users'
import { Variants } from './collections/Variants'
import { readEnv } from './lib/env'
import { buildMediaURL } from './lib/media-url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const env = readEnv()

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · DeciCompra' },
  },
  collections: [Users, Media, Categories, Brands, Stores, Products, Variants],
  editor: lexicalEditor(),
  graphQL: { disable: true },
  i18n: { fallbackLanguage: 'pt', supportedLanguages: { pt } },
  secret: env.payloadSecret,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: env.databaseUrl },
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [
    s3Storage({
      // Sem R2 configurado (local/CI), as imagens vão para ./media. Na Vercel o R2 é obrigatório (readEnv).
      enabled: env.r2 !== null,
      // Mantém o mesmo esquema de banco com ou sem R2, para as migrações serem iguais em todo ambiente
      alwaysInsertFields: true,
      bucket: env.r2?.bucket ?? '',
      collections: {
        media: {
          prefix: 'media',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => buildMediaURL(env.r2?.publicUrl ?? '', prefix, filename),
        },
      },
      config: {
        endpoint: env.r2?.endpoint,
        region: 'auto',
        forcePathStyle: true,
        credentials: {
          accessKeyId: env.r2?.accessKeyId ?? '',
          secretAccessKey: env.r2?.secretAccessKey ?? '',
        },
      },
    }),
  ],
})
