import Fastify from 'fastify'
import { AppDataSource } from '../database/data-source';
import { RouteFactory } from './routes';

const fastify = Fastify({
  logger: true
})

fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

fastify.get('/database/structure', async (request, reply) => {
  const entities = AppDataSource.entityMetadatas.map(entity => ({
    tableName: entity.tableName,
    columns: entity.columns.map(column => ({
      name: column.propertyName,
      type: column.type,
      nullable: column.isNullable,
      primary: column.isPrimary,
      generated: column.isGenerated,
      default: column.default
    })),
    relations: entity.relations.map(relation => ({
      name: relation.propertyName,
      type: relation.relationType,
      target: relation.inverseEntityMetadata.tableName,
      nullable: relation.isNullable
    }))
  }));

  return { entities };
});

const start = async (): Promise<void> => {
  try {
    await AppDataSource.initialize()
    console.log("✅ Database connected")
    
    const routeFactory = new RouteFactory(AppDataSource);
    await fastify.register(routeFactory.createApiPlugin(), { prefix: '/api' });
    
    console.log("✅ All routes registered:");
    console.log("   📍 /api/users");
    console.log("   📍 /api/tickets");
    console.log("   📍 /api/comments");
    console.log("   📍 /api/sprints");
    console.log("   📍 /api/images");
    console.log("   📍 /api/tests");

    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    console.log('✅ Server is running on http://localhost:3000')

  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()