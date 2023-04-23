import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import config from '../utils/config';

export const authenticationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).redirect('/login');
    }
    verify(token, config.jwt.secret as string, (err: any, decoded: any) => {
      if (err) {
        return res.status(401).render('404', { title: '404', error: err });
      }
      console.log(decoded);
      res.locals.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(401).redirect('/login');
  }
};
