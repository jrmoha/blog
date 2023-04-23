import IError from '../interfaces/error';
import { Request, Response, NextFunction } from 'express';

const errorMiddleware = (
  err: IError,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  !err && next();
  const status = err.status || 500;
  const message = err.message;
  res.status(status).json({
    status,
    message,
  });
};

export default errorMiddleware;
