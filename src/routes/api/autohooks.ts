import { FastifyInstance } from 'fastify'

export default async function (fastify: FastifyInstance) {

  fastify.addHook('preHandler', function (req, reply, done) {
  if (req.body) {
    req.log.info({payload:req.body}, 'request body')
  }
  done()
})

fastify.addHook('onSend', function (req, reply, payload, done) {
  req.log.info({response:payload}, 'response body');
  done();
});

  fastify.addHook('onRequest', async (request, reply) => {
    if (request.url.startsWith('/api/auth/login')) {
      return
    }

    if (!request.session.user) {
      reply.unauthorized('You must be authenticated to access this route.')
    }
  })
}
