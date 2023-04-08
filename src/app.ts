import express, { Application, Request, Response } from 'express';
import config from './utils/config';
import * as auth from './controllers/authController';
import * as post from './controllers/postController';

const app: Application = express();
const port: number = config.PORT;
app.use(express.json());
app.get('/', async (req: Request, res: Response) => {
  res.send(req.body);
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
app.listen(port);
