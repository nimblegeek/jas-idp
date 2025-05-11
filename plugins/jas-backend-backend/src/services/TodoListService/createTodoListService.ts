import { LoggerService } from '@backstage/backend-plugin-api';
import { NotFoundError } from '@backstage/errors';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import crypto from 'node:crypto';
import { TodoItem, TodoListService, DatabaseRecord } from './types';
// You'll need to add a database client library based on your database type
// For example, for PostgreSQL:
// import { Client } from 'pg';
// For MySQL:
// import mysql from 'mysql2/promise';
// For MongoDB:
// import { MongoClient } from 'mongodb';

// TEMPLATE NOTE:
// This is a simple in-memory todo list store. It is recommended to use a
// database to store data in a real application. See the database service
// documentation for more information on how to do this:
// https://backstage.io/docs/backend-system/core-services/database
export async function createTodoListService({
  logger,
  catalog,
  config, // You'll need to add this parameter to access configuration
}: {
  logger: LoggerService;
  catalog: typeof catalogServiceRef.T;
  config: any; // Replace with the proper config type
}): Promise<TodoListService> {
  logger.info('Initializing TodoListService');

  const storedTodos = new Array<TodoItem>();
  
  // Initialize your database connection
  // This is a placeholder - you'll need to replace with actual DB connection code
  // based on your database type
  const dbClient = initializeDatabaseConnection(config, logger);
  
  return {
    async createTodo(input, options) {
      let title = input.title;

      // TEMPLATE NOTE:
      // A common pattern for Backstage plugins is to pass an entity reference
      // from the frontend to then fetch the entire entity from the catalog in the
      // backend plugin.
      if (input.entityRef) {
        // TEMPLATE NOTE:
        // Cross-plugin communication uses service-to-service authentication. The
        // `AuthService` lets you generate a token that is valid for communication
        // with the target plugin only. You must also provide credentials for the
        // identity that you are making the request on behalf of.
        //
        // If you want to make a request using the plugin backend's own identity,
        // you can access it via the `auth.getOwnServiceCredentials()` method.
        // Beware that this bypasses any user permission checks.
        const entity = await catalog.getEntityByRef(input.entityRef, options);
        if (!entity) {
          throw new NotFoundError(
            `No entity found for ref '${input.entityRef}'`,
          );
        }

        // TEMPLATE NOTE:
        // Here you could read any form of data from the entity. A common use case
        // is to read the value of a custom annotation for your plugin. You can
        // read more about how to add custom annotations here:
        // https://backstage.io/docs/features/software-catalog/extending-the-model#adding-a-new-annotation
        //
        // In this example we just use the entity title to decorate the todo item.

        const entityDisplay = entity.metadata.title ?? input.entityRef;
        title = `[${entityDisplay}] ${input.title}`;
      }

      const id = crypto.randomUUID();
      const createdBy = options.credentials.principal.userEntityRef;
      const newTodo = {
        title,
        id,
        createdBy,
        createdAt: new Date().toISOString(),
      };

      storedTodos.push(newTodo);

      // TEMPLATE NOTE:
      // The second argument of the logger methods can be used to pass
      // structured metadata. You can read more about the logger service here:
      // https://backstage.io/docs/backend-system/core-services/logger
      logger.info('Created new todo item', { id, title, createdBy });

      return newTodo;
    },

    async listTodos() {
      return { items: Array.from(storedTodos) };
    },

    async getTodo(request: { id: string }) {
      const todo = storedTodos.find(item => item.id === request.id);
      if (!todo) {
        throw new NotFoundError(`No todo found with id '${request.id}'`);
      }
      return todo;
    },
    
    // New methods for database operations
    async fetchDatabaseRecords(options) {
      try {
        logger.info('Fetching database records', { 
          query: options.query,
          databaseName: options.databaseName,
          tableName: options.tableName
        });
        
        const records = await queryDatabase(
          dbClient,
          options.query || '',
          options.params || {},
          options.databaseName,
          options.tableName,
          logger
        );
        
        return { records };
      } catch (error) {
        logger.error('Failed to fetch database records', { error });
        throw error;
      }
    },
    
    async getDatabaseRecord(request) {
      try {
        logger.info('Fetching database record by ID', { 
          id: request.id,
          databaseName: request.databaseName,
          tableName: request.tableName
        });
        
        const record = await getRecordById(
          dbClient,
          request.id,
          request.databaseName,
          request.tableName,
          logger
        );
        
        if (!record) {
          throw new NotFoundError(`No record found with id '${request.id}'`);
        }
        
        return record;
      } catch (error) {
        logger.error('Failed to fetch database record', { error });
        throw error;
      }
    },
  };
}

// Helper functions for database operations
// These are placeholders - you'll need to implement based on your database type

function initializeDatabaseConnection(config: any, logger: LoggerService) {
  // Read database configuration from config
  const dbConfig = config.getConfig('database');
  const dbType = dbConfig.getString('type');
  const host = dbConfig.getString('host');
  const port = dbConfig.getNumber('port');
  const user = dbConfig.getString('user');
  const password = dbConfig.getString('password');
  
  logger.info('Initializing database connection', { dbType, host, port });
  
  // Initialize and return the appropriate client based on database type
  // This is just a placeholder - implement based on your database
  return {
    type: dbType,
    connection: {
      host,
      port,
      user,
      password,
    }
  };
}

async function queryDatabase(
  client: any,
  query: string,
  params: Record<string, any>,
  databaseName?: string,
  tableName?: string,
  logger?: LoggerService,
): Promise<DatabaseRecord[]> {
  // Implement based on your database type
  // This is a placeholder implementation
  
  logger?.info('Executing database query', { query, databaseName, tableName });
  
  // Example implementation for SQL-based databases:
  // const result = await client.query(query, Object.values(params));
  // return result.rows.map(row => ({ id: row.id, ...row }));
  
  // For demonstration purposes, return mock data
  return [
    { id: '1', name: 'Record 1', value: 'Value 1' },
    { id: '2', name: 'Record 2', value: 'Value 2' },
  ];
}

async function getRecordById(
  client: any,
  id: string,
  databaseName?: string,
  tableName?: string,
  logger?: LoggerService,
): Promise<DatabaseRecord | null> {
  // Implement based on your database type
  // This is a placeholder implementation
  
  logger?.info('Fetching record by ID', { id, databaseName, tableName });
  
  // Example implementation for SQL-based databases:
  // const query = `SELECT * FROM ${tableName} WHERE id = $1`;
  // const result = await client.query(query, [id]);
  // return result.rows.length > 0 ? { id: result.rows[0].id, ...result.rows[0] } : null;
  
  // For demonstration purposes, return mock data
  if (id === '1') {
    return { id: '1', name: 'Record 1', value: 'Value 1' };
  } else if (id === '2') {
    return { id: '2', name: 'Record 2', value: 'Value 2' };
  }
  return null;
}
