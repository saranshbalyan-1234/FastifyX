/**
 * This file is here only to show you how to proceed if you would
 * like to run your application as a standalone executable.
 *
 * You can launch it with the command `npm run standalone`
 */

import Fastify from 'fastify'
import fp from 'fastify-plugin'

// Import library to exit fastify process, gracefully (if possible)
import closeWithGrace from 'close-with-grace'

// Import your application as a normal plugin.
import serviceApp from './app.js'

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info', // Use LOG_LEVEL from .env
    transport: {
      target: 'pino-pretty', // Use pino-pretty for string logs
      options: {
        translateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss.l'Z'", // Human-readable time
        singleLine: true, // Print logs in a single line
        ignore: 'pid,hostname' // Remove pid and hostname from logs
      }
    }
  },
  disableRequestLogging: true, // Disable logging of incoming requests
  ajv: {
    customOptions: {
      coerceTypes: 'array', // change type of data to match type keyword
      removeAdditional: 'all' // Remove additional body properties
    }
  }
})

async function init () {
  // Register your application as a normal plugin.
  // fp must be used to override default error handler
  app.register(fp(serviceApp))

  // Delay is the number of milliseconds for the graceful close to finish
  closeWithGrace(
    { delay: process.env.FASTIFY_CLOSE_GRACE_DELAY ?? 500 },
    async ({ err }) => {
      if (err != null) {
        app.log.error(err)
      }

      await app.close()
    }
  )

  await app.ready()

  try {
    // Start listening.
    await app.listen({ port: process.env.PORT ?? 3000 })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

init()
