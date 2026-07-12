declare module 'pg' {
  export class Pool {
    constructor(config?: any);
    query(sql: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }>;
    on(event: string, handler: (...args: any[]) => void): void;
    end(): Promise<void>;
  }
  export class PoolClient {
    query(sql: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }>;
    release(): void;
  }
  export const types: {
    setTypeParser(oid: number, parser: (value: string) => any): void;
  };
}
