import { Pool } from 'pg';
import config from '../config/config';

const pool = new Pool({
  host: config.database.host,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  port: parseInt(config.database.port as string, 10),
});

pool.addListener('error', (err) => {
  console.log(`Error while connecting to database ${err.message}`);
});
export default pool;
