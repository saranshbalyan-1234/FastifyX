import {
  FastifyPluginAsyncTypebox,
  Type
} from '@fastify/type-provider-typebox'

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    '/',
    {
      schema: {
        response: {
          200: Type.Object({
            message: Type.String()
          })
        }
      }
    },
    async function () {
      fastify.log.info('file name test')
      throw new HttpError('Test error logging',400)
      return { message: 'Welcome to the official fastify demo!' }
    }
  )
}

export default plugin
