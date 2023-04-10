import express, { Application, Request, Response } from 'express';
import config from './utils/config';
import * as auth from './controllers/authController';
import * as post from './controllers/postController';
import * as user from './controllers/userController';
import userModel from './models/userModel';
const app: Application = express();
const port: number = config.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req: Request, res: Response) => {
  res.send('Hello world');
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
app.get('/followers/:username', async (req: Request, res: Response) => {
  try {
    const username: string = req.params.username;
    const result = await userModel.getFollowers(username);
    res.status(200).send(result);
  } catch (err) {
    res.json(err);
  }
});
app.get('/following/:username', async (req: Request, res: Response) => {
  try {
    const username: string = req.params.username;
    const result = await userModel.getFollowings(username);
    res.status(200).send(result);
  } catch (err) {
    res.json(err);
  }
});
app.listen(port);
