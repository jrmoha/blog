import express, { Application, Request, Response } from 'express';
import config from './utils/config';
import authRouter from './routes/authenticationRouter';
import postRouter from './routes/postRouter';
import { formatTime } from './utils/functions';
const app: Application = express();
const port: number = config.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/authentication', authRouter);
app.use('/posts', postRouter);
app.get('/', async (_req: Request, res: Response) => {
  const time = formatTime(
    new Date(new Date().getTime() - 1000 * 60).toISOString()
  );
  res.send(time);
});
app.listen(port);
