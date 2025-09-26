import { it, describe } from 'node:test'
import { build } from '../helper.js'
import assert from 'node:assert'
describe('Rate Limit', () => {
  it('should be rate limited', async (t) => {
    const app = await build(t)

    for (let i = 0; i < Number(process.env.RATE_LIMIT_MAX); i++) {
      const res = await app.inject({
        method: 'GET',
        url: '/'
      })

      assert.strictEqual(res.statusCode, 200)
    }

    const res = await app.inject({
      method: 'GET',
      url: '/'
    })

    assert.strictEqual(res.statusCode, 429)
  })
})
