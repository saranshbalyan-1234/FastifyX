import { FastifyInstance } from 'fastify'

export default async function (fastify: FastifyInstance) {
  fastify.addHook('onSend', function (req, reply, payload, done) {
    const obj = {
      tenant: req.headers['x-tenant-id'],
      method: req.method,
      url: req.url,
      statusCode: reply.statusCode,
      body: req.body,
      query: req.query,
      params: req.params,
      response: payload,
      time: reply.elapsedTime
    }
    req.log.debug(obj, 'Req/Res')
    done()
  })

  // fastify.addHook('onResponse', function (req, reply, done) {
  //   req.log.debug({ elapsedTime: reply.elapsedTime }, 'Res Time')
  //   done()
  // })

  // fastify.addHook('onRequest', async (request, reply) => {
  //   if (request.url.startsWith('/api/auth/login')) {
  //     return
  //   }

  //   if (!request.session.user) {
  //     reply.unauthorized('You must be authenticated to access this route.')
  //   }
  // })
}
