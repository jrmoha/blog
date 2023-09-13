import { Server } from 'socket.io';
import http from 'http';
import { decryptMessage, encryptMessage, formatTime } from './utils/functions';
import chatModel from './models/chat.model';
import userModel from './models/user.model';
import Inbox from './types/inbox.type';
import Message from './types/message.type';
import User from './types/user.type';
import { socketAuthenticationMiddleware } from './middleware/socket.middleware';
declare module 'socket.io' {
  interface Socket {
    decoded?: User;
  }
}
export default function (server: http.Server): Server {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
  io.use((socket, next) => {
    socketAuthenticationMiddleware(socket, next);
  });
  io.on('connection', (socket) => {
    socket.on('join', (): void => {
      socket.join(socket.decoded?.username as string);
    });
    socket.on('send-message', async (message) => {
      const current_user = socket.decoded?.username as string;
      const receiver = message.receiver;
      const encryptedMessage = encryptMessage(message.message);
      const inboxId = message.inboxId;
      const result: Message = await chatModel.sendMessage(
        inboxId,
        current_user,
        receiver,
        encryptedMessage
      );
      result.message = decryptMessage(result.message);
      result.sent_at = formatTime(result.sent_at);
      result.sender_image = socket.decoded?.profile_image as string;
      socket.to(receiver).emit('new-message', result);
    });
    socket.on('load-inbox', async () => {
      const current_username = socket.decoded?.username as string;
      const result: Inbox[] = await chatModel.getUserInbox(current_username);
      for (let i = 0; i < result.length; i++) {
        const inbox = result[i];
        inbox.last_message = decryptMessage(inbox.last_message as string);
        inbox.last_message_time = formatTime(inbox.last_message_time as string);
        inbox.sender_image = await userModel.getCurrentProfileImage(
          inbox.username1 === current_username
            ? inbox.username2
            : inbox.username1
        );
      }

      socket.emit('inbox', socket.decoded?.username, result);
    });
    socket.on('load-messages', async (inboxId = undefined, username) => {
      try {
        const current_user = socket.decoded?.username as string;
        if (!inboxId) {
          const find_inbox = await chatModel.findInbox(current_user, username);
          if (!find_inbox) {
            const new_inbox = await chatModel.createInbox(
              current_user,
              username,
              ''
            );
            inboxId = new_inbox.inbox_id;
          } else {
            inboxId = find_inbox.inbox_id;
          }
        }
        const result: any = await chatModel.getInboxMessages(inboxId);
        const sender_image = socket.decoded?.profile_image as string;
        const receiver_image = await userModel.getCurrentProfileImage(username);
        for (let i = 0; i < result.length; i++) {
          result[i].message = decryptMessage(result[i].message);
          result[i].sent_at = formatTime(result[i].sent_at);
          result[i].sender_image =
            result[i].sender === current_user ? sender_image : receiver_image;
          result[i].receiver_image =
            result[i].sender === current_user ? receiver_image : sender_image;
          delete result[i].inbox_id;
        }
        socket.emit('messages', current_user, result);
      } catch (error: any) {
        socket.emit('error', error.message);
      }
    });
    socket.on('send-post', async (post) => {
      const current_user = socket.decoded?.username as string;
      const receivers: any[] = await userModel.getFollowers(current_user);
      for (let i = 0; i < receivers.length; i++) {
        const receiver = receivers[i];
        socket.to(receiver.follower_username).emit('new-post', post);
      }
    });
    socket.on('disconnect', () => {
      console.log(`socket disconnected ${socket.decoded?.username}`);
      socket.leave(socket.decoded?.username as string);
    });
  });
  return io;
}
