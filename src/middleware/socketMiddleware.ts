import { verify } from 'jsonwebtoken';
import config from '../utils/config';

export const socketAuthenticationMiddleware = async (
  socket: any,
  next: any
) => {
  try {
    const token = socket.handshake.query.token;
    if (!token) {
      return next(new Error('No token provided'));
    }
    verify(
      token as string,
      config.jwt.secret as string,
      (err: any, decoded: any) => {
        if (err) {
          return next(new Error('Invalid token'));
        }
        socket.decoded = decoded.user;
        next();
      }
    );
  } catch (err) {
    console.log(`err happened ${err}`);
  }
};
