import db from '../database';
import IError from '../interfaces/error.interface';
import Inbox from '../types/inbox.type';
import Message from '../types/message.type';

class ChatModel {
  /* Chat Area */
  async inboxExists(
    username1: string,
    username2: string
  ): Promise<Inbox | null> {
    //useless i guess
    try {
      const connection = await db.connect();
      const query = `SELECT inbox_id FROM inbox WHERE (username1=$1 AND username2=$2) OR (username1=$2 AND username2=$1)`;
      const { rows } = await connection.query(query, [username1, username2]);
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
  async findInbox(username1: string, username2: string): Promise<Inbox> {
    try {
      const connection = await db.connect();
      const query = `SELECT inbox_id FROM inbox WHERE (username1=$1 AND username2=$2) OR (username1=$2 AND username2=$1)`;
      const { rows } = await connection.query(query, [username1, username2]);
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
  async createInbox(
    username1: string,
    username2: string,
    last_message: string
  ): Promise<Inbox> {
    try {
      const connection = await db.connect();
      const query = `INSERT INTO inbox (username1,username2,last_message) VALUES ($1,$2,$3) RETURNING inbox_id`;
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
  // async findOrCreateInbox(
  //   username1: string,
  //   username2: string,
  //   last_message: string
  // ): Promise<Inbox> {
  //   try {
  //     const connection = await db.connect();
  //     const check_query = `SELECT * FROM inbox WHERE (username1=$1 AND username2=$2) OR (username1=$2 AND username2=$1)`;
  //     const check_result = await connection.query(check_query, [
  //       username1,
  //       username2,
  //     ]);
  //     if (check_result.rowCount === 1) {
  //       return check_result.rows[0];
  //     }
  //     const query = `INSERT INTO inbox (username1,username2,last_message) VALUES ($1,$2,$3) RETURNING *`;
  //     const { rows } = await connection.query(query, [
  //       username1,
  //       username2,
  //       last_message,
  //     ]);
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
  async sendMessage(
    inbox_id: number | undefined,
    sender: string,
    receiver: string,
    message: string
  ): Promise<Message> {
    try {
      if (!inbox_id) {
        const find_inbox = await this.findInbox(sender, receiver);
        if (!find_inbox) {
          const new_inbox = await this.createInbox(sender, receiver, message);
          inbox_id = new_inbox.inbox_id;
        } else {
          inbox_id = find_inbox.inbox_id;
        }
      }

      const connection = await db.connect();
      const query = `INSERT INTO message (inbox_id,sender_username,receiver_username,message) VALUES ($1,$2,$3,$4) RETURNING *`;
      const { rows } = await connection.query(query, [
        inbox_id,
        sender,
        receiver,
        message,
      ]);
      const update_inbox_query = `UPDATE inbox SET last_message=$1,last_message_time=$2 WHERE inbox_id=$3`;
      await connection.query(update_inbox_query, [message, 'NOW()', inbox_id]);
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
  //     const query = `UPDATE inbox SET last_message=$1,last_message_time=$2 WHERE inbox_id=$3 RETURNING *`;
  //     const { rows } = await connection.query(query, [
  //       message,
  //       'NOW()',
  //       inbox_id,
  //     ]);
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
      const query = `SELECT * FROM inbox WHERE username1=$1 OR username2=$1 ORDER BY last_message_time DESC`;
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
      const query = `SELECT * FROM message WHERE inbox_id=$1 ORDER BY sent_at ASC`;
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
