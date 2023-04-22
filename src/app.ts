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
import { formatTime, formatUserStatusTime } from './utils/functions';
import db from './database';
import userModel from './models/userModel';

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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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
app.get('/trendingHashtags', async (_req: Request, res: Response) => {
  const connection = await db.connect();
  let query = `WITH recent_posts AS (SELECT * FROM post WHERE upload_date > NOW() - INTERVAL '7 days') ,`;
  query += `tags AS (SELECT tag,COUNT(tag) AS "Frequency" FROM post_tags WHERE post_id IN (SELECT post_id FROM post) `;
  query += `GROUP BY tag ORDER BY "Frequency" DESC) `;
  query += `SELECT tag,"Frequency" FROM tags;`;
  const { rows } = await connection.query<any[]>(query);
  res.json(rows);
});
app.get('/trendingPosts', async (_req: Request, res: Response) => {
  const connection = await db.connect();
  let query = `WITH recent_posts AS (SELECT * FROM post WHERE update_date > NOW() - INTERVAL '7 days') ,`;
  query += `tags AS (SELECT post_id,COUNT(tag) AS "Frequency" FROM post_tags WHERE post_id IN (SELECT post_id FROM post) `;
  query += `GROUP BY post_id ORDER BY "Frequency" DESC) `;
  query += `SELECT p.post_id,p.username,p.upload_date,p.update_date,p.post_content FROM post p `;
  query += `JOIN tags t ON t.post_id=p.post_id;`;
  const { rows } = await connection.query<any[]>(query);
  res.json(rows);
});
app.get('/views', async (_req: Request, res: Response) => {
  const connection = await db.connect();
  let query = `SELECT (SELECT COUNT(post_id) FROM view_post WHERE post_id=p.post_id AND view_date>NOW()-INTERVAL '7 days') AS "Views",`;
  query += `p.post_id,p.username,p.post_content,p.upload_date,p.update_date FROM post p `;
  query += `GROUP BY p.post_id ORDER BY "Views" DESC;`;
  const { rows } = await connection.query(query);
  res.json(rows);
});
app.get('/views2', async (_req: Request, res: Response) => {
  const connection = await db.connect();
  let query = `WITH most_viewed AS `;
  query += `(SELECT post_id,COUNT(post_id) AS "freq" FROM view_post WHERE view_date >= NOW()-INTERVAL '7 days' GROUP BY post_id ORDER BY "freq" DESC) `;
  query += `SELECT p.post_id,p.username,p.upload_date,p.update_date,p.post_content,`;
  query += `(SELECT "freq" FROM most_viewed WHERE post_id=p.post_id) FROM post p `;
  query += `WHERE p.post_id IN (SELECT post_id FROM most_viewed) ORDER BY "freq" DESC;`;
  const { rows } = await connection.query(query);
  res.json(rows);
});
//
app.get('/t', async (_req: Request, res: Response) => {
  const connection = await db.connect();
  let query = `WITH recent_posts AS (SELECT * FROM post WHERE upload_date >= NOW() - INTERVAL '7 days'),`;
  query += `tag_count AS (SELECT post_id,tag FROM post_tags WHERE post_id IN (SELECT post_id FROM recent_posts)) `;
  query += `SELECT p.post_id, p.username,p.post_content,p.upload_date,p.update_date,t.*,`;
  query += `(SELECT COUNT(tag) FROM tag_count WHERE tag=t.tag) AS "Freq" FROM tag_count t `;
  query += `JOIN recent_posts p ON p.post_id=t.post_id `;
  query += `ORDER BY "Freq" DESC;`;
  const { rows } = await connection.query(query);
  res.json(rows);
});
app.get('/online', async (_req: Request, res: Response) => {
  const connection = await db.connect();
  let query = `SELECT username FROM user_session `;
  query += `WHERE update_time>NOW()-INTERVAL '30 second' `;
  query += `AND username IN (SELECT followed_username FROM follow WHERE follower_username=$1 AND follow_status=1);`;
  const { rows } = await connection.query(query, ['mostafa']);
  res.json(rows);
});
app.get('/friends', async (_req: Request, res: Response) => {
  const connection = await db.connect();
  let query = `SELECT f.followed_username,MAX(u.update_time) AS lastseen FROM follow f `;
  query += `JOIN user_session u ON u.username=f.followed_username `;
  query += `WHERE f.follower_username='mostafa' AND f.follow_status=1 GROUP BY f.followed_username `;
  query += `ORDER BY lastseen DESC;`;
  const { rows } = await connection.query(query);
  rows.forEach((row: any) => {
    row.lastseen = formatUserStatusTime(row.lastseen);
  });
  res.json(rows);
});
app.get('/profile', async (req: Request, res: Response) => {
  try {
    const current_username = req.query.current_username;
    const target_username = req.query.target_username;
    //to check if the two usernames exist
    const result: any = {};
    const connection = await db.connect();
    const basic_info_query = `SELECT username,first_name,last_name,email FROM users WHERE username=$1`;
    const basic_info_result = await connection.query(basic_info_query, [
      target_username,
    ]);
    result['basic_info'] = basic_info_result.rows[0];
    const follow_status_query = `SELECT follow_status FROM follow WHERE follower_username=$1 AND followed_username=$2 AND follow_status=1`;
    const follow_status_result = await connection.query(follow_status_query, [
      current_username,
      target_username,
    ]);
    result['follow_status'] = follow_status_result.rowCount == 1;
    const posts_query = `SELECT * FROM post WHERE username=$1 ORDER BY upload_date DESC`;
    const posts_result = await connection.query(posts_query, [target_username]);
    result['posts'] = posts_result.rows;
    const post_comment_query = `SELECT * FROM post_comment WHERE post_id=$1`;
    const post_likes_query = `SELECT * FROM post_like WHERE post_id=$1`;
    result.posts.forEach(async (post: any) => {
      post.upload_date = formatTime(post.upload_date);
      post.update_date = formatTime(post.update_date);
      const post_comment_result = await connection.query(post_comment_query, [
        post.post_id,
      ]);
      post.comments = post_comment_result.rows;
      post.comments.forEach((comment: any) => {
        comment.comment_date = formatTime(comment.comment_date);
      });
      const post_likes_result = await connection.query(post_likes_query, [
        post.post_id,
      ]);
      post.likes = post_likes_result.rows;
    });

    const likes_query = `SELECT username FROM post WHERE post_id IN (SELECT post_id FROM post_like WHERE username=$1) ORDER BY upload_date DESC`;
    const likes_result = await connection.query(likes_query, [target_username]);
    result['likes'] = likes_result.rows;
    connection.release();
    return res.json(result);
  } catch (err: any) {
    return res.json({ error: err.message });
  }
});
app.get('/hello', async (req, res) => {
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
// app.listen(port);
httpServer.listen(port);
