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
    fastify.get('/debug/uploads', async () => {
      const fs = await import('fs/promises');
      const path = await import('path');
      const uploadsPath = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
      
      try {
        const files = await fs.readdir(uploadsPath);
        return {
          uploadsPath,
          filesCount: files.length,
          files: files.slice(0, 10) // Premiers 10 fichiers
        };
      } catch (error: any) {
        return {
          uploadsPath,
          error: error.message
        };
      }
    })
const start = async (): Promise<void> => {
  try {
    await AppDataSource.initialize()

    await seedDatabase(AppDataSource);

    await fastify.register(cors, {
      origin:  true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['Content-Range', 'X-Content-Range']
    })


    const uploadsPath = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');

    await fastify.register(fastifyStatic, {
      root: uploadsPath,
      prefix: "/uploads/",
      decorateReply: false // Important pour éviter les conflits
    });

    console.log('📁 Serving static files from:', uploadsPath);


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