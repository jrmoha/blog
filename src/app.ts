import express, { Application } from 'express';
import session from 'express-session';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import config from './utils/config';
import authRouter from './routes/authentication.router';
import postRouter from './routes/post.router';
import userRouter from './routes/user.router';
import errorMiddleware from './middleware/error.middleware';
import notFoundMiddleware from './middleware/notFound.middleware';

const app: Application = express();

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.use(express.static(__dirname + '/public'));
app.use('/users/:username', express.static(__dirname + '/public'));
app.use('/posts/hashtags/:hashtag', express.static(__dirname + '/public'));
app.use('/posts/', express.static(__dirname + '/public'));
app.use('/posts/post', express.static(__dirname + '/public'));
app.use('/settings', express.static(__dirname + '/public'));

app.set('view engine', 'ejs');
app.set('views', 'src/views');

app.set('trust proxy', 1);
app.use(
  session({
    secret: config.jwt.secret as string,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
const cspDirectives = {
  'default-src': ["'self'"],
  'img-src': [
    "'self'",
    'https://res.cloudinary.com',
    'http://localhost:*',
    'data:',
    'https://source.unsplash.com',
  ],
  'upgrade-insecure-requests': [],
  'script-src': ["'self'"],
  'style-src': [
    "'self'",
    'https://fonts.googleapis.com',
    'https://maxcdn.bootstrapcdn.com',
    "'unsafe-inline'",
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'https://maxcdn.bootstrapcdn.com',
  ],
};

app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: cspDirectives,
    reportOnly: false,
  })
);
app.use(helmet.crossOriginEmbedderPolicy({ policy: 'credentialless' }));
app.use(morgan('combined'));
app.use(
  cors({
    origin: '*',
  })
);
app.use('/', authRouter);
app.use('/posts', postRouter);
app.use('/', userRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
