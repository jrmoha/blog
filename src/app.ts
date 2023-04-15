import express, { Application, Request, Response } from 'express';
import config from './utils/config';
import authRouter from './routes/authenticationRouter';
import postRouter from './routes/postRouter';
import { formatTime } from './utils/functions';
import session from 'express-session';
import cors from 'cors';
import db from './database';
const app: Application = express();
const port: number = config.PORT;
app.set('trust proxy', 1);
app.use(
  session({
    secret: config.jwt.secret as string,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);
app.use(express.json());
app.use(
  cors({
    origin: '*',
  })
);
app.use(express.urlencoded({ extended: true }));
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
    row.lastseen = formatTime(row.lastseen);
  });
  res.json(rows);
});
app.listen(port);
