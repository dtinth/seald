import {seal, unseal} from './index.mjs'
import assert from 'assert'

const pk = 'ndCw/CmbvWFob/kVl97XZyWzsGziPuP1MgXLE41Pc08='
const sk = 'YJfVV55PXan29XsKxwovp+f90LslTWKEmvSJYOy5zeo='

const data = `${seal('Hello', pk)}, ${seal('world', pk)}!`
const sealRegExp = `\\(SEALED;[^;)]+;[^;)]+;[^;)]+;[^;)]+\\)`
const checkRegExp = new RegExp(`^${sealRegExp}, ${sealRegExp}!$`)

console.log('sealed result:', data)
assert.match(data, checkRegExp)

const keys = { [pk]: sk }

const unsealed = unseal(data, keys)
console.log('unsealed result:', unsealed)
assert.equal(unsealed, 'Hello, world!')
