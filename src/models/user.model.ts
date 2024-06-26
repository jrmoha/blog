import db from '../database';
import User from '../types/user.type';
import IError from '../interfaces/error.interface';
import Options from '../types/options.type';
import { PoolClient } from 'pg';
import postModel from './post.model';
import {
  comparePassword,
  hashPassword,
  formatUserStatusTime,
  addBasicDataToPosts,
} from '../utils/functions';
import Post from '../types/post.type';
import config from '../utils/config';
import Activity from '../types/activity.type';

class userModel {
  async user_exists(username: string): Promise<boolean> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `SELECT username FROM users WHERE username=$1`;
      const res = await connection.query(query, [username]);
      connection.release();
      return res.rows.length > 0;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async username_email_taken(
    username: string,
    email: string
  ): Promise<boolean> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `SELECT username,email FROM users WHERE username=$1 OR email=$2`;
      const res = await connection.query(query, [username, email]);
      connection.release();
      if (res.rows.length === 0) {
        return false;
      } else {
        const err: IError = {
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
      const error: IError = {
        message: err.message,
        status: err.status || 400,
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
    birth_date: string
  ): Promise<User> {
    const userEx = await this.username_email_taken(username, email);
    if (userEx) {
      throw userEx;
    } else {
      const connection: PoolClient = await db.connect();
      let query = `INSERT INTO users (username,email,password,first_name,last_name,birth_date) `;
      query += `VALUES ($1,$2,$3,$4,$5,$6) RETURNING username,email,first_name,last_name`;

      const hashedPassword = await hashPassword(password);

      const { rows } = await connection.query(query, [
        username,
        email,
        hashedPassword,
        first_name,
        last_name,
        birth_date,
      ]);
      connection.release();
      return rows[0];
    }
  }
  async getUserByUsername(username: string): Promise<User> {
    try {
      const connection: PoolClient = await db.connect();
      let query = `SELECT username,first_name,last_name,(SELECT MAX (img_src) AS "profile_image" FROM user_image WHERE username=$1)`;
      query += `,(SELECT COUNT(follower_username) AS "followings_number" FROM follow WHERE follower_username=$1),`;
      query += `(SELECT COUNT(followed_username) AS "followers_number" FROM follow WHERE followed_username=$1),`;
      query += `(SELECT bio FROM options WHERE username=$1) `;
      query += `FROM users WHERE username=$1`;
      const { rows } = await connection.query(query, [username]);
      connection.release();
      if (rows[0].profile_image == null) {
        rows[0].profile_image = config.default_profile_image;
      }
      if (rows[0]) {
        return rows[0];
      }
      const err: IError = {
        message: `This User Doesn't Exist`,
        status: 404,
      };
      throw err;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async authenticateUser(username: string, password: string): Promise<User> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `SELECT username,email,password,first_name,last_name FROM users WHERE username=$1 OR email=$1`;
      const result = await connection.query(query, [username]);
      connection.release();
      const err: IError = {
        name: 'Authentication Error',
        message: ``,
        status: 404,
      };
      if (result.rows.length == 0) {
        err.message = `This Username Doesn't Exist`;
        throw err;
      } else {
        const user = result.rows[0];
        const isMatch = await comparePassword(password, user.password);
        delete user.password;
        if (isMatch) {
          return user;
        } else {
          err.message = `This Password Isn't Correct.`;
          throw err;
        }
      }
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async addActivity(
    username: string,
    activity_title: string
  ): Promise<boolean> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `INSERT INTO activity (username,activity) VALUES ($1,$2)`;
      const res = await connection.query(query, [username, activity_title]);
      connection.release();
      return res.rowCount == 1;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
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
      const connection: PoolClient = await db.connect();
      const result = await connection.query(query, [username, activity_title]);
      connection.release();
      return result.rowCount == 1;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async getActivities(username: string, offset: number): Promise<Activity[]> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `SELECT activity,activity_date FROM activity WHERE username=$1 ORDER BY activity_date DESC LIMIT $2 OFFSET $3`;
      const { rows } = await connection.query(query, [
        username,
        config.activity_page_size,
        (offset - 1) * config.activity_page_size,
      ]);
      return rows;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async getActivitiesCount(username: string): Promise<number> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `SELECT COUNT(*) FROM activity WHERE username=$1`;
      const { rows } = await connection.query(query, [username]);
      return parseInt(rows[0].count);
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async insertSession(
    session_id: string,
    username: string,
    remoteAddress: string
  ): Promise<boolean> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `INSERT INTO user_session(session_id,username,ip_address) VALUES($1,$2,$3)`;
      const { rowCount } = await connection.query(query, [
        session_id,
        username,
        remoteAddress,
      ]);
      connection.release();
      return rowCount == 1;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async insert_search(
    username: string,
    search_title: string
  ): Promise<boolean> {
    try {
      const connection: PoolClient = await db.connect();
      const check_query = `SELECT * FROM user_search WHERE username=$1 AND search=$2`;
      const check_result = await connection.query(check_query, [
        username,
        search_title,
      ]);
      let query = ``;
      if (check_result.rowCount >= 1) {
        query = `UPDATE user_search SET search_date=NOW() WHERE username=$1 AND search=$2`;
      } else {
        query = `INSERT INTO user_search(username,search) VALUES ($1,$2)`;
      }
      const { rowCount } = await connection.query(query, [
        username,
        search_title,
      ]);
      connection.release();
      return rowCount == 1;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async searchHistory(username: string): Promise<string[]> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `SELECT search,search_date FROM user_search WHERE username=$1 ORDER BY search_date DESC LIMIT $2`;
      const { rows } = await connection.query(query, [
        username,
        config.history_page_size,
      ]);
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
  async clearHistory(username: string): Promise<boolean> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `DELETE FROM user_search WHERE username=$1`;
      const { rowCount } = await connection.query(query, [username]);
      connection.release();
      return rowCount > 0;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 500,
      };
      throw error;
    }
  }
  async deleteSearch(username: string, search_title: string): Promise<boolean> {
    try {
      const connection: PoolClient = await db.connect();
      let query = `DELETE FROM user_search `;
      query += `WHERE search IN (SELECT search FROM user_search WHERE username=$1 AND search=$2 ORDER BY search_date DESC LIMIT 1)`;
      const result = await connection.query(query, [username, search_title]);
      connection.release();
      return result.rowCount >= 1;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async follow(
    follower_username: string,
    followed_username: string
  ): Promise<boolean | IError> {
    try {
      const connection: PoolClient = await db.connect();
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
        connection.release();
        return reuslt.rowCount == 1;
      }
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async unfollow(username: string, unfollowed: string): Promise<boolean> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `DELETE FROM follow WHERE follower_username=$1 AND followed_username=$2`;
      const { rowCount } = await connection.query(query, [
        username,
        unfollowed,
      ]);
      connection.release();
      return rowCount == 1;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async deleteFollower(username: string, follower: string): Promise<boolean> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `UPDATE follow SET follow_status=0 WHERE follower_username=$1 AND followed_username=$2`;
      const { rowCount } = await connection.query(query, [follower, username]);
      connection.release();
      return rowCount == 1;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async initOptions(username: string): Promise<Options> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `INSERT INTO options (username) VALUES ($1)`;
      const { rows } = await connection.query(query, [username]);
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
  async editOptions(username: string, options: any): Promise<Options> {
    try {
      const connection: PoolClient = await db.connect();
      const keys: string[] = Object.keys(options);
      const values = Object.values(options);
      if (keys.length === 0) throw new Error('No Updates Provided');
      let query = `UPDATE options SET `;
      query += `${keys.map(
        (key, index) => `${key}=$${index + 1}`
      )} WHERE username=$${keys.length + 1}`;
      const { rows } = await connection.query(query, [...values, username]);
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
  async updateUser(
    username: string,
    updates: Partial<Omit<User, 'username'>>
  ): Promise<User> {
    try {
      const keys: string[] = Object.keys(updates);
      const values = Object.values(updates);
      if (keys.length === 0) throw new Error('No Updates Provided');
      const connection: PoolClient = await db.connect();
      let query = `UPDATE users SET `;
      query += `${keys.map(
        (key, index) => `${key}=$${index + 1}`
      )} WHERE username=$${keys.length + 1} `;
      query += `RETURNING username,email,first_name,last_name,birth_date;`;
      const { rows } = await connection.query(query, [...values, username]);
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
  async changePassword(
    username: string,
    new_password: string
  ): Promise<boolean> {
    try {
      // const error: IError = {
      //   message: '',
      //   status: 403,
      // };
      // if (old_password === new_password) {
      //   error.message = `New Password Can't Be The Same As Old One.`;
      //   throw error;
      // }
      const connection: PoolClient = await db.connect();
      // const old_password_query = `SELECT password FROM users WHERE username=$1`;
      // const { rows } = await connection.query(old_password_query, [username]);
      // const old_password_match: boolean = await comparePassword(
      //   old_password,
      //   rows[0].password
      // );
      // if (!old_password_match) {
      //   error.message = `This Password Doesn't Match Your Old One.`;
      //   throw error;
      // }
      const hashed_new_password = await hashPassword(new_password);
      const update_query = `UPDATE users SET password=$1 WHERE username=$2`;
      const { rowCount } = await connection.query(update_query, [
        hashed_new_password,
        username,
      ]);
      connection.release();
      return rowCount == 1;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400 || 400,
      };
      throw error;
    }
  }
  async deleteUser(username: string, password: string): Promise<boolean> {
    try {
      const connection: PoolClient = await db.connect();
      const password_query = `SELECT password FROM users WHERE username=$1`;
      const { rows } = await connection.query(password_query, [username]);
      const password_check = await comparePassword(password, rows[0].password);
      if (!password_check)
        throw new Error(`This Password Ain't Match Your Old One.`);
      const delete_query = `DELETE FROM users WHERE username=$1`;
      const { rowCount } = await connection.query(delete_query, [username]);
      return rowCount == 1;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async getFollowers(current_username: string): Promise<User[]> {
    try {
      const connection: PoolClient = await db.connect();
      let query = `SELECT f.follower_username,u.first_name,u.last_name,`;
      query += `(SELECT MAX(ui.img_src) AS "img_src" FROM user_image ui WHERE ui.username=f.follower_username) `;
      query += `FROM follow f JOIN users u ON u.username=f.follower_username `;
      query += `WHERE f.followed_username=$1 AND f.follow_status=1`;
      const { rows } = await connection.query(query, [current_username]);
      connection.release();
      for (const row of rows) {
        if (!row.img_src) row.img_src = config.default_profile_image;
      }
      return rows;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async getFollowings(current_username: string): Promise<User[]> {
    try {
      const connection: PoolClient = await db.connect();
      let query = `SELECT f.followed_username,u.first_name,u.last_name,`;
      query += `(SELECT MAX(ui.img_src) AS "img_src" FROM user_image ui WHERE ui.username=f.followed_username) `;
      query += `FROM follow f JOIN users u ON u.username=f.followed_username `;
      query += `WHERE f.follower_username=$1 AND f.follow_status=1`;
      const { rows } = await connection.query(query, [current_username]);
      connection.release();
      for (const row of rows) {
        if (!row.img_src) row.img_src = config.default_profile_image;
      }
      return rows;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async deleteOptions(username: string): Promise<boolean> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `DELETE FROM options WHERE username=$1`;
      const { rowCount } = await connection.query(query, [username]);
      connection.release();
      return rowCount == 1;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async deleteFollowers(username: string): Promise<boolean> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `DELETE FROM follow WHERE followed_username=$1`;
      const { rowCount } = await connection.query(query, [username]);
      connection.release();
      return rowCount > 0;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async deleteFollowings(username: string): Promise<boolean> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `DELETE FROM follow WHERE follower_username=$1`;
      const { rowCount } = await connection.query(query, [username]);
      connection.release();
      return rowCount > 0;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async updateSessionTime(session_id: string): Promise<boolean> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `UPDATE user_session SET update_time=$1 WHERE session_id=$2`;
      const { rowCount } = await connection.query(query, ['NOW()', session_id]);
      connection.release();
      return rowCount == 1;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async lastseen(username: string): Promise<object> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `SELECT MAX(update_time) AS "update_time" FROM user_session WHERE username=$1`;
      const { rows } = await connection.query(query, [username]);
      connection.release();
      return formatUserStatusTime(rows[0].update_time); //turns date time into human readable time with status whether online or offline
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async insertProvider(
    provider_id: number,
    provider_name: string,
    username: string
  ): Promise<boolean> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `INSERT INTO provider (provider_id, provider_name, username) VALUES ($1, $2, $3)`;
      const { rowCount } = await connection.query(query, [
        provider_id,
        provider_name,
        username,
      ]);
      connection.release();
      return rowCount == 1;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async findOrCreate(profile: any): Promise<any> {
    try {
      const connection: PoolClient = await db.connect();
      const search_user_exists_query = `SELECT username FROM provider WHERE provider_id=$1`;
      const search_user_exists_result = await connection.query(
        search_user_exists_query,
        [profile.id]
      );
      connection.release();
      if (search_user_exists_result.rowCount == 0) {
        const username =
          profile._json.login ||
          profile._json.email.split('@')[0] + profile._json.sub.slice(0, 5);
        const user: User = await this.registerUser(
          username,
          `${profile.id}${profile._json.email}`,
          profile._json.email,
          profile._json.given_name || profile._json.name.split(' ')[0],
          profile._json.family_name || profile._json.name.split(' ').slice(1).join(' '),
          `NOW()`
        );
        const insert_provider: boolean = await this.insertProvider(
          profile.id,
          profile.provider,
          user.username
        );
        if (!insert_provider) {
          return null;
        } else {
          Promise.all([
            this.initOptions(user.username),
            this.addActivity(
              user.username,
              `You Created This Account Via ${profile.provider}`
            ),
            this.getCurrentProfileImage(user.username),
          ]);
          profile.username = user.username;
          profile.user = user;
        }
      } else {
        const user: User = await this.getUserByUsername(
          search_user_exists_result.rows[0].username
        );
        profile.username = user.username;
        profile.user = user;
      }
      return profile;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async allOnlineUsers(): Promise<User[]> {
    try {
      const connection: PoolClient = await db.connect();
      let query = `SELECT username FROM user_session WHERE update_time>=NOW()-INTERVAL '30 seconds' `;
      query += `GROUP BY username`;
      const { rows } = await connection.query(query);
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
  async friendsStatus(username: string): Promise<User[]> {
    try {
      const connection = await db.connect();
      let query = `SELECT f.followed_username,MAX(u.update_time) AS lastseen,`;
      query += `(SELECT show_status FROM options WHERE username=f.followed_username) `;
      query += `FROM follow f `;
      query += `JOIN user_session u ON u.username=f.followed_username `;
      query += `WHERE f.follower_username=$1 AND f.follow_status=1 `;
      query += `GROUP BY f.followed_username `;
      query += `ORDER BY lastseen DESC;`;
      const { rows } = await connection.query(query, [username]);
      connection.release();
      for (const row of rows) {
        if (row.show_status) row.lastseen = formatUserStatusTime(row.lastseen);
        else row.lastseen = { currnet_status: 'offline', lastactive: 'never' };
        row.user_image = await this.getCurrentProfileImage(
          row.followed_username
        );
      }
      return rows;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async isFollowing(
    follower: string,
    followed: string
  ): Promise<number | null> {
    try {
      const connection = await db.connect();
      const query = `SELECT follow_status FROM follow WHERE follower_username=$1 AND followed_username=$2 AND follow_status=1`;
      const { rows } = await connection.query(query, [follower, followed]);
      connection.release();
      return rows.length > 0 ? rows[0].follow_status : null;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async follow_status(
    current_username: string,
    profile_username: string
  ): Promise<number | null> {
    try {
      const connection = await db.connect();
      const query = `SELECT follow_status FROM follow WHERE follower_username=$1 AND followed_username=$2`;
      const { rows } = await connection.query(query, [
        current_username,
        profile_username,
      ]);
      connection.release();
      return rows.length > 0 ? rows[0].follow_status : null;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async loadProfile(
    current_username: string,
    profile_username: string
  ): Promise<any> {
    try {
      const final_result: any = {};
      const all_result = await Promise.all([
        this.getUserByUsername(profile_username),
        this.isFollowing(current_username, profile_username),
        postModel.getPosts(profile_username),
        this.getCurrentProfileImage(profile_username),
      ]);
      await addBasicDataToPosts(all_result[2]);
      final_result.basic_info = all_result[0];
      final_result.following_status = all_result[1];
      final_result.posts = all_result[2];
      return final_result;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async insertDefaultImage(username: string): Promise<string> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `INSERT INTO user_image (username,img_src) VALUES ($1,$2) RETURNING img_src`;
      const { rows } = await connection.query(query, [
        username,
        config.default_profile_image,
      ]);
      connection.release();
      return rows[0].image;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async insertProfileImage(
    username: string,
    image: string
  ): Promise<string | null> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `INSERT INTO user_image (username,img_src) VALUES ($1,$2) RETURNING img_src`;
      const { rows } = await connection.query(query, [username, image]);
      connection.release();
      return rows[0].img_src;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async getUserImages(username: string): Promise<string[]> {
    try {
      const connection: PoolClient = await db.connect();
      const query = `SELECT img_src FROM user_image WHERE username=$1 ORDER BY img_src DESC`;
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
  async getCurrentProfileImage(username: string): Promise<string> {
    try {
      const connection = await db.connect();
      const query = `SELECT MAX(img_src) AS "img_src" FROM user_image WHERE username=$1`;
      const { rows } = await connection.query(query, [username]);
      connection.release();
      if (!rows[0].img_src) return config.default_profile_image as string;
      return rows[0].img_src;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async getOptions(username: string): Promise<Options> {
    try {
      const connection = await db.connect();
      const query = `SELECT * FROM options WHERE username=$1`;
      const { rows } = await connection.query(query, [username]);
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
  async getFeed(username: string, page = 0): Promise<Post[]> {
    try {
      const connection = await db.connect();
      let query = `SELECT p.post_id,p.username,p.upload_date,p.update_date,p.post_content `;
      query += `FROM post p `;
      query += `WHERE  p.username=$1 OR p.username IN `;
      query += `(SELECT followed_username FROM follow WHERE follower_username=$1 AND follow_status=1) `;
      query += `ORDER BY p.update_date DESC `;
      query += `LIMIT $2 OFFSET $3`;
      const { rows } = await connection.query(query, [
        username,
        config.limit_post_per_page,
        page * config.limit_post_per_page,
      ]);
      connection.release();
      await addBasicDataToPosts(rows);
      return rows;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async deleteUserImage(username: string, image: string): Promise<string> {
    try {
      const connection = await db.connect();
      const query = `DELETE FROM user_image WHERE username=$1 AND img_src=$2`;
      await connection.query(query, [username, image]);
      connection.release();
      return await this.getCurrentProfileImage(username);
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 400,
      };
      throw error;
    }
  }
  async searchUserByUsernameOrFullName(
    current_username: string,
    search_query: string,
    page = 1
  ): Promise<User[]> {
    try {
      const connection = await db.connect();
      // let query = ` SELECT u.username, u.first_name || ' ' || u.last_name AS "full_name",`;
      // query += `(SELECT MAX(img_src) AS "profile_image" FROM user_image WHERE username=u.username),`;
      // query += `(SELECT follow_status FROM follow WHERE followed_username=u.username AND follower_username=$1) `;
      // query += `FROM users u `;
      // query += `WHERE u.username LIKE $2 OR (u.first_name || ' ' || u.last_name) LIKE $2 `;
      // query += `LIMIT $3 OFFSET $4`;

      let query = `SELECT u.username, u.first_name || ' ' || u.last_name AS "full_name",f.follow_status,`;
      query += `(SELECT MAX(img_src) AS "profile_image" FROM user_image WHERE username=u.username) `;
      query += `FROM users u `;
      query += `LEFT JOIN follow f ON f.followed_username=u.username AND f.follower_username=$1 `;
      query += `WHERE u.username LIKE $2 OR (u.first_name || ' ' || u.last_name) LIKE $2 `;
      query += `GROUP BY u.username,f.follow_status `;
      query += `ORDER BY CASE WHEN follow_status = 1 THEN 1 `;
      query += `WHEN follow_status IS NULL THEN 2 `;
      query += `WHEN follow_status =0 THEN 3 `;
      query += `END ASC,`;
      query += `follow_status ASC `;
      query += `LIMIT $3 OFFSET $4`;

      const { rows } = await connection.query(query, [
        current_username,
        `%${search_query}%`,
        config.limit_users_per_search,
        (page - 1) * config.limit_users_per_search,
      ]);
      connection.release();
      rows.forEach((row: any) => {
        if (!row.profile_image)
          row.profile_image = config.default_profile_image;
        if (row.username === current_username) row.follow_status = 0;
      });
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
export default new userModel();
