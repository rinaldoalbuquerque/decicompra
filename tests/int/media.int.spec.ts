import { APIError, type Payload, ValidationError } from 'payload'
import sharp from 'sharp'
import { afterAll, describe, expect, it } from 'vitest'

import { MAX_UPLOAD_BYTES } from '@/collections/media-rules'

import { getTestPayload } from './helpers/getTestPayload'

const createdIds: (number | string)[] = []

async function pngFile(width: number, height: number, name: string) {
  const data = await sharp({ create: { width, height, channels: 3, background: '#2563EB' } }).png().toBuffer()
  return { data, mimetype: 'image/png', name, size: data.length }
}

// Cria esperando erro; se a criação passar por engano, registra o documento para a limpeza
async function createExpectingError(args: Parameters<Payload['create']>[0]): Promise<unknown> {
  const payload = await getTestPayload()
  try {
    const doc = await payload.create(args)
    createdIds.push(doc.id)
    return doc
  } catch (error) {
    return error
  }
}

afterAll(async () => {
  const payload = await getTestPayload()
  for (const id of createdIds) await payload.delete({ collection: 'media', id })
})

describe('Mídia', () => {
  it('gera as versões WebP de 320, 640 e 1280 px', async () => {
    const payload = await getTestPayload()
    const doc = await payload.create({
      collection: 'media',
      data: { alt: 'Retângulo azul de teste', credit: 'Teste automatizado' },
      file: await pngFile(1600, 1000, 'teste-tamanhos.png'),
    })
    createdIds.push(doc.id)

    expect(doc.sizes?.thumb).toMatchObject({ width: 320, mimeType: 'image/webp' })
    expect(doc.sizes?.card).toMatchObject({ width: 640, mimeType: 'image/webp' })
    expect(doc.sizes?.large).toMatchObject({ width: 1280, mimeType: 'image/webp' })
  })

  it('recusa texto alternativo só com espaços', async () => {
    const error = await createExpectingError({
      collection: 'media',
      data: { alt: '   ', credit: 'Teste' },
      file: await pngFile(400, 300, 'teste-alt.png'),
    })

    expect(error).toBeInstanceOf(ValidationError)
    expect(JSON.stringify((error as ValidationError).data)).toContain('texto alternativo é obrigatório')
  })

  it('recusa arquivo acima de 4 MB', async () => {
    const size = MAX_UPLOAD_BYTES + 1
    const error = await createExpectingError({
      collection: 'media',
      data: { alt: 'Grande demais', credit: 'Teste' },
      file: { data: Buffer.alloc(size), mimetype: 'image/png', name: 'grande.png', size },
    })

    expect(error).toBeInstanceOf(APIError)
    expect((error as APIError).status).toBe(413)
  })

  it('recusa PDF', async () => {
    const data = Buffer.from('%PDF-1.4 teste')
    const error = await createExpectingError({
      collection: 'media',
      data: { alt: 'Documento', credit: 'Teste' },
      file: { data, mimetype: 'application/pdf', name: 'doc.pdf', size: data.length },
    })

    expect(error).toBeInstanceOf(APIError)
    expect((error as APIError).status).toBe(415)
  })
})
