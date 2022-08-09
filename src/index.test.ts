import { seal, unseal } from './index'

const pk = 'ndCw/CmbvWFob/kVl97XZyWzsGziPuP1MgXLE41Pc08='
const sk = 'YJfVV55PXan29XsKxwovp+f90LslTWKEmvSJYOy5zeo='
const keys = { [pk]: sk }

const sealRegExp = `\\(SEALD;[^;)]+;[^;)]+;[^;)]+;[^;)]+\\)`
const checkRegExp = new RegExp(`^${sealRegExp}, ${sealRegExp}!$`)

it('works', () => {
  const data = `${seal('Hello', pk)}, ${seal('world', pk)}!`
  console.log('sealed result:', data)
  expect(data).toMatch(checkRegExp)

  const unsealed = unseal(data, keys)
  console.log('unsealed result:', unsealed)
  expect(unsealed).toEqual('Hello, world!')
})
