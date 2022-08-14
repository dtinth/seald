# seald

Encrypt part of your text file, powered by [TweetNaCl.js](https://tweetnacl.js.org/).

## Example usage

I have a `.env.staging` file.

```
AWS_ACCESS_KEY_ID=AKIAYVP4CIPPALMU4BWD
AWS_SECRET_ACCESS_KEY=n2ErjptdPdQAnHNI9F50zyGAsE6NAj+w4SpzTJ7x
```

I want to encrypt the value of `AWS_SECRET_ACCESS_KEY` with these desired qualities:

- I don’t want to encrypt the whole file. I want to see the overall structure.
- I want to use asymmetric encryption, so others can add secrets to this file without knowing the secret key.

I went to <https://tweetnacl.js.org/#/box> and generated a secret key along with a public key:

- Secret key: `NIx+f8paZzMcofxgzlNsnApvGhuVzLTloHfFL8MwiPs=`
- Public key: `r8+GVn7boCsLU9MkVOO7b/mDg99MSqjuxNs9OapGp3Q=`

Then, I use the public key to encrypt the AWS secret access key:

```js
// Run this in Node.js REPL
console.log(
  require('seald').seal(
    'n2ErjptdPdQAnHNI9F50zyGAsE6NAj+w4SpzTJ7x',
    'r8+GVn7boCsLU9MkVOO7b/mDg99MSqjuxNs9OapGp3Q=',
  ),
)
// -> (SEALD;r8+GVn7boCsLU9MkVOO7b/mDg99MSqjuxNs9OapGp3Q=;WAwRB4BMmL+QcC608kIq8iLBR59hh+RDtS4N3SdEH0k=;8I1leOJ+jE3KKoRroq1CQkFEil4zL6PG;70jNalbCAmvDhIYJAZl2LgJdtCrJZJmKf0kIwRUqYw8gBS7A3J9CNqL7EfbvHlpEVWww6T8CLZY=)
```

It returns a string that I can now use in my `.env.staging.seald` file:

```
AWS_ACCESS_KEY_ID=AKIAYVP4CIPPALMU4BWD
AWS_SECRET_ACCESS_KEY=(SEALD;r8+GVn7boCsLU9MkVOO7b/mDg99MSqjuxNs9OapGp3Q=;WAwRB4BMmL+QcC608kIq8iLBR59hh+RDtS4N3SdEH0k=;8I1leOJ+jE3KKoRroq1CQkFEil4zL6PG;70jNalbCAmvDhIYJAZl2LgJdtCrJZJmKf0kIwRUqYw8gBS7A3J9CNqL7EfbvHlpEVWww6T8CLZY=)
```

On the CI, I can unseal it with this script:

```js
import fs from 'fs'
import { unseal } from 'seald'

// Usually I would load the key from your CI’s secret store or environment variable.
const keys = {
  'r8+GVn7boCsLU9MkVOO7b/mDg99MSqjuxNs9OapGp3Q=':
    'NIx+f8paZzMcofxgzlNsnApvGhuVzLTloHfFL8MwiPs=',
}

const sealed = fs.readFileSync('.env.staging.seald', 'utf8')
const unsealed = unseal(sealed, keys)
fs.writeFileSync('.env.staging', unsealed)
```

## seald data format

The sealed data has this syntax:

```
(SEALD;PublicKey;SealerPublicKey;Nonce;Payload)
```
