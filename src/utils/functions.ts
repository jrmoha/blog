import bcryptjs from 'bcryptjs';
import postModel from '../models/postModel';
import userModel from '../models/userModel';
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
export const addBasicDataToPosts = async (posts: any[]): Promise<void> => {
  for (const post of posts) {
    post.images = await postModel.getPostImages(post.post_id);
    post.likes = await postModel.getLikes(post.post_id);
    post.likes_number = post.likes.length;
    post.comments = await postModel.getComments(post.post_id);
    post.comments_number = post.comments.length;
    post.user_image = await userModel.getCurrentProfileImage(post.username);
    post.modified =
      new Date(post.upload_date).getTime() !==
      new Date(post.update_date).getTime()
        ? true
        : false;
    post.last_update = formatTime(post.update_date);
    delete post.upload_date;
    delete post.update_date;
  }
};
