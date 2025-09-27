import {
  FastifyPluginAsyncTypebox,
  Type
} from '@fastify/type-provider-typebox'
import { Static } from '@sinclair/typebox'
import forge from 'node-forge'

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  /* ---------- Schemas ---------- */
  const PayloadSchema = Type.Any()

  const EncryptedResponseSchema = Type.Object({
    encryptedAESKey: Type.String(),
    encryptedData: Type.String(),
    iv: Type.String()
  })

  const DecryptRequestSchema = Type.Object({
    encryptedAESKey: Type.String(),
    encryptedData: Type.String(),
    iv: Type.String()
  })

  const DecryptResponseSchema = Type.Any();

  const AesEncryptResponseSchema = Type.Object({
  iv: Type.String(),
  encrypted: Type.String()
})

  /* ---------- Routes ---------- */

  // High-level encrypt
  fastify.post(
    '/encrypt',
    { schema: { body: PayloadSchema, response: { 200: EncryptedResponseSchema } } },
    async (request) => {
      const body = request.body as Static<typeof PayloadSchema>
      return fastify.secure.encrypt(body)
    }
  )

  // High-level decrypt
  fastify.post(
    '/decrypt',
    { schema: { body: DecryptRequestSchema, response: { 200: DecryptResponseSchema } } },
    async (request) => {
      const body = request.body as Static<typeof DecryptRequestSchema>
      return { decrypted: fastify.secure.decrypt(body.encryptedAESKey, body.encryptedData, body.iv) }
    }
  )

  // AES encrypt
fastify.post(
  '/aes-encrypt',
  {
    schema: { body: PayloadSchema, response: { 200: AesEncryptResponseSchema } }
  },
  async (request) => {
    const body = request.body as Static<typeof PayloadSchema>
    // Generate AES key per request
    const key = forge.random.getBytesSync(16)
    const plaintext = typeof body.data === 'string' ? body.data : JSON.stringify(body.data)
    return fastify.secure.aesEncrypt(plaintext, key)
  }
)

  // AES decrypt
  fastify.post(
    '/aes-decrypt',
    { schema: { body: DecryptRequestSchema, response: { 200: DecryptResponseSchema } } },
    async (request) => {
      const body = request.body as Static<typeof DecryptRequestSchema>
      return { decrypted: fastify.secure.aesDecrypt(body.encryptedData, fastify.secure.rsaDecrypt(body.encryptedAESKey), body.iv) }
    }
  )

  // RSA encrypt
  fastify.post(
    '/rsa-encrypt',
    { schema: { body: PayloadSchema, response: { 200: Type.Object({ encrypted: Type.String() }) } } },
    async (request) => {
      const body = request.body as Static<typeof PayloadSchema>
      const plaintext = typeof body.data === 'string' ? body.data : JSON.stringify(body.data)
      return { encrypted: fastify.secure.rsaEncrypt(plaintext) }
    }
  )

  // RSA decrypt
  fastify.post(
    '/rsa-decrypt',
    { schema: { body: Type.Object({ encrypted: Type.String() }), response: { 200: Type.Object({ decrypted: Type.Unknown() }) } } },
    async (request) => {
      const body = request.body as { encrypted: string }
      const decryptedStr = fastify.secure.rsaDecrypt(body.encrypted)
      try {
        return { decrypted: JSON.parse(decryptedStr) }
      } catch {
        return { decrypted: decryptedStr }
      }
    }
  )
}

export default plugin
