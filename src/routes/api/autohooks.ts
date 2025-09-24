import { FastifyInstance } from 'fastify'

export default async function (fastify: FastifyInstance) {

fastify.addHook('onSend', function (req, reply, payload, done) {
  let obj = {
    // headers:reply.request.raw.rawHeaders,
    method:reply.request.raw.method,
    url:reply.request.raw.url,
    statusCode:reply.statusCode,
    body:reply.request.body,
    query:reply.request.query,
    params:reply.request.params,
    response:payload
  }
  req.log.debug(obj, 'Req/Res');
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
