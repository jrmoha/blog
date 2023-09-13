import db from '../database';
import Post from '../types/post.type';
import Comment from '../types/comment.type';
import IError from '../interfaces/error.interface';
import User from '../types/user.type';
import config from '../utils/config';
import { addBasicDataToPosts, formatTime } from '../utils/functions';
import userModel from './user.model';
const { trending_num } = config;
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
      return rows;
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
        `NOW()`,
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
  async deletePostImages(post_id: number): Promise<boolean> {
    try {
      const connection = await db.connect();
      const query = `DELETE FROM post_image WHERE post_id=$1`;
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
  async deletePost(post_id: number): Promise<boolean> {
    try {
      Promise.all([
        this.deleteComments(post_id),
        this.deleteLikes(post_id),
        this.deleteHashtags(post_id),
        this.deleteViews(post_id),
        this.deletePostImages(post_id),
      ]);
      const connection = await db.connect();
      const query = `DELETE FROM post WHERE post_id=$1`;
      const { rowCount } = await connection.query(query, [post_id]);
      connection.release();
      return rowCount === 1;
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
      return rows[0].comment_content;
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
      const query = `SELECT * FROM view_post WHERE username=$1 AND post_id=$2 AND view_date>=NOW()-INTERVAL '7 days'`;
      const result = await connection.query(query, [username, post_id]);
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
        query += `AND view_date IN (SELECT view_date FROM view_post WHERE username=$2 AND post_id=$3 ORDER BY view_date DESC LIMIT 1)`;
        result = await connection.query(query, [`NOW()`, username, post_id]);
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
  async getPostsByHashtag(hashtag: string, offset: number): Promise<Post[]> {
    try {
      const connection = await db.connect();
      let query = `SELECT * FROM post WHERE post_id IN (SELECT post_id FROM post_tags WHERE tag LIKE '${hashtag}%')`;
      query += `ORDER BY update_date DESC LIMIT $1 OFFSET $2`;
      const { rows } = await connection.query(query, [
        config.limit_post_per_page,
        offset * config.limit_post_per_page,
      ]);
      connection.release();
      return rows;
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
      const query = `SELECT * FROM post_comment WHERE post_id=$1 ORDER BY comment_time DESC`;
      const { rows } = await connection.query(query, [post_id]);
      connection.release();
      for (const row of rows) {
        row.user_image = await userModel.getCurrentProfileImage(row.username);
        row.comment_time = formatTime(row.comment_time);
      }
      return rows;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 404,
      };
      throw error;
    }
  }
  async getLikes(post_id: number, username: string): Promise<User[]> {
    try {
      const connection = await db.connect();
      let query = `SELECT p.username,`;
      query += `(SELECT MAX(img_src) AS "image" FROM user_image WHERE username=p.username ),`;
      query += `(SELECT follow_status FROM follow WHERE follower_username=$1 AND followed_username=p.username) `;
      query += `FROM post_like p WHERE p.post_id=$2`;
      const { rows } = await connection.query(query, [username, post_id]);
      connection.release();
      for (const row of rows) {
        if (!row.image) row.image = 'default_user.jpg';
      }
      return rows;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 404,
      };
      throw error;
    }
  }
  async getPostsBySearch(
    current_username: string,
    q: string,
    page = 1
  ): Promise<Post[]> {
    try {
      const connection = await db.connect();
      let query = `SELECT p.post_id,p.post_content,p.update_date,p.upload_date,p.username,`;
      query += `(SELECT first_name||' '||last_name AS "full_name" FROM users WHERE username=p.username),`;
      query += `(SELECT follow_status FROM follow WHERE followed_username=p.username AND follower_username=$1) `;
      query += `FROM post p `;
      query += `WHERE p.post_content LIKE $2 `;
      query += `ORDER BY p.update_date DESC LIMIT $3 OFFSET $4`;
      const { rows } = await connection.query(query, [
        current_username,
        `%${q}%`,
        config.limit_posts_per_search,
        (page - 1) * config.limit_posts_per_search,
      ]);
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
  async addImages(post_id: number, images: any[]): Promise<any[] | null> {
    try {
      if (!images.length) return null;
      const connection = await db.connect();
      let query = `INSERT INTO post_images (post_id,img_src) VALUES`;
      images.forEach((image: any) => {
        query += `(${post_id},'${image.filename}'),`;
      });
      query = query.substring(0, query.length - 1);
      query += ` RETURNING img_src`;
      const { rows } = await connection.query(query);
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
  async getPostImages(post_id: number): Promise<string[]> {
    try {
      const connection = await db.connect();
      const query = `SELECT img_src FROM post_images WHERE post_id=$1`;
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
  async getUserLikedPostsAsArray(username: string): Promise<number[]> {
    try {
      const connection = await db.connect();
      const query = `SELECT post_id FROM post_like WHERE username=$1`;
      const { rows } = await connection.query(query, [username]);
      connection.release();
      return rows.map((row) => row.post_id);
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 404,
      };
      throw error;
    }
  }
  async trendingByViews(): Promise<Post[]> {
    try {
      const connection = await db.connect();
      let query = `SELECT (SELECT COUNT(post_id) FROM view_post WHERE post_id=p.post_id AND view_date>NOW()-INTERVAL '7 days') AS "views",`;
      query += `p.post_id,p.username,p.post_content,p.upload_date,p.update_date FROM post p `;
      query += `GROUP BY p.post_id ORDER BY "views" DESC LIMIT $1;`;
      const { rows } = await connection.query(query, [trending_num]);
      connection.release();
      // for (const row of rows) {
      //   row.images = await this.getPostImages(row.post_id);
      //   row.likes_number = (await this.getLikes(row.post_id)).length;
      //   row.comments_number = (await this.getComments(row.post_id)).length;
      //   row.user_image = await userModel.getCurrentProfileImage(row.username);
      //   row.modified =
      //     new Date(row.upload_date).getTime() !==
      //     new Date(row.update_date).getTime()
      //       ? true
      //       : false;
      //   row.last_update = formatTime(row.update_date);
      //   delete row.upload_date;
      //   delete row.update_date;
      // }
      return rows;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 404,
      };
      throw error;
    }
  }
  async trendingHashtags(): Promise<Post[]> {
    try {
      const connection = await db.connect();
      let query = `WITH recent_posts AS (SELECT * FROM post WHERE update_date > NOW() - INTERVAL '7 days'),`;
      query += `tags AS (SELECT tag,COUNT(tag) AS "frequency" FROM post_tags `;
      query += `WHERE post_id IN (SELECT post_id FROM recent_posts) GROUP BY tag ORDER BY "frequency" DESC) `;
      query += `SELECT tag,"frequency" FROM tags;`;
      const { rows } = await connection.query(query);
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
  async trendingPostsByHashtags(): Promise<Post[]> {
    try {
      const connection = await db.connect();
      let query = `SELECT p.post_id, p.username,p.post_content,p.upload_date,p.update_date, COUNT(pt.tag) AS tag_count `;
      query += `FROM post_tags pt `;
      query += `JOIN post p ON pt.post_id = p.post_id `;
      query += `WHERE p.update_date >= NOW() - INTERVAL '7 days' `;
      query += `GROUP BY p.post_id `;
      query += `ORDER BY tag_count DESC LIMIT $1;`;
      const { rows } = await connection.query(query, [trending_num]);
      connection.release();
      await addBasicDataToPosts(rows);
      return rows;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 404,
      };
      throw error;
    }
  }
  async getPostLikesNumber(post_id: number): Promise<number> {
    try {
      const connection = await db.connect();
      const query = `SELECT COUNT(username) FROM post_like WHERE post_id=$1`;
      const { rows } = await connection.query(query, [post_id]);
      connection.release();
      return parseInt(rows[0].count);
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 500,
      };
      throw error;
    }
  }
  async getPostCommentsNumber(post_id: number): Promise<number> {
    try {
      const connection = await db.connect();
      const query = `SELECT COUNT(comment_id) FROM post_comment WHERE post_id=$1`;
      const { rows } = await connection.query(query, [post_id]);
      connection.release();
      return parseInt(rows[0].count);
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 500,
      };
      throw error;
    }
  }
  async isLiked(username: string, post_id: number): Promise<boolean> {
    try {
      const connection = await db.connect();
      const query = `SELECT * FROM post_like WHERE post_id=$1 AND username=$2`;
      const { rowCount } = await connection.query(query, [post_id, username]);
      connection.release();
      return rowCount == 1;
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 500,
      };
      throw error;
    }
  }
  async getLastestImages(username: string): Promise<string[]> {
    try {
      const connection = await db.connect();
      let query = `SELECT pi.img_src FROM post_images pi `;
      query += `JOIN post p ON pi.post_id=p.post_id `;
      query += `WHERE p.username=$1 `;
      query += `ORDER BY p.update_date `;
      query += `LIMIT $2`;
      const { rows } = await connection.query(query, [
        username,
        config.limit_images_per_profile,
      ]);
      connection.release();
      return rows.map((row) => row.img_src);
    } catch (err: any) {
      const error: IError = {
        message: err.message,
        status: err.status || 500,
      };
      throw error;
    }
  }
}
export default new postModel();
