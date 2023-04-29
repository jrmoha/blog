import { Request, Response } from 'express';
import userModel from '../models/userModel';
import jwt from 'jsonwebtoken';
import config from '../utils/config';
import postModel from '../models/postModel';
export const loginPageController = async (req: Request, res: Response) => {
  res.render('login');
};
export const loginController = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    console.log(username, password);
    const response = await userModel.authenticateUser(username, password);
    Promise.allSettled([
      userModel.insertSession(
        req.session.id,
        username,
        req.socket.remoteAddress as string
      ),
      userModel.addActivity(username, 'You Logged In.'),
    ]);
    const info_result = await Promise.all([
      userModel.getCurrentProfileImage(username),
      userModel.getOptions(username),
      postModel.getUserLikedPostsAsArray(username),
    ]);
    const token = jwt.sign(
      {
        user: response,
        session: req.session.id,
        profile_image: info_result[0],
        options: info_result[1],
        liked_posts: info_result[2],
      },
      config.jwt.secret as string,
      {
        expiresIn: '7d',
        header: {
          alg: 'HS256',
          typ: 'JWT',
        },
      }
    );
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.json(token);
  } catch (err: any) {
    console.log(err);
    res.render('login', { error_msg: err.message });
  }
};
export const regPageController = async (_req: Request, res: Response) => {
  res.render('registration');
};
export const registerController = async (req: Request, res: Response) => {
  try {
    const { username, password, email, first_name, last_name, birth_date } =
      req.body;
    const response = await userModel.registerUser(
      username,
      password,
      email,
      first_name,
      last_name,
      birth_date
    );
    Promise.allSettled([
      userModel.addActivity(username, 'You Created This Account.'),
      userModel.insertSession(
        req.session.id,
        username,
        req.socket.remoteAddress as string
      ),
    ]);
    const all_info = await Promise.all([
      userModel.insertDefaultImage(username),
      userModel.initOptions(username),
      postModel.getUserLikedPostsAsArray(username),
    ]);
    const token = jwt.sign(
      {
        user: response,
        session: req.session.id,
        profile_image: all_info[0],
        options: all_info[1],
        liked_posts: all_info[2],
      },
      config.jwt.secret as string,
      {
        expiresIn: '7d',
        header: {
          alg: 'HS256',
          typ: 'JWT',
        },
      }
    );
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.json(response);
  } catch (err: any) {
    res.json({ message: err.message, status: err.status });
  }
};
export const findOrCreateController = async function verify(
  _accessToken: string,
  _refreshToken: string,
  profile: any,
  cb: any
) {
  try {
    const profile_result = await userModel.findOrCreate(profile);
    return cb(null, profile_result);
  } catch (err) {
    return cb(err, null);
  }
};
export const providerLoginController = async function (
  req: Request,
  res: Response
) {
  const requestUser = req.user as any;
  if (!requestUser) throw new Error('User Not Found');
  console.log(requestUser.user);
  Promise.all([
    userModel.insertSession(
      req.session.id,
      requestUser.username,
      req.socket.remoteAddress as string
    ),
    userModel.addActivity(
      requestUser.username,
      `You Logged In Using ${requestUser.provider}`
    ),
  ]);
  const info_result = await Promise.all([
    userModel.getCurrentProfileImage(requestUser.username),
    userModel.getOptions(requestUser.username),
    postModel.getUserLikedPostsAsArray(requestUser.username),
  ]);
  const token = jwt.sign(
    {
      user: requestUser.user,
      session: req.session.id,
      profile_image: info_result[0],
      options: info_result[1],
      liked_posts: info_result[2],
    },
    config.jwt.secret as string
  );
  res.cookie('jwt', token);
  res.send(token);
};
