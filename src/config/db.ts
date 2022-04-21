import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

const DB_TYPE = 'mariadb';

const dbConfig: MysqlConnectionOptions = {
  type: DB_TYPE,
  database: process.env.MARIADB_DATABASE_NAME,
  username: process.env.MARIADB_USER_NAME,
  password: process.env.MARIADB_PASSWORD,
  host: process.env.MARIADB_HOST,
  port: Number(process.env.MARIADB_PORT),
};

export default dbConfig;
