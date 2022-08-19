import nacl from 'tweetnacl'
import { randomBytes } from 'crypto'

/**
 * Seals a string
 * @public
 * @param str - Text to seal
 * @param publicKey - NaCl public key of the recipient
 * @returns The sealed text, which can be embedded in a message
 */
export function seal(str: string, publicKey: string) {
  const nonce = Uint8Array.from(randomBytes(nacl.secretbox.nonceLength))
  const keys = nacl.box.keyPair()
  const theirPublicKey = Uint8Array.from(Buffer.from(publicKey, 'base64'))
  const message = Uint8Array.from(Buffer.from(str))
  const output = nacl.box(message, nonce, theirPublicKey, keys.secretKey)
  return (
    '(' +
    [
      'SEALD',
      Buffer.from(theirPublicKey).toString('base64'),
      Buffer.from(keys.publicKey).toString('base64'),
      Buffer.from(nonce).toString('base64'),
      Buffer.from(output).toString('base64'),
    ].join(';') +
    ')'
  )
}

/**
 * Unseals a string that contains a sealed string
 * @public
 * @param str - The text which contains sealed parts
 * @param keys - A mapping from public key to secret key
 * @returns The text with sealed parts replaced with the original text
 */
export function unseal(str: string, keys: Record<string, string>) {
  return str.replace(
    /\(SEALD;([^;)\s]+);([^;)\s]+);([^;)\s]+);([^;)\s]+)\)/g,
    (a, kid, pk, nonceEnc, ciphertext) => {
      if (!keys[kid]) return a
      const ourSecretKey = Uint8Array.from(Buffer.from(keys[kid], 'base64'))
      const theirPublicKey = Uint8Array.from(Buffer.from(pk, 'base64'))
      const nonce = Uint8Array.from(Buffer.from(nonceEnc, 'base64'))
      const message = Uint8Array.from(Buffer.from(ciphertext, 'base64'))
      return Buffer.from(
        nacl.box.open(
          message,
          nonce,
          theirPublicKey,
          ourSecretKey,
        ) as Uint8Array,
      ).toString()
    },
  )
}
