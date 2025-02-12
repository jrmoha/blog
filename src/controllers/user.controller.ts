import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import cloudinary from '../services/cloudinary';
import fs from 'fs';
import userModel from '../models/user.model';
import postModel from '../models/post.model';
import Post from '../types/post.type';
import config from '../utils/config';
import Activity from '../types/activity.type';
import User from '../types/user.type';
import { addBasicDataToPosts } from '../utils/functions';

export const getFeed = async (req: Request, res: Response) => {
  try {
    const username = req?.user;
    const posts: Post[] = await userModel.getFeed(username as string);
    const liked_posts: number[] = await postModel.getUserLikedPostsAsArray(
      username as string
    );
    res.locals.liked_posts = liked_posts;
console.log(req.user);

    return res.render('feed', {
      posts,
      title: 'Feed',
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const friends = async (req: Request, res: Response) => {
  try {
    const username: any = req?.user;
    if (!username) throw new Error('No username');
    const friends: any = await userModel.friendsStatus(username);
    return res.json(friends);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfilePictureController = async (
  req: Request,
  res: Response
) => {
  try {
    const username = req?.user;

    if (!username) throw new Error('No username');
    if (req?.file) {
      const cloudinary_response = await cloudinary.uploader.upload(
        req.file.path,
        config.cloudinary.options.users
      );
      fs.unlink(req.file.path, () => {
        null;
      });
      const response = await userModel.insertProfileImage(
        username as string,
        cloudinary_response.secure_url
      );
      const decoded = jwt.verify(
        req.cookies.jwt,
        config.jwt.secret as string
      ) as any;
      decoded.profile_image = response;
      const token = jwt.sign(decoded, config.jwt.secret as string);
      res.cookie('jwt', token, {
        httpOnly: true,
      });
      return res.json({
        success: true,
        response: { image: response, title: 'Profile Image Updated' },
      });
    } else {
      throw new Error('No File Uploaded');
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

export const followController = async (req: Request, res: Response) => {
  try {
    const username = req?.user;
    const friend = req.params.username;
    const response = await userModel.follow(username as string, friend);
    await userModel.addActivity(username as string, `You followed ${friend}`);
    return res.json({ success: response });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const unfollowController = async (req: Request, res: Response) => {
  try {
    const username = req?.user;
    const friend = req.params.username;
    const response = await userModel.unfollow(username as string, friend);
    await userModel.addActivity(username as string, `You Unfollowed ${friend}`);
    return res.json({ success: response });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const followersPageController = async (req: Request, res: Response) => {
  try {
    const current_username = req?.user as string;
    const profile_username = req.params.username;
    const followers: any[] = await userModel.getFollowers(profile_username);
    if (profile_username === current_username) {
      res.locals.isOwner = true;
    } else {
      res.locals.isOwner = false;
    }

    for (let i = 0; i < followers.length; i++) {
      if (followers[i].follower_username === current_username) {
        followers[i].follow_status = 0;
      } else {
        followers[i].follow_status = await userModel.isFollowing(
          current_username,
          followers[i].follower_username
        );
      }
    }
    return res.render('followers', {
      followers: followers,
      title: 'Followers',
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const followingsPageController = async (req: Request, res: Response) => {
  try {
    const current_username = req?.user as string;
    const profile_username = req.params.username;
    const followings: any[] = await userModel.getFollowings(profile_username);
    for (let i = 0; i < followings.length; i++) {
      if (followings[i].followed_username === current_username) {
        followings[i].follow_status = 0;
      } else {
        followings[i].follow_status = await userModel.isFollowing(
          current_username,
          followings[i].followed_username
        );
      }
    }
    return res.render('followings', {
      followings: followings,
      title: 'Followings',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFollowerController = async (req: Request, res: Response) => {
  try {
    const username = req?.user;
    const friend = req.params.username;
    const response = await userModel.deleteFollower(username as string, friend);
    return res.json({ success: response });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProfilePictureController = async (
  req: Request,
  res: Response
) => {
  try {
    const username = req?.user;
    const image = req.body.image;
    if (!username) throw new Error('No username');
    const response = await userModel.deleteUserImage(username as string, image);
    const decoded = jwt.verify(
      req.cookies.jwt,
      config.jwt.secret as string
    ) as any;
    decoded.profile_image = response;
    const token = jwt.sign(decoded, config.jwt.secret as string);
    res.cookie('jwt', token, {
      httpOnly: true,
    });
    return res.json({
      success: true,
      response: { image: response, title: 'Profile Image Deleted' },
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const photosPageController = async (req: Request, res: Response) => {
  try {
    const profile_username = req.params.username;
    const photos = await userModel.getUserImages(profile_username);
    if (req.user === profile_username) {
      res.locals.isOwner = true;
    } else {
      res.locals.isOwner = false;
    }
    return res.render('photos', { photos: photos, title: profile_username });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const activityPageController = async (req: Request, res: Response) => {
  try {
    const username = req?.user;
    const page = parseInt(req.query.page as string, 10) || 1;
    const activities: Activity[] = await userModel.getActivities(
      username as string,
      page
    );
    activities.forEach((activity) => {
      activity.activity_date = new Date(activity.activity_date)
        .toDateString()
        .slice(0, 15);
    });
    const pag_count = await userModel.getActivitiesCount(username as string);
    return res.render('activity', {
      activities: activities,
      page: page,
      title: 'Activity',
      pag_count: Math.ceil(pag_count / config.activity_page_size),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const settingsPageController = async (req: Request, res: Response) => {
  try {
    const username = req?.user;
    const options = await userModel.getOptions(username as string);
    res.locals.options = options;
    res.render('settings', { title: 'Settings' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettingsController = async (req: Request, res: Response) => {
  try {
    const username = req?.user;
    const options = req.body;
    const response = await userModel.editOptions(username as string, options);
    res.json({ success: true, response: response });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const loadMoreFeed = async (req: Request, res: Response) => {
  try {
    const username = req?.user as string;
    const page = parseInt(req.query.page as string);
    const liked_posts = await postModel.getUserLikedPostsAsArray(username);
    const posts: Post[] = await userModel.getFeed(username, page);
    res
      .status(200)
      .json({ success: true, response: posts, liked_posts: liked_posts });
  } catch (error: any) {
    res.status(500).json({ sucess: false, message: error.message });
  }
};

export const changePassowrdPageController = async (
  _req: Request,
  res: Response
) => {
  try {
    res.render('change-password', { title: 'Change Password' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const changePasswordController = async (req: Request, res: Response) => {
  try {
    const username = req?.user as string;
    const { password } = req.body;
    const response = await userModel.changePassword(username, password);
    res.json({ success: true, response: response });
  } catch (error: any) {
    res.status(500).json({ sucess: false, message: error.message });
  }
};

export const profilePageController = async (req: Request, res: Response) => {
  try {
    const current_username: string = req?.user as string;
    const profile_username: string = req.params.username;

    if (profile_username === current_username) {
      res.locals.isOwner = true;
    } else {
      res.locals.isOwner = false;
      res.locals.follow_status = await userModel.follow_status(
        current_username,
        profile_username
      );
    }
    const prom = await Promise.all([
      userModel.getUserByUsername(profile_username),
      postModel.getPosts(profile_username),
      postModel.getLastestImages(profile_username),
    ]);
    const profile: User = prom[0];
    const posts: Post[] = prom[1];
    const lastest_posts_images: string[] = prom[2];
    await addBasicDataToPosts(posts);
    res.locals.profile = profile;
    res.locals.posts = posts;
    res.locals.lastest_posts_images = lastest_posts_images;
    res.render('profile', {
      title: profile.first_name + ' ' + profile.last_name,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const searchPageController = async (req: Request, res: Response) => {
  try {
    const username = req?.user as string;
    const query = req.query.q as string;
    if (!query) return res.render('search', { title: 'Search' });
    const users: User[] = await userModel.searchUserByUsernameOrFullName(
      username,
      query
    );
    res.locals.users = users;
    const posts: Post[] = await postModel.getPostsBySearch(username, query);
    await addBasicDataToPosts(posts);
    userModel.insert_search(username, query);

    res.locals.posts = posts;
    res.locals.liked_posts = await postModel.getUserLikedPostsAsArray(username);
    res.render('search', { title: 'Search' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchForAUser = async (req: Request, res: Response) => {
  try {
    const current_username = req?.user as string;
    const query = req.query.q as string;
    const page = parseInt(req.query.page as string, 10) || 1;
    if (!query) return res.json({ success: false, response: [] });
    const users = await userModel.searchUserByUsernameOrFullName(
      current_username,
      query,
      page
    );
    res.json({ success: true, response: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const historyPageController = async (req: Request, res: Response) => {
  try {
    const username = req?.user as string;
    const history: string[] = await userModel.searchHistory(username);
    history.forEach((item: any) => {
      item.search_date = new Date(item.search_date).toString().slice(0, 21);
    });
    res.locals.history = history;
    res.render('history', { title: 'History' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteHistoryController = async (req: Request, res: Response) => {
  try {
    const username = req?.user as string;
    const { query } = req.body;
    const response = await userModel.deleteSearch(username, query);
    res.json({ success: response });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const clearHistoryController = async (req: Request, res: Response) => {
  try {
    const username = req?.user as string;
    const response = await userModel.clearHistory(username);
    res.json({ success: response });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
