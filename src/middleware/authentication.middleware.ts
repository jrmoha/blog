import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import config from '../utils/config';
import userModel from '../models/user.model';

export const authenticationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      if (req.url == '/login' || req.url == '/registration') {
        req.user = undefined;
        res.locals = {};
        return next();
      } else {
        console.log('No token found');
        
        // return res.redirect('/login');
      }
    }
    verify(
      token,
      config.jwt.secret as string,
      async (err: any, decoded: any) => {
        if (err && (req.url == '/login' || req.url == '/registration')) {
          req.user = undefined;
          res.locals = {};
          return next();
        } else {
          if (err) {
            res.clearCookie('jwt');
            req.session.destroy((err) => {
              if (err) throw next(err);
              console.log('Token is invalid');
              
              return res.redirect('/login');
            });
          }
        }
        const username = decoded.user.username;
        const user_exists = await userModel.user_exists(username);
        if (!user_exists) {
          res.clearCookie('jwt');
          req.session.destroy((err) => {
            if (err) throw next(err);
            return res.redirect('/login');
          });
        }
        req.user = decoded.user.username;
        res.locals.user = decoded;
      }
    );
    next();
  } catch (error) {
    next(error);
  }
};
