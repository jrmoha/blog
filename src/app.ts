import express, { Application, Request, Response } from 'express';
import config from './utils/config';
import * as auth from './controllers/authController';
import * as post from './controllers/postController';
import * as user from './controllers/userController';
import User from './types/user_type';
import db from './database';
import { PoolClient } from 'pg';
const app: Application = express();
const port: number = config.PORT;
app.use(express.json());
app.get('/', async (req: Request, res: Response) => {
  res.send('Hello world');
});
app.put('/', async (req: Request, res: Response) => {
  const username: string = req.body.username;
  const updates: Partial<Omit<User, 'username'>> = req.body.updates;
  const keys: string[] = Object.keys(updates);
  const values: (string | Date)[] = Object.values(updates);
  if (keys.length === 0) {
    return res.status(400).send('Bad Request');
  }
  const connection: PoolClient = await db.connect();
  const query = `UPDATE users SET ${keys.map(
    (key, index) => `${key} = $${index + 1}`
  )} WHERE username = $${keys.length + 1} RETURNING *`;
  const result = await connection.query<User>(query, [...values, username]);
  connection.release();
  res.status(200).send(result.rows[0]);
});
app.post('/login', auth.login);
app.post('/register', auth.register);
app.post('/create', post.createPost);
app.put('/edit', post.editPost);
app.get('/posts/:post_id', post.getPost);
app.post('/viewPost', post.viewPost);
app.delete('/deletePost', post.deletePost);
app.post('/likePost', post.likePost);
app.delete('/unlikePost', post.unlikePost);
app.get('/userPosts/:username', post.getPostsByUser);
app.get('/hashtags/:hashtag', post.getPostsByHashtag);

app.put('/changePassword', user.changePasswordController);
app.put('/updateUser', user.updateUserController);
app.listen(port);
