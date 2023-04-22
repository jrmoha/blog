import db from '../database';
import IError from '../interfaces/error';
import Inbox from '../types/inbox_type';
import Message from '../types/message_type';

class ChatModel {
  /* Chat Area */
  async inboxExists(inbox_id: number): Promise<boolean> {
    try {
      const connection = await db.connect();
      const query = `SELECT * FROM inbox WHERE inbox_id=$1`;
      const { rowCount } = await connection.query(query, [inbox_id]);
      connection.release();
      return rowCount === 1;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async createInbox(
    username1: string,
    username2: string,
    last_message: string
  ): Promise<Inbox> {
    try {
      const connection = await db.connect();
      const query = `INSERT INTO inbox (username1,username2,last_message) VALUES ($1,$2,$3) RETURNING *`;
      const { rows } = await connection.query(query, [
        username1,
        username2,
        last_message,
      ]);
      connection.release();
      return rows[0];
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async sendMessage(
    inbox_id: number,
    sender: string,
    receiver: string,
    message: string
  ): Promise<Message> {
    try {
      const connection = await db.connect();
      const query = `INSERT INTO message (inbox_id,sender_username,receiver_username,message) VALUES ($1,$2,$3,$4) RETURNING *`;
      const { rows } = await connection.query(query, [
        inbox_id,
        sender,
        receiver,
        message,
      ]);
      const update_inbox_query = `UPDATE inbox SET last_message=$1 last_message_time=NOW() WHERE inbox_id=$2`;
      connection.query(update_inbox_query, [message, inbox_id]);
      connection.release();
      return rows[0];
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  // async updateInboxLastMessage(
  //   inbox_id: number,
  //   message: string
  // ): Promise<Inbox> {
  //   try {
  //     const connection = await db.connect();
  //     const query = `UPDATE inbox SET last_message=$1 last_message_time=NOW() WHERE inbox_id=$2 RETURNING *`;
  //     const { rows } = await connection.query(query, [message, inbox_id]);
  //     connection.release();
  //     return rows[0];
  //   } catch (err: any) {
  //     const error: IError = {
  //       message: err.message,
  //       status: err.status || 400,
  //     };
  //     throw error;
  //   }
  // }
  async getUserInbox(username: string): Promise<Inbox[]> {
    try {
      const connection = await db.connect();
      const query = `SELECT * FROM inbox WHERE username1=$1 OR username2=$1`;
      const { rows } = await connection.query(query, [username]);
      connection.release();
      return rows;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async getInboxMessages(inbox_id: number): Promise<Message[]> {
    try {
      const connection = await db.connect();
      const query = `SELECT message_id,sender,receiver,created_at FROM message WHERE inbox_id=$1 ORDER BY created_at DESC`;
      const { rows } = await connection.query(query, [inbox_id]);
      connection.release();
      return rows;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
}

export default new ChatModel();
