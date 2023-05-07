import { verify } from 'jsonwebtoken';
import config from '../utils/config';

export const socketAuthenticationMiddleware = async (
  socket: any,
  next: any
) => {
  function getJwtFromCookie(cookie: string) {
    const parts = cookie.split('; ');
    for (const part of parts) {
      const [name, value] = part.split('=');
      if (name === 'jwt') {
        return value;
      }
    }
    return null;
  }
  try {
    // const token = socket.handshake.query.token;
    // console.log(socket.request.headers.cookie);

    // const token =
    //   socket.request.headers.cookie?.split('=')[2] ||
    //   socket.request.headers.cookie?.split('=')[1];
    //   console.log(`token is ${token}`);
    const token = getJwtFromCookie(socket.request.headers.cookie);
    console.log(`token is ${token}`);
    
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
    console.log(`err happened ${err}`);
  }
};
