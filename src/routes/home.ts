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
      fastify.log.info("file name test")
      return { message: 'Welcome to the official fastify demo!' }
    }
  )
}

export default plugin
