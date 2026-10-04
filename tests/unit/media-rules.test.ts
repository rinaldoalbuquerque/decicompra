import { APIError } from 'payload'
import { describe, expect, it } from 'vitest'

import { assertImageType, assertUploadSize, MAX_UPLOAD_BYTES, validateAlt } from '@/collections/media-rules'

describe('assertUploadSize', () => {
  it('aceita arquivo no limite', () => {
    expect(() => assertUploadSize(MAX_UPLOAD_BYTES)).not.toThrow()
  })

  it('aceita operação sem arquivo', () => {
    expect(() => assertUploadSize(undefined)).not.toThrow()
  })

  it('recusa acima de 4 MB com status 413 e mensagem em português', () => {
    try {
      assertUploadSize(MAX_UPLOAD_BYTES + 1)
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(APIError)
      expect((error as APIError).status).toBe(413)
      expect((error as APIError).message).toContain('4 MB')
    }
  })
})

describe('assertImageType', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])('aceita %s', (type) => {
    expect(() => assertImageType(type)).not.toThrow()
  })

  it('aceita operação sem arquivo', () => {
    expect(() => assertImageType(undefined)).not.toThrow()
  })

  it.each(['application/pdf', 'image/svg+xml', 'application/x-msdownload'])('recusa %s com status 415', (type) => {
    try {
      assertImageType(type)
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(APIError)
      expect((error as APIError).status).toBe(415)
      expect((error as APIError).message).toContain('JPG, PNG, WebP ou AVIF')
    }
  })
})

describe('validateAlt', () => {
  const call = (value: string | null | undefined) =>
    (validateAlt as (v: typeof value) => true | string)(value)

  it('aceita texto descritivo', () => {
    expect(call('Smart TV LG C4 de 55 polegadas')).toBe(true)
  })

  it.each([undefined, null, '', '   '])('recusa %j', (value) => {
    expect(call(value)).toBe('Descreva a imagem: o texto alternativo é obrigatório.')
  })
})

describe('coleção Mídia', () => {
  it('avisa no painel o limite de 4 MB e os formatos aceitos', async () => {
    const { Media } = await import('@/collections/Media')
    const description = String(Media.admin?.description ?? '')
    expect(description).toContain('4 MB')
    expect(description).toContain('JPG, PNG, WebP ou AVIF')
  })
})
