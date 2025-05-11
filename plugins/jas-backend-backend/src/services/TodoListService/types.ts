import {
  BackstageCredentials,
  BackstageUserPrincipal,
} from '@backstage/backend-plugin-api';

export interface TodoItem {
  title: string;
  id: string;
  createdBy: string;
  createdAt: string;
}

export interface DatabaseRecord {
  id: string;
  [key: string]: any; // Allow for flexible database record structure
}

export interface TodoListService {
  createTodo(
    input: {
      title: string;
      entityRef?: string;
    },
    options: {
      credentials: BackstageCredentials<BackstageUserPrincipal>;
    },
  ): Promise<TodoItem>;

  listTodos(): Promise<{ items: TodoItem[] }>;

  getTodo(request: { id: string }): Promise<TodoItem>;
  
  // New methods for database operations
  fetchDatabaseRecords(options: {
    query?: string;
    params?: Record<string, any>;
    databaseName?: string;
    tableName?: string;
  }): Promise<{ records: DatabaseRecord[] }>;
  
  getDatabaseRecord(request: { 
    id: string;
    databaseName?: string;
    tableName?: string;
  }): Promise<DatabaseRecord>;
}
