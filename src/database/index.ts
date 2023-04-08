import { Pool } from 'pg';
import config from '../utils/config';

const pool = new Pool({
  host: config.database.host,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  port: parseInt(config.database.port as string, 10),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
pool.addListener('error', (err) => {
  console.log(`Error while connecting to database ${err.message}`);
});
export default pool;
