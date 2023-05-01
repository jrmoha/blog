import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import config from '../utils/config';

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
        return res.redirect('/login');
      }
    }
    verify(token, config.jwt.secret as string, (err: any, decoded: any) => {
      if (err && (req.url == '/login' || req.url == '/registration')) {
        req.user = undefined;
        res.locals = {};
        return next();
      } else {
        if (err) {
          console.log(err);
          return res.redirect('/login');
        }
      }
      req.user = decoded.user.username;
      res.locals.user = decoded;
    });
    next();
  } catch (error) {
    console.log('error in authenticationMiddleware');
    console.log(error);
  }
};
