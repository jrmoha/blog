import dotenv from 'dotenv';
dotenv.config();

const {
  NODE_ENV,
  PORT,
  DATABASE_HOST,
  DATABASE,
  DATABASE_TEST,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  DATABASE_PORT,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
  JWT_SECRET,
  MESSAGE_SECRET,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_SECRET,
  DEFAULT_AVATAR
} = process.env;

export default {
  PORT: parseInt(PORT as string, 10),
  database: {
    host: DATABASE_HOST,
    database: NODE_ENV === 'development' ? DATABASE : DATABASE_TEST,
    user: DATABASE_USERNAME,
    password: DATABASE_PASSWORD,
    port: DATABASE_PORT,
  },
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
  cloudinary: {
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_SECRET,
    url: `https://cloudinary://${CLOUDINARY_API_KEY}:${CLOUDINARY_SECRET}@${CLOUDINARY_CLOUD_NAME}}`,
    options: {
      users: {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        folder: 'social-network/users',
      },
      posts: {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        folder: 'social-network/posts',
      },
    },
  },
  default_profile_image: DEFAULT_AVATAR,
  lastseen_timeout: 30000,
  trending_num: 10,
  activity_page_size: 15,
  limit_post_per_page: 10,
  limit_images_per_profile: 12,
  limit_user_per_page: 20,
  limit_users_per_search: 6,
  limit_posts_per_search: 6,
  history_page_size: 20,
  history_limit: 5,
};
