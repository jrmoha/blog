import bcryptjs from 'bcryptjs';
import CryptoJS from 'crypto-js';
import postModel from '../models/postModel';
import userModel from '../models/userModel';
import config from './config';
import Post from '../types/post_type';

const message_secret = config.message.secret as string;

export const getHashtags = (query: string): string[] => {
  const regex = /\B(#[a-zA-Z0-9_]+\b)(?!;)/gm;
  const hashtags = query.match(regex);
  if (hashtags?.length) {
    hashtags.forEach((hashtag, index) => {
      hashtags[index] = hashtag.replace('#', '');
      hashtags[index] = hashtags[index].toLowerCase();
    });
  }
  return [...new Set(hashtags)];
};

export const formatUserStatusTime = (lastseen_string: string): object => {
  const lastseen_time = Date.parse(lastseen_string);
  let diff = new Date().getTime() - lastseen_time;
  const day = 24 * 60 * 60 * 1000;
  const year = 365 * day;
  const month = 30 * day;
  const week = 7 * day;
  let last_active = '';
  let current_status = 'offline';
  if (diff > year) {
    //more than a year
    last_active += `${Math.floor(diff / year)} Years`;
    diff /= year;
  } else if (diff > month && diff < year) {
    //more than a month less than a year
    last_active += `${Math.floor(diff / month)} Months`;
    diff /= month;
  } else if (diff > week && diff < month) {
    //more than a week less than a month
    last_active += `${Math.floor(diff / week)} Week`;
    diff /= week;
  } else if (diff > day && diff < week) {
    //more than a day less than a week
    last_active += `${Math.floor(diff / day)} Day`;
    diff /= day;
  } else if (diff < 60000) {
    last_active = 'Now';
    current_status = 'online';
  } else {
    //less than a day
    if (Math.ceil(diff / (60 * 1000)) > 60) {
      last_active += `${Math.floor(diff / (60 * 1000 * 60))} Hours`;
      diff /= 60 * 1000 * 60;
    }
    if (Math.ceil(diff / (60 * 1000)) > 1) {
      last_active += `${Math.ceil(diff / (60 * 1000))} Mintues`;
    }
  }
  return { current_status, last_active };
};
export const formatTime = (time: string): string => {
  const d: any = formatUserStatusTime(time);
  return d.last_active;
};
export const hashPassword = async (password: string): Promise<string> => {
  const salt = bcryptjs.genSaltSync(10);
  return bcryptjs.hashSync(password, salt);
};
export const comparePassword = async (
  password: string,
  hashed: string
): Promise<boolean> => {
  return bcryptjs.compareSync(password, hashed);
};
export const addBasicDataToPosts = async (posts: Post[]): Promise<void> => {
  for (const post of posts) {
    const all = await Promise.all([
      postModel.getPostImages(post.post_id),
      postModel.getPostLikesNumber(post.post_id),
      postModel.getComments(post.post_id),
      userModel.getCurrentProfileImage(post.username),
    ]);
    post.images = all[0];
    post.single_image = all[0][0];
    post.likes_number = all[1];
    post.comments = all[2];
    post.comments_number = all[2].length;
    post.user_image = all[3];
    post.modified =
      new Date(post.upload_date as string).getTime() !==
      new Date(post.update_date as string).getTime()
        ? true
        : false;
    post.last_update = formatTime(post.update_date as string);
    delete post.upload_date;
    delete post.update_date;
  }
};
export const encryptMessage = (message: string): string => {
  const encryptedMessage = CryptoJS.AES.encrypt(message, message_secret);
  return encryptedMessage.toString();
};
export const decryptMessage = (encryptedMessage: string): string => {
  const decryptedMessage = CryptoJS.AES.decrypt(
    encryptedMessage,
    message_secret
  );
  return decryptedMessage.toString(CryptoJS.enc.Utf8);
};
export const getJwtFromCookie = function (cookie: string) {
  const parts = cookie.split('; ');
  for (const part of parts) {
    const [name, value] = part.split('=');
    if (name === 'jwt') {
      return value;
    }
  }
  return null;
};
