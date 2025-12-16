import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'
import { Static } from '@sinclair/typebox'
import forge from 'node-forge'

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  /* ---------- Schemas ---------- */
  const AnySchema = Type.Union([Type.String(), Type.Object({})])

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

  const AesEncryptResponseSchema = Type.Object({
    iv: Type.String(),
    encrypted: Type.String()
  })

  /* ---------- Routes ---------- */

  // High-level encrypt
  fastify.post(
    '/encrypt',
    { schema: { body: AnySchema, response: { 200: EncryptedResponseSchema } } },
    async (request) => {
      const body = request.body as Static<typeof AnySchema>
      return fastify.secure.encrypt(body)
    }
  )

  // High-level decrypt
  fastify.post(
    '/decrypt',
    { schema: { body: DecryptRequestSchema, response: { 200: AnySchema } } },
    async (request) => {
      const body = request.body as Static<typeof DecryptRequestSchema>
      return fastify.secure.decrypt(
        body.encryptedAESKey,
        body.encryptedData,
        body.iv
      )
    }
  )

  // AES encrypt
  fastify.post(
    '/aes-encrypt',
    {
      schema: { body: AnySchema, response: { 200: AesEncryptResponseSchema } }
    },
    async (request) => {
      const body = request.body as Static<typeof AnySchema>
      // Generate AES key per request
      const key = forge.random.getBytesSync(16)
      const plaintext =
        typeof body.data === 'string' ? body.data : JSON.stringify(body.data)
      return fastify.secure.aesEncrypt(plaintext, key)
    }
  )

  // AES decrypt
  fastify.post(
    '/aes-decrypt',
    { schema: { body: DecryptRequestSchema, response: { 200: AnySchema } } },
    async (request) => {
      const body = request.body as Static<typeof DecryptRequestSchema>
      return fastify.secure.aesDecrypt(
        body.encryptedData,
        fastify.secure.rsaDecrypt(body.encryptedAESKey),
        body.iv
      )
    }
  )

  // RSA encrypt
  fastify.post(
    '/rsa-encrypt',
    {
      schema: {
        body: AnySchema,
        response: { 200: Type.Object({ encrypted: Type.String() }) }
      }
    },
    async (request) => {
      const body = request.body as Static<typeof AnySchema>
      const plaintext =
        typeof body.data === 'string' ? body.data : JSON.stringify(body.data)
      return { encrypted: fastify.secure.rsaEncrypt(plaintext) }
    }
  )

  // RSA decrypt
  fastify.post(
    '/rsa-decrypt',
    {
      schema: {
        body: Type.Object({ encrypted: Type.String() }),
        response: { 200: AnySchema }
      }
    },
    async (request) => {
      const body = request.body as { encrypted: string }
      const decryptedStr = fastify.secure.rsaDecrypt(body.encrypted)
      try {
        return JSON.parse(decryptedStr)
      } catch {
        return decryptedStr
      }
    }
  )
}

export default plugin
