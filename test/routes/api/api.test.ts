import { test } from 'node:test'
import assert from 'node:assert'
import { build } from '../../helper.js'

test('GET /', async (t) => {
  const app = await build(t)
  const res = await app.inject({
    url: '/'
  })

  assert.deepStrictEqual(JSON.parse(res.payload), {
    message: 'Welcome to the official fastify demo!'
  })
})

test('GET /api with no login', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    url: '/api'
  })

  assert.deepStrictEqual(JSON.parse(res.payload), {
    error: 'Unauthorized',
    message: 'You must be authenticated to access this route.',
    statusCode: 401
  })
})
