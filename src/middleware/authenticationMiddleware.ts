import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import config from '../utils/config';

export const authenticationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;
    if (!token) throw new Error('No token');
    verify(token, config.jwt.secret as string, (err: any, decoded: any) => {
      if (err) throw new Error('Invalid token');
      req.user = decoded.user.username;
      res.locals.user = decoded;
      next();
    });
  } catch (error) {
    console.log('error in authenticationMiddleware');
    console.log(error);
  }
};
