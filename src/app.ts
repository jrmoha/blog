import express, { Application, Request, Response } from 'express';
import config from './config/config';
import userModel from './models/userModel';
import User from './types/user_type';
const User = new userModel();
const app: Application = express();
const port: number = config.PORT;
app.use(express.json());
app.get('/', async (req: Request, res: Response) => {
  try {
    const data = await User.userExists('dashy', 'dash@google');
    res.json(data);
  } catch (err: unknown) {
    res.json(err);
  }
});
app.listen(port);
