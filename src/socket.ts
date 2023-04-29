import { Server } from 'socket.io';
import http from 'http';
import { decryptMessage, encryptMessage, formatTime } from './utils/functions';
import chatModel from './models/chatModel';
import userModel from './models/userModel';
import Inbox from './types/inbox_type';
import Message from './types/message_type';
import User from './types/user_type';
import { socketAuthenticationMiddleware } from './middleware/socketMiddleware';
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
    socket.on('join', (username): void => {
      socket.join(username);
    });
    socket.on('send-message', async (message) => {
      const sender = message.sender;
      const receiver = message.receiver;
      const encryptedMessage = encryptMessage(message.message);
      const inboxId = message.inboxId;
      const result: Message = await chatModel.sendMessage(
        inboxId,
        sender,
        receiver,
        encryptedMessage
      );
      result.message = decryptMessage(result.message);
      result.sent_at = formatTime(result.sent_at);
      result.sender_image = await userModel.getCurrentProfileImage(sender);
      socket.to(receiver).emit('new-message', result);
    });
    socket.on('load-inbox', async (username) => {
      const result: Inbox[] = await chatModel.getUserInbox(username);
      for (let i = 0; i < result.length; i++) {
        const inbox = result[i];
        inbox.last_message = decryptMessage(inbox.last_message as string);
        inbox.last_message_time = formatTime(inbox.last_message_time as string);
        inbox.sender_image = await userModel.getCurrentProfileImage(
          inbox.username1 === username ? inbox.username2 : inbox.username1
        );
      }
      socket.emit('inbox', result);
    });
    socket.on(
      'load-messages',
      async (inboxId = undefined, sender, username) => {
        try {
          if (!inboxId) {
            const find_inbox = await chatModel.findInbox(sender, username);
            if (!find_inbox) {
              const new_inbox = await chatModel.createInbox(
                sender,
                username,
                ''
              );
              inboxId = new_inbox.inbox_id;
            } else {
              inboxId = find_inbox.inbox_id;
            }
          }
          const result: any = await chatModel.getInboxMessages(inboxId);
          const sender_image = await userModel.getCurrentProfileImage(sender);
          const receiver_image = await userModel.getCurrentProfileImage(
            username
          );
          for (let i = 0; i < result.length; i++) {
            result[i].message = decryptMessage(result[i].message);
            result[i].sent_at = formatTime(result[i].sent_at);
            result[i].sender_image =
              result[i].sender === sender ? sender_image : receiver_image;
            result[i].receiver_image =
              result[i].sender === sender ? receiver_image : sender_image;
            delete result[i].inbox_id;
          }
          socket.emit('messages', result);
        } catch (error: any) {
          socket.emit('error', error.message);
        }
      }
    );
  });
  return io;
}
