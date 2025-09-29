import Fastify from 'fastify'
import { AppDataSource } from './infrastructure/database/data-source'
import { User } from "./domain/entities/User"

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

    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    console.log('✅ Server is running on http://localhost:3000')

  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()