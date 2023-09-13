import { verify } from 'jsonwebtoken';
import config from '../utils/config';
import { getJwtFromCookie } from '../utils/functions';

export const socketAuthenticationMiddleware = async (
  socket: any,
  next: any
) => {
  try {
    const token = getJwtFromCookie(socket.request.headers.cookie);
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
        const profile_image = decoded.profile_image;
        decoded.user = { ...decoded.user, profile_image, token };
        socket.decoded = decoded.user;
        next();
      }
    );
  } catch (err) {
    next(err);
  }
};
