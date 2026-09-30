declare module "pg" {
  export class Pool {
    constructor(config?: {
      connectionString?: string;
      max?: number;
      connectionTimeoutMillis?: number;
      idleTimeoutMillis?: number;
    });
    query<T extends Record<string, unknown>>(
      queryText: string,
      values?: unknown[],
    ): Promise<{ rows: T[] }>;
  }
}
