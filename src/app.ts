import express, { Application, Request, Response } from 'express';
import config from './config/config';
import userModel from './models/userModel';
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
app.post('/register', async (req: Request, res: Response) => {
  try {
    const data = await User.registerUser(
      req.body.username,
      req.body.password,
      req.body.email,
      req.body.first_name,
      req.body.last_name,
      req.body.birth_date
    );
    res.status(201).json(data);
  } catch (err: any) {
    res.json({ Message: err.message, Status: err.status });
  }
});
app.post('/login', async (req: Request, res: Response) => {
  try {
    const data = await User.authenticateUser(req.body.username, req.body.password);
    res.status(200).json(data);
  } catch (err: any) {
    res.json({ Message: err.message, Status: err.status });
  }
});
app.listen(port);
