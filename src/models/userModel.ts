import db from '../database/database';
import User from '../types/user_type';
import Error from '../interfaces/error.interface';
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
    birth_date: Date
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
              console.log(result.rows[0]);
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
  async authenticateUser(username: string, password: string): Promise<User> {
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
}

export default userModel;
