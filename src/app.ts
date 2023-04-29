import express, { Application, Request, Response } from 'express';
import session from 'express-session';
import cors from 'cors';
import http from 'http';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import io from './socket';
import config from './utils/config';
import authRouter from './routes/authenticationRouter';
import postRouter from './routes/postRouter';
import userRouter from './routes/userRouter';
import userModel from './models/userModel';
import errorMiddleware from './middleware/errorMiddleware';
import postModel from './models/postModel';
import { authenticationMiddleware } from './middleware/authenticationMiddleware';

const app: Application = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.set('views', 'src/views');
const httpServer = http.createServer(app);
io(httpServer);
const port: number = config.PORT;
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
app.use(helmet());
app.use(morgan('combined'));
app.use(
  cors({
    origin: '*',
  })
);
app.use('/', authRouter);
app.use('/posts', postRouter);
app.use('/users', userRouter);
app.get('/views', async (_req: Request, res: Response) => {
  try {
    const posts = await postModel.trendingByViews();
    res.json(posts);
  } catch (error) {
    res.json(error);
  }
});
app.get(
  '/api/hehe/trendingHashtags',
  authenticationMiddleware,
  async (req: Request, res: Response) => {
    try {
      const username: any = req?.user;
      if (!username) throw new Error('No username');
      const friends: any = await userModel.friendsStatus(username);
      res.json(friends);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);
app.get('/trendingPosts', async (_req: Request, res: Response) => {
  const rows = await postModel.trendingPostsByHashtags();
  res.json(rows);
});
app.get('/feed/:username', async (req: Request, res: Response) => {
  try {
    const rows = await userModel.getFeed(req.params.username as string);
    res.json(rows);
  } catch (err) {
    res.json(err);
  }
});

app.get('/friends', async (_req: Request, res: Response) => {
  const rows = await userModel.friendsStatus('mahmoud');
  res.json(rows);
});

app.get('/profile', async (req, res) => {
  try {
    const current_username = req.query.current_username as string;
    const target_username = req.query.target_username as string;
    const result: any = await userModel.loadProfile(
      current_username,
      target_username
    );
    res.status(200).json(result);
  } catch (err) {
    res.json(err);
  }
});
app.use(errorMiddleware);
// app.listen(port);
httpServer.listen(port);
