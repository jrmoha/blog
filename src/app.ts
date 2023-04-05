import express, { Application, Request, Response } from 'express';
import config from './config/config';
import userModel from './models/userModel';
const User = new userModel();
const app: Application = express();
const port: number = config.PORT;
app.use(express.json());
app.get('/', async (req: Request, res: Response) => {
  res.send(req.body);
});
// app.post('/register', async (req: Request, res: Response) => {
//   try {
//     const user: User = await User.registerUser(
//       req.body.username,
//       req.body.password,
//       req.body.email,
//       req.body.first_name,
//       req.body.last_name,
//       req.body.birth_date,
//       req.body.session_id
//     );
//     res.json(user);
//   } catch (err) {
//     res.json(err);
//   }
// });
// app.post('/login', async (req: Request, res: Response) => {
//   try {
//     const user: User = await User.authenticateUser(
//       req.body.username,
//       req.body.password,
//       req.body.session_id
//     );
//     res.json(user);
//   } catch (err) {
//     res.json(err);
//   }
// });
// app.post('/addActivity', async (req: Request, res: Response) => {
//   try {
//     const result: object = await User.addActivity(
//       req.body.username,
//       req.body.activity
//     );
//     res.json(result);
//   } catch (err) {
//     res.json(err);
//   }
// });
// app.delete('/deleteActivity', async (req: Request, res: Response) => {
//   try {
//     const result: object = await User.deleteActivity(
//       req.body.username,
//       req.body.activity
//     );
//     res.json(result);
//   } catch (err) {
//     res.json(err);
//   }
// });
// app.get('/getActivities', async (req: Request, res: Response) => {
//   try {
//     const result: object = await User.getActivities(req.body.username);
//     res.json(result);
//   } catch (err) {
//     res.json(err);
//   }
// });
// app.post('/search', async (req: Request, res: Response) => {
//   try {
//     const result: object = await User.search(
//       req.body.username,
//       req.body.search_title
//     );
//     res.json(result);
//   } catch (err) {
//     res.json(err);
//   }
// });
// app.delete('/deleteSearch', async (req: Request, res: Response) => {
//   try {
//     const result: object = await User.deleteSearch(
//       req.body.username,
//       req.body.search_title
//     );
//     res.json(result);
//   } catch (err) {
//     res.json(err);
//   }
// });
// app.get('/getSearch', async (req: Request, res: Response) => {
//   try {
//     const result: string[] = await User.searchHistory(req.body.username);
//     res.json(result);
//   } catch (err) {
//     res.json(err);
//   }
// });
// app.post('/follow', async (req: Request, res: Response) => {
//   try {
//     const result: object = await User.follow(
//       req.body.username,
//       req.body.followed
//     );
//     res.json(result);
//   } catch (err) {
//     res.json(err);
//   }
// });
// app.delete('/unfollow', async (req: Request, res: Response) => {
//   try {
//     const result: object = await User.unfollow(
//       req.body.username,
//       req.body.followed
//     );
//     res.json(result);
//   } catch (err) {
//     res.json(err);
//   }
// });
// app.put('/deleteFollower', async (req: Request, res: Response) => {
//   try {
//     const result: object = await User.deleteFollower(
//       req.body.username,
//       req.body.follower
//     );
//     res.json(result);
//   } catch (err) {
//     res.json(err);
//   }
// });
app.listen(port);
