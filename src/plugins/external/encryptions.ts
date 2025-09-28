import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import forge from 'node-forge'

/* ----------------------- Types ----------------------- */
export interface SecurePlugin {
  publicKey: string;
  rsaEncrypt(data: string): string;
  rsaDecrypt(encrypted: string): string;
  aesEncrypt(data: string, key: string): { iv: string; encrypted: string };
  aesDecrypt(encrypted: string, key: string, iv: string): string;
  encrypt(data: string | object): { encryptedAESKey: string; encryptedData: string; iv: string };
  decrypt(encryptedAESKey: string, encryptedData: string, iv: string): string | object;
}

/* ------------------ Type Augmentation ---------------- */
declare module 'fastify' {
  interface FastifyInstance {
    secure: SecurePlugin;
  }
}

/* ------------------- Plugin ------------------------- */
export default fp(async function securePlugin (fastify: FastifyInstance) {
  // Generate RSA key pair
  // const { publicKey, privateKey } = forge.pki.rsa.generateKeyPair(2048)
  const publicKeyPem = fastify.config.DEFAULT_PUBLIC_KEY.replace(/\\n/g, '\n')
  const privateKeyPem = fastify.config.DEFAULT_PRIVATE_KEY.replace(/\\n/g, '\n')

  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem)
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem)

  // AES encryption
  function aesEncrypt (data: string, key: string) {
    const cipher = forge.cipher.createCipher('AES-CBC', key)
    const iv = forge.random.getBytesSync(16)
    cipher.start({ iv })
    cipher.update(forge.util.createBuffer(data, 'utf8'))
    cipher.finish()
    const encrypted = cipher.output.getBytes()
    return { iv: forge.util.encode64(iv), encrypted: forge.util.encode64(encrypted) }
  }

  // AES decryption
  function aesDecrypt (encrypted: string, key: string, iv: string) {
    const decipher = forge.cipher.createDecipher('AES-CBC', key)
    decipher.start({ iv: forge.util.decode64(iv) })
    decipher.update(forge.util.createBuffer(forge.util.decode64(encrypted)))
    decipher.finish()
    return forge.util.decodeUtf8(decipher.output.getBytes())
  }

  // RSA encryption
  function rsaEncrypt (data: string) {
    return forge.util.encode64(publicKey.encrypt(data))
  }

  // RSA decryption
  function rsaDecrypt (encrypted: string) {
    return privateKey.decrypt(forge.util.decode64(encrypted))
  }

  // High-level encrypt function (supports string or JSON)
  function encrypt (data: string | object) {
    const plaintext = typeof data === 'string' ? data : JSON.stringify(data)

    const aesKey = forge.random.getBytesSync(16)
    const encryptedAESKey = rsaEncrypt(aesKey)
    const { iv, encrypted } = aesEncrypt(plaintext, aesKey)

    return { encryptedAESKey, encryptedData: encrypted, iv }
  }

  // High-level decrypt function (auto-detect JSON)
  function decrypt (encryptedAESKey: string, encryptedData: string, iv: string) {
    const decryptedStr = aesDecrypt(encryptedData, rsaDecrypt(encryptedAESKey), iv)

    try {
      return JSON.parse(decryptedStr)
    } catch {
      return decryptedStr
    }
  }

  // Decorate Fastify instance
  fastify.decorate('secure', {
    publicKey: publicKeyPem,
    rsaEncrypt,
    rsaDecrypt,
    aesEncrypt,
    aesDecrypt,
    encrypt,
    decrypt
  } as SecurePlugin)
}, { dependencies: ['env'] })
