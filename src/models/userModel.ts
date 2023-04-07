import db from '../database';
import User from '../types/user_type';
import Error from '../interfaces/error';
import bcryptjs from 'bcryptjs';
import Options from '../types/options_type';

class userModel {
  async userExists(username: string, email: string): Promise<boolean> {
    try {
      const connection = await db.connect();
      const query = `SELECT username,email FROM users WHERE username=$1 OR email=$2`;
      const res = await connection.query(query, [username, email]);
      connection.release();
      if (res.rows.length === 0) {
        return false;
      } else {
        const err: Error = {
          message: '',
          status: 409,
        };
        if (res.rows[0].username == username) {
          err.message = 'This Username Is Used By Another User';
        } else if (res.rows[0].email == email) {
          err.message = 'This Email Is Used By Another User';
        }
        throw err;
      }
    } catch (err: any) {
      const error: Error = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async registerUser(
    username: string,
    password: string,
    email: string,
    first_name: string,
    last_name: string,
    birth_date: Date
  ): Promise<User> {
    const userEx = await this.userExists(username, email);
    if (userEx) {
      throw userEx;
    } else {
      const connection = await db.connect();
      let query = `INSERT INTO users (username,email,password,first_name,last_name,birth_date) `;
      query += `VALUES ($1,$2,$3,$4,$5,$6) RETURNING username,email,first_name,last_name`;
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);
      const res = await connection.query(query, [
        username,
        email,
        hashedPassword,
        first_name,
        last_name,
        birth_date,
      ]);
      connection.release();
      return res.rows[0];
    }
  }
  async authenticateUser(username: string, password: string): Promise<User> {
    try {
      const connection = await db.connect();
      const query = `SELECT username,email,password,first_name,last_name FROM users WHERE username=$1`;
      const result = await connection.query(query, [username]);
      const err: Error = {
        name: 'Authentication Error',
        message: ``,
        status: 401,
      };
      if (result.rows.length == 0) {
        err.message = `This Username Doesn't Exist`;
        throw err;
      } else {
        const user = result.rows[0];
        const isMatch = bcryptjs.compareSync(password, user.password);
        delete user.password;
        if (isMatch) {
          return user;
        } else {
          err.message = `This Password Isn't Correct.`;
          throw err;
        }
      }
    } catch (err: any) {
      const error: Error = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async addActivity(
    username: string,
    activity_title: string
  ): Promise<boolean> {
    try {
      const connection = await db.connect();
      const query = `INSERT INTO activity (username,activity) VALUES ($1,$2)`;
      const res = await connection.query(query, [username, activity_title]);
      connection.release();
      return res.rowCount == 1;
    } catch (err: any) {
      const error: Error = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async deleteActivity(
    username: string,
    activity_title: string
  ): Promise<boolean> {
    try {
      let query = `DELETE FROM activity WHERE username=$1 `;
      query += `AND activity IN (SELECT activity FROM activity WHERE username=$1 AND activity=$2 ORDER BY activity_date DESC LIMIT 1)`;
      const connection = await db.connect();
      const result = await connection.query(query, [username, activity_title]);
      connection.release();
      return result.rowCount == 1;
    } catch (err: any) {
      const error: Error = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async getActivities(username: string): Promise<string[]> {
    try {
      const connection = await db.connect();
      const query = `SELECT activity,activity_date FROM activity WHERE username=$1`;
      const result = await connection.query(query, [username]);
      return result.rows;
    } catch (err: any) {
      const error: Error = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async insertSession(username: string, session_id: string): Promise<boolean> {
    try {
      const connection = await db.connect();
      const query = `INSERT INTO user_session(username,session_id) VALUES($1,$2)`;
      const result = await connection.query(query, [username, session_id]);
      connection.release();
      return result.rowCount == 1;
    } catch (err: any) {
      const error: Error = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async search(username: string, search_title: string): Promise<boolean> {
    try {
      const connection = await db.connect();
      const query = `INSERT INTO user_search(username,search) VALUES ($1,$2)`;
      const result = await connection.query(query, [username, search_title]);
      connection.release();
      return result.rowCount == 1;
    } catch (err: any) {
      const error: Error = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async searchHistory(username: string): Promise<string[]> {
    try {
      const connection = await db.connect();
      const query = `SELECT search FROM user_search WHERE username=$1 ORDER BY search_date DESC`;
      const result = await connection.query(query, [username]);
      connection.release();
      return result.rows;
    } catch (err: any) {
      const error: Error = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async deleteSearch(username: string, search_title: string): Promise<boolean> {
    try {
      const connection = await db.connect();
      let query = `DELETE FROM user_search `;
      query += `WHERE search IN (SELECT search FROM user_search WHERE username=$1 AND search=$2 ORDER BY search_date DESC LIMIT 1)`;
      const result = await connection.query(query, [username, search_title]);
      connection.release();
      return result.rowCount == 1;
    } catch (err: any) {
      const error: Error = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async follow(
    follower_username: string,
    followed_username: string
  ): Promise<boolean | Error> {
    try {
      const connection = await db.connect();
      const check_query = `SELECT * FROM follow WHERE follower_username=$1 AND followed_username=$2 AND follow_status=0`;
      const check_result = await connection.query(check_query, [
        follower_username,
        followed_username,
      ]);
      if (check_result.rows.length > 0) {
        throw new Error(`This Follower Already Been Deleted.`);
      } else {
        const query = `INSERT INTO follow(follower_username,followed_username) VALUES ($1,$2)`;
        const reuslt = await connection.query(query, [
          follower_username,
          followed_username,
        ]);
        return reuslt.rowCount == 1;
      }
      connection.release();
    } catch (err: any) {
      const error: Error = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async unfollow(username: string, unfollowed: string): Promise<boolean> {
    try {
      const connection = await db.connect();
      const query = `DELETE FROM follow WHERE follower_username=$1 AND followed_username=$2`;
      const result = await connection.query(query, [username, unfollowed]);
      connection.release();
      return result.rowCount == 1;
    } catch (err: any) {
      const error: Error = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async deleteFollower(username: string, follower: string): Promise<boolean> {
    try {
      const connection = await db.connect();
      const query = `UPDATE follow SET follow_status=0 WHERE follower_username=$1 AND followed_username=$2`;
      const result = await connection.query(query, [follower, username]);
      connection.release();
      return result.rowCount == 1;
    } catch (err: any) {
      const error: Error = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async initOptions(username: string): Promise<Options> {
    try {
      const connection = await db.connect();
      const query = `INSERT INTO options (username) VALUES ($1)`;
      const result = await connection.query(query, [username]);
      connection.release();
      return result.rows[0];
    } catch (err: any) {
      const error: Error = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async editOption(
    username: string,
    option: string,
    value: string
  ): Promise<Options> {
    try {
      const connection = await db.connect();
      const query = `UPDATE options SET ${option}=$1 WHERE username=$2`;
      const result = await connection.query(query, [value, username]);
      connection.release();
      return result.rows[0];
    } catch (err: any) {
      const error: Error = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
}

export default new userModel();
