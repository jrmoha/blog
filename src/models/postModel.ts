import db from '../database';
import Post from '../types/post_type';

class postModel {
  createPost(username: string, content: string): Promise<Post> {
    return new Promise((resolve, reject) => {
      db.connect().then((connection) => {
        const query = `INSERT INTO post (username,post_content) VALUES ($1,$2) RETURNING *`;
        connection
          .query(query, [username, content])
          .then((result) => {
            resolve(result.rows[0]);
          })
          .catch((err) => {
            reject(err);
          })
          .finally(() => {
            connection.release();
          });
      });
    });
  }
}
export default new postModel();
