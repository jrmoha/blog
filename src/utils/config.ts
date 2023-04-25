import dotenv from 'dotenv';
dotenv.config();

const {
  PORT,
  DATABASE_HOST,
  DATABASE,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  DATABASE_PORT,
  LASTSEEN_TIMEOUT,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
  JWT_SECRET,
  MESSAGE_SECRET,
  TRENDING_NUM,
  // eslint-disable-next-line no-undef
} = process.env;

export default {
  PORT: parseInt(PORT as string, 10),
  database: {
    host: DATABASE_HOST,
    database: DATABASE,
    user: DATABASE_USERNAME,
    password: DATABASE_PASSWORD,
    port: DATABASE_PORT,
  },
  lastseen_timeout: parseInt(LASTSEEN_TIMEOUT as string, 10),
  trending_num: parseInt(TRENDING_NUM as string, 10),
  google: {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
  },
  github: {
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: GITHUB_CALLBACK_URL,
  },
  jwt: {
    secret: JWT_SECRET,
  },
  message: {
    secret: MESSAGE_SECRET,
  },
};
