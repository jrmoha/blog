import db from '../database/database';
import User from '../types/user_type';
import Error from '../interfaces/error';
import bcryptjs from 'bcryptjs';
class userModel {
  userExists(username: string, email: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.connect().then((connection) => {
        const query = `SELECT username,email FROM users WHERE username=$1 OR email=$2`;
        connection
          .query(query, [username, email])
          .then((result) => {
            const err: Error = {
              name: 'Registration Error',
              message: '',
              status: 409,
            };
            if (result.rows.length == 0) resolve(false);
            else {
              if (result.rows[0].username == username) {
                err.message = 'This Username Is Used By Another User';
                reject(err);
              } else if (result.rows[0].email == email) {
                err.message = 'This Email Is Used By Another User';
                reject(err);
              }
            }
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
  async registerUser(
    username: string,
    password: string,
    email: string,
    first_name: string,
    last_name: string,
    birth_date: Date,
    session_id: string
  ): Promise<User> {
    const userEx = await this.userExists(username, email);
    if (userEx) {
      throw userEx;
    } else {
      return new Promise((resolve, reject) => {
        db.connect().then((connection) => {
          let query = `INSERT INTO users (username,email,password,first_name,last_name,birth_date) `;
          query += `VALUES ($1,$2,$3,$4,$5,$6) RETURNING username,email,first_name,last_name`;
          const salt = bcryptjs.genSaltSync(10);
          const hashedPassword = bcryptjs.hashSync(password, salt);
          connection
            .query(query, [
              username,
              email,
              hashedPassword,
              first_name,
              last_name,
              birth_date,
            ])
            .then((result) => {
              this.addActivity(username, 'You Created This An Account.');
              this.insertSession(username, session_id);
              resolve(result.rows[0]);
            })
            .catch((err) => {
              reject(`Error: ${err.message}`);
            })
            .finally(() => {
              connection.release();
            });
        });
      });
    }
  }
  async authenticateUser(
    username: string,
    password: string,
    session_id: string
  ): Promise<User> {
    return new Promise((resolve, reject) => {
      db.connect().then((connection) => {
        const query = `SELECT username,email,password,first_name,last_name FROM users WHERE username=$1`;
        connection
          .query(query, [username])
          .then((result) => {
            const err: Error = {
              name: 'Authentication Error',
              message: ``,
              status: 401,
            };
            if (result.rows.length == 0) {
              err.message = `This Username Doesn't Exist`;
              reject(err);
            } else {
              const user = result.rows[0];
              const isMatch = bcryptjs.compareSync(password, user.password);
              delete user.password;
              if (isMatch) {
                this.addActivity(username, 'You Logged In');
                this.insertSession(username, session_id);
                resolve(user);
              } else {
                err.message = `This Password Isn't Correct.`;
                reject(err);
              }
            }
          })
          .catch((err) => {
            reject(`Error: ${err.message}`);
          })
          .finally(() => {
            connection.release();
          });
      });
    });
  }
  addActivity(username: string, activity_title: string): Promise<object> {
    return new Promise((resolve, reject) => {
      db.connect().then((connection) => {
        const query = `INSERT INTO activity (username,activity) VALUES ($1,$2)`;
        connection
          .query(query, [username, activity_title])
          .then(() => {
            resolve({ status: 'ok' });
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
  deleteActivity(username: string, activity_title: string): Promise<object> {
    return new Promise((resolve, reject) => {
      db.connect().then((connection) => {
        const query = `DELETE FROM activity WHERE username=$1 AND activity=$2`;
        connection
          .query(query, [username, activity_title])
          .then(() => {
            resolve({ status: 'ok' });
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
  getActivities(username: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      db.connect().then((connection) => {
        const query = `SELECT activity,activity_date FROM activity WHERE username=$1`;
        connection
          .query(query, [username])
          .then((result) => {
            resolve(result.rows);
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
  insertSession(username: string, session_id: string): Promise<object> {
    return new Promise((resolve, reject) => {
      db.connect().then((connection) => {
        const query = `INSERT INTO user_session(username,session_id) VALUES($1,$2)`;
        connection
          .query(query, [username, session_id])
          .then(() => {
            resolve({ status: 'ok' });
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
  search(username: string, search_title: string): Promise<object> {
    return new Promise((resolve, reject) => {
      db.connect().then((connection) => {
        const query = `INSERT INTO user_search(username,search) VALUES ($1,$2)`;
        connection
          .query(query, [username, search_title])
          .then(() => {
            this.addActivity(username, `You Searched For ${search_title}`).then(
              () => {
                resolve({ status: 'ok' });
              }
            );
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
  searchHistory(username: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      db.connect().then((connection) => {
        const query = `SELECT search FROM user_search WHERE username=$1 ORDER BY search_date DESC`;
        connection
          .query(query, [username])
          .then((result) => {
            resolve(result.rows);
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
  deleteSearch(username: string, search_title: string): Promise<object> {
    return new Promise((resolve, reject) => {
      db.connect().then((connection) => {
        let query = `DELETE FROM user_search `;
        query += `WHERE search IN (SELECT search FROM user_search WHERE username=$1 AND search=$2 ORDER BY search_date DESC LIMIT 1)`;
        connection
          .query(query, [username, search_title])
          .then(() => {
            resolve({ status: 'ok' });
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
  follow(
    follower_username: string,
    followed_username: string
  ): Promise<object> {
    return new Promise((resolve, reject) => {
      db.connect().then((connection) => {
        const check_query = `SELECT * FROM follow WHERE follower_username=$1 AND followed_username=$2 AND follow_status=0`;
        connection
          .query(check_query, [follower_username, followed_username])
          .then((result) => {
            if (result.rows.length > 0) {
              reject(`This Follower Already Been Deleted.`);
            } else {
              const query = `INSERT INTO follow(follower_username,followed_username) VALUES ($1,$2)`;
              connection
                .query(query, [follower_username, followed_username])
                .then(() => {
                  this.addActivity(
                    follower_username,
                    `You Followed ${followed_username}`
                  ).then(() => {
                    resolve({ status: 'ok' });
                  });
                })
                .catch((err) => {
                  reject(err);
                })
                .finally(() => {
                  connection.release();
                });
            }
          });
      });
    });
  }
  unfollow(username: string, unfollowed: string): Promise<object> {
    return new Promise((resolve, reject) => {
      db.connect().then((connection) => {
        const query = `DELETE FROM follow WHERE follower_username=$1 AND followed_username=$2`;
        connection
          .query(query, [username, unfollowed])
          .then(() => {
            this.deleteActivity(username, `You Unfollowed ${unfollowed}`).then(
              () => {
                resolve({ status: 'ok' });
              }
            );
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
  deleteFollower(username: string, follower: string): Promise<object> {
    return new Promise((resolve, reject) => {
      db.connect().then((connection) => {
        const query = `UPDATE follow SET follow_status=0 WHERE follower_username=$1 AND followed_username=$2`;
        connection
          .query(query, [follower, username])
          .then(() => {
            this.deleteActivity(
              username,
              `You Removed ${follower} From Followers`
            ).then(() => {
              resolve({ status: 'ok' });
            });
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

export default userModel;
