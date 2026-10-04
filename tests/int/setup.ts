// Testes de integração usam SEMPRE o banco de teste e NUNCA o R2
if (!process.env.TEST_DATABASE_URL) {
  throw new Error(
    'Defina TEST_DATABASE_URL no .env (branch "test" do Neon) para rodar os testes de integração.',
  )
}
if (process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL não pode ser igual a DATABASE_URL: os testes apagam dados.')
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
for (const key of ['R2_BUCKET', 'R2_ENDPOINT', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_PUBLIC_URL']) {
  delete process.env[key]
}
