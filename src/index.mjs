import nacl from 'tweetnacl'
import {randomBytes} from 'crypto'

export function seal(str, publicKey) {
  const nonce = randomBytes(nacl.secretbox.nonceLength)
  const keys = nacl.box.keyPair()
  const theirPublicKey = Buffer.from(publicKey, 'base64')
  const message = Buffer.from(str)
  const output = nacl.box(message, nonce, theirPublicKey, keys.secretKey)
  return '(' + [
    'SEALED',
    Buffer.from(theirPublicKey).toString('base64'),
    Buffer.from(keys.publicKey).toString('base64'),
    Buffer.from(nonce).toString('base64'),
    Buffer.from(output).toString('base64')
  ].join(';') + ')'
}

export function unseal(str, keys) {
  return str.replace(/\(SEALED;([^;)\s]+);([^;)\s]+);([^;)\s]+);([^;)\s]+)\)/g, (a, kid, pk, nonceEnc, ciphertext) => {
    if (!keys[kid]) return a
    const ourSecretKey = Buffer.from(keys[kid], 'base64')
    const theirPublicKey = Buffer.from(pk, 'base64')
    const nonce = Buffer.from(nonceEnc, 'base64')
    const message = Buffer.from(ciphertext, 'base64')
    return Buffer.from(nacl.box.open(message, nonce, theirPublicKey, ourSecretKey)).toString()
  })
}