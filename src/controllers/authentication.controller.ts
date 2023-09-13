import { Request, Response } from 'express';
import userModel from '../models/user.model';
import jwt from 'jsonwebtoken';
import config from '../utils/config';
import postModel from '../models/post.model';

export const loginPageController = async (req: Request, res: Response) => {
  req.user ? res.redirect('/') : res.render('login');
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    res.locals.username = username;
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
    req.user = username;
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.redirect('/');
  } catch (err: any) {
    res.render('login', { error_msg: err.message });
  }
};

export const regPageController = async (req: Request, res: Response) => {
  req.user ? res.redirect('/') : res.render('registration');
};

export const registerController = async (req: Request, res: Response) => {
  try {
    const {
      username,
      reg_password,
      reg_email,
      first_name,
      last_name,
      year,
      month,
      day,
    } = req.body;

    res.locals.username = username;
    res.locals.email = reg_email;
    res.locals.first_name = first_name;
    res.locals.last_name = last_name;

    const response = await userModel.registerUser(
      username,
      reg_password,
      reg_email,
      first_name,
      last_name,
      `${year}-${month}-${day}`
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
      userModel.getCurrentProfileImage(username),
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
    req.user = username;
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.redirect('/');
  } catch (err: any) {
    res.render('registration', { reg_err: err.message });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  try {
    res.clearCookie('jwt');
    req.session.destroy((err) => {
      if (err) throw err;
    });
    res.locals = {};
    res.redirect('/login');
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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
  try {
    const requestUser = req.user as any;
    if (!requestUser) throw new Error('User Not Found');
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
    req.user = requestUser.username;
    res.cookie('jwt', token);
    res.redirect('/');
  } catch (err: any) {
    res.locals.error_msg = err.message;
    res.redirect('/login');
  }
};

export const updateSessionController = async (req: Request, res: Response) => {
  try {
    if (res.locals.user.session) {
      const response = await userModel.updateSessionTime(
        res.locals.user.session
      );
      res.json({
        success: response,
      });
    } else {
      throw new Error('No session');
    }
  } catch (error) {
    res.status(500).json(error);
  }
};
