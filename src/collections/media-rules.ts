import { APIError } from 'payload'
import type { CollectionBeforeOperationHook, TextFieldSingleValidation } from 'payload'

// A Vercel recusa requisições acima de ~4,5 MB; 4 MB deixa margem e dá mensagem clara
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

export function assertUploadSize(size: number | undefined): void {
  if (size !== undefined && size > MAX_UPLOAD_BYTES) {
    throw new APIError('A imagem tem mais de 4 MB. Reduza o tamanho antes de enviar.', 413, undefined, true)
  }
}

export function assertImageType(mimetype: string | undefined): void {
  if (mimetype !== undefined && !ALLOWED_IMAGE_TYPES.includes(mimetype)) {
    throw new APIError('Envie uma imagem JPG, PNG, WebP ou AVIF.', 415, undefined, true)
  }
}

export const rejectInvalidUpload: CollectionBeforeOperationHook = ({ args, req }) => {
  assertUploadSize(req.file?.size)
  assertImageType(req.file?.mimetype)
  return args
}

export function requiredText(message: string): TextFieldSingleValidation {
  return (value) => (typeof value === 'string' && value.trim().length > 0 ? true : message)
}

export const validateAlt = requiredText('Descreva a imagem: o texto alternativo é obrigatório.')

export const validateCredit = requiredText('Informe o crédito ou a fonte da imagem.')
