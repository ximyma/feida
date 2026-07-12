/**
 * DatabaseFactory — 数据库驱动工厂
 * 根据环境变量 DATABASE_URL 或配置自动选择驱动
 *
 * 用法:
 *   SQLite (默认):
 *     DATABASE_URL=sqlite://data/ehr.db
 *   PostgreSQL:
 *     DATABASE_URL=postgres://user:pass@localhost:5432/feida
 *   # 或
 *     DB_DRIVER=postgres
 *     DB_HOST=localhost DB_PORT=5432 DB_NAME=feida DB_USER=feida DB_PASS=xxx
 */
import { IDatabaseDriver } from './database-driver';
import { PgDriver, PgConfig } from './pg-driver';
import { DatabaseService } from './database.service';

export function createDatabase(): { db: IDatabaseDriver; type: 'sqlite' | 'postgres' } {
  const driver = process.env.DB_DRIVER || 'sqlite';
  const url = process.env.DATABASE_URL || '';

  if (driver === 'postgres' || url.startsWith('postgres')) {
    let config: PgConfig;
    if (url.startsWith('postgres')) {
      config = url as any;
    } else {
      config = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'feida',
        user: process.env.DB_USER || 'feida',
        password: process.env.DB_PASS || '',
      };
    }
    console.log(`[DB] PostgreSQL: ${config.host}:${config.port}/${config.database}`);
    return { db: new PgDriver(config), type: 'postgres' };
  }

  // 默认 SQLite
  const dbPath = process.env.DB_PATH || url.replace('sqlite://', '') || 'data/ehr.db';
  console.log(`[DB] SQLite: ${dbPath}`);
  const svc = new DatabaseService();
  svc.onModuleInit();
  return { db: svc as any, type: 'sqlite' };
}
