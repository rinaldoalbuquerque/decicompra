import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { pt } from '@payloadcms/translations/languages/pt'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { readEnv } from './lib/env'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const env = readEnv()

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · DeciCompra' },
  },
  collections: [Users, Media],
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
})
