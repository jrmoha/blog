import { Server } from 'socket.io';
import http from 'http';
export default function (server: http.Server): Server {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
  });
  return io;
}
