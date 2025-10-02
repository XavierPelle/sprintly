import Fastify from 'fastify'
import multipart from '@fastify/multipart'
import cors from '@fastify/cors'
import { AppDataSource } from '../database/data-source';
import { RouteFactory } from './routes';
import { seedDatabase } from '../database/seed';
import fastifyStatic from "@fastify/static";
import { join } from "path";


const fastify = Fastify({
  logger: true,
  bodyLimit: 10 * 1024 * 1024
})

const start = async (): Promise<void> => {
  try {
    await AppDataSource.initialize()

    await seedDatabase(AppDataSource);

    await fastify.register(cors, {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    })

    await fastify.register(fastifyStatic, {
      root: join(__dirname, "../../../uploads"),
      prefix: "/uploads/",
    });

    console.log(join(__dirname, "../../../uploads"));


    await fastify.register(multipart, {
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10
      }
    })

    const routeFactory = new RouteFactory(AppDataSource);
    await fastify.register(routeFactory.createApiPlugin(), { prefix: '/api' });

    console.log("✅ All routes registered:");
    console.log("   📍 /api/users");
    console.log("   📍 /api/tickets");
    console.log("   📍 /api/comments");
    console.log("   📍 /api/sprints");
    console.log("   📍 /api/tests");
    console.log("   📍 /api/images");

    fastify.get('/health', async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: AppDataSource.isInitialized ? 'connected' : 'disconnected'
      }
    })

    fastify.get('/', async () => {
      return {
        message: 'Welcome to the API',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          api: '/api',
          docs: '/api/docs (TODO)'
        }
      }
    })

    fastify.setErrorHandler((error, request, reply) => {
      fastify.log.error(error)

      const statusCode = error.statusCode || 500
      const message = error.message || 'Internal Server Error'

      reply.status(statusCode).send({
        success: false,
        message,
        statusCode,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    })

    const port = Number(process.env.PORT) || 3000
    const host = process.env.HOST || '0.0.0.0'

    await fastify.listen({ port, host })

    console.log('')
    console.log('🚀 ====================================')
    console.log(`🚀 Server is running on http://localhost:${port}`)
    console.log(`🚀 API available at http://localhost:${port}/api`)
    console.log(`🚀 Health check at http://localhost:${port}/health`)
    console.log('🚀 ====================================')
    console.log('')

  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

process.on('SIGINT', async () => {
  console.log('\n⚠️  Shutting down gracefully...')
  await fastify.close()
  await AppDataSource.destroy()
  console.log('✅ Server closed')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Shutting down gracefully...')
  await fastify.close()
  await AppDataSource.destroy()
  console.log('✅ Server closed')
  process.exit(0)
})

start()