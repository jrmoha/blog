import db from '../database';
import Post from '../types/post_type';
import Comment from '../types/comment_type';
import IError from '../interfaces/error';
import User from '../types/user_type';
class postModel {
  async getPost(post_id: number): Promise<Post> {
    try {
      const connection = await db.connect();
      const query = `SELECT * FROM post WHERE post_id=$1`;
      const { rows } = await connection.query(query, [post_id]);
      connection.release();
      if (rows.length) {
        return rows[0];
      } else {
        throw { message: 'Post Not Found', status: 404 };
      }
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async getPosts(username: string): Promise<Post[]> {
    try {
      const connection = await db.connect();
      const query = `SELECT * FROM post WHERE username=$1`;
      const { rows } = await connection.query(query, [username]);
      connection.release();
      if (rows.length) {
        return rows;
      } else {
        throw { message: 'Posts Not Found', status: 404 };
      }
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async createPost(username: string, content: string): Promise<Post> {
    try {
      const connection = await db.connect();
      const query = `INSERT INTO post (username,post_content) VALUES ($1,$2) RETURNING *`;
      const { rows } = await connection.query(query, [username, content]);
      connection.release();
      return rows[0];
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async editPost(post_id: number, content: string): Promise<Post> {
    try {
      const connection = await db.connect();
      const query = `UPDATE post SET post_content = $1,update_date=$2 WHERE post_id = $3 RETURNING *`;
      const { rows } = await connection.query(query, [
        content,
        new Date().toISOString().slice(0, 10),
        post_id,
      ]);
      connection.release();
      return rows[0];
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async deletePost(post_id: number): Promise<boolean> {
    try {
      const connection = await db.connect();
      const query = `DELETE FROM post WHERE post_id=$1`;
      const { rowCount } = await connection.query(query, [post_id]);
      connection.release();
      return rowCount == 1;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async likePost(username: string, post_id: number): Promise<boolean> {
    try {
      const connection = await db.connect();
      const query = `INSERT INTO post_like (username,post_id) VALUES ($1,$2)`;
      const { rowCount } = await connection.query(query, [username, post_id]);
      connection.release();
      return rowCount == 1;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async unlikePost(username: string, post_id: number): Promise<boolean> {
    try {
      const connection = await db.connect();
      const query = `DELETE FROM post_like WHERE username=$1 AND post_id=$2`;
      const { rowCount } = await connection.query(query, [username, post_id]);
      connection.release();
      return rowCount == 1;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async addComment(
    username: string,
    post_id: number,
    comment: string
  ): Promise<Comment> {
    try {
      const connection = await db.connect();
      const query = `INSERT INTO post_comment (username,post_id,comment_content) VALUES ($1,$2,$3) returning *`;
      const { rows } = await connection.query(query, [
        username,
        post_id,
        comment,
      ]);
      connection.release();
      return rows[0];
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async editComment(comment_id: number, new_comment: string): Promise<Comment> {
    try {
      const connection = await db.connect();
      const query = `UPDATE post_comment SET comment_content = $1,update_time=NOW() WHERE comment_id=$2 returning *`;
      const { rows } = await connection.query(query, [new_comment, comment_id]);
      connection.release();
      return rows[0];
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async deleteComment(comment_id: number): Promise<boolean> {
    try {
      const connection = await db.connect();
      const query = `DELETE FROM post_comment WHERE comment_id=$1`;
      await connection.query(query, [comment_id]);
      connection.release();
      return true;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async addHashtags(post_id: number, hashtags: string[]): Promise<boolean> {
    try {
      const connection = await db.connect();
      const query = `INSERT INTO post_tags (post_id,tag) VALUES ($1,$2)`;
      hashtags.forEach((hashtag) => {
        connection.query(query, [post_id, hashtag]);
      });
      connection.release();
      return true;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async deleteHashtags(post_id: number): Promise<boolean> {
    try {
      const connection = await db.connect();
      const query = `DELETE FROM post_tags WHERE post_id=$1`;
      const { rowCount } = await connection.query(query, [post_id]);
      connection.release();
      return rowCount == 1;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async checkViewPost(username: string, post_id: number): Promise<boolean> {
    try {
      const connection = await db.connect();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .substring(0, 10);
      const query = `SELECT * FROM view_post WHERE username=$1 AND post_id=$2 AND view_date>$3`;
      const result = await connection.query(query, [
        username,
        post_id,
        sevenDaysAgo,
      ]);
      connection.release();
      return result.rows.length > 0;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async viewPost(username: string, post_id: number): Promise<boolean> {
    try {
      const checkResult = await this.checkViewPost(username, post_id);
      const connection = await db.connect();
      let query = ``;
      let result;
      if (checkResult) {
        query = `UPDATE view_post SET view_date=$1 WHERE username=$2 AND post_id=$3 `;
        query += `AND view_date IN (SELECT view_date FROM view_post WHERE username=$4 AND post_id=$5 ORDER BY view_date DESC LIMIT 1)`;
        result = await connection.query(query, [
          new Date().toISOString(),
          username,
          post_id,
          username,
          post_id,
        ]);
      } else {
        query = `INSERT INTO view_post (username,post_id) VALUES ($1,$2)`;
        result = await connection.query(query, [username, post_id]);
      }
      connection.release();
      return result.rowCount === 1;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 404,
      };
      throw error;
    }
  }
  async getPostsByHashtag(hashtag: string): Promise<Post[]> {
    try {
      const connection = await db.connect();
      const query = `SELECT * FROM post WHERE post_id IN (SELECT post_id FROM post_tags WHERE tag LIKE '${hashtag}%')`;
      const result = await connection.query(query);
      connection.release();
      return result.rows;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async deleteViews(post_id: number): Promise<boolean> {
    try {
      const connection = await db.connect();
      const query = `DELETE FROM view_post WHERE post_id=$1`;
      const result = await connection.query(query, [post_id]);
      connection.release();
      return result.rowCount > 0;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async deleteComments(post_id: number): Promise<boolean> {
    try {
      const connection = await db.connect();
      const query = `DELETE FROM post_comment WHERE post_id=$1`;
      await connection.query(query, [post_id]);
      connection.release();
      return true;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async deleteLikes(post_id: number): Promise<boolean> {
    try {
      const connection = await db.connect();
      const query = `DELETE FROM post_like WHERE post_id=$1`;
      await connection.query(query, [post_id]);
      connection.release();
      return true;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status,
      };
      throw error;
    }
  }
  async getComments(post_id: number): Promise<Comment[]> {
    try {
      const connection = await db.connect();
      const query = `SELECT * FROM post_comment WHERE post_id=$1`;
      const { rows } = await connection.query(query, [post_id]);
      connection.release();
      return rows;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 404,
      };
      throw error;
    }
  }
  async getLikes(post_id: number): Promise<User[]> {
    try {
      const connection = await db.connect();
      const query = `SELECT * FROM post_like WHERE post_id=$1`;
      const { rows } = await connection.query(query, [post_id]);
      connection.release();
      return rows;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 404,
      };
      throw error;
    }
  }
  async getPostsBySearch(query: string): Promise<Post[]> {
    try {
      const connection = await db.connect();
      const { rows } = await connection.query(
        `SELECT * FROM post WHERE post_content LIKE '%${query}%'`
      );
      connection.release();
      return rows;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 404,
      };
      throw error;
    }
  }
}
export default new postModel();
