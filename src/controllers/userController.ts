import userModel from '../models/userModel';
import { Request, Response } from 'express';
import Post from '../types/post_type';
import postModel from '../models/postModel';
import jwt from 'jsonwebtoken';
import config from '../utils/config';
import Activity from '../types/activity_type';
export const getFeed = async (req: Request, res: Response) => {
  try {
    const username = req?.user;
    const posts: Post[] = await userModel.getFeed(username as string);
    const liked_posts: number[] = await postModel.getUserLikedPostsAsArray(
      username as string
    );
    res.render('feed', {
      posts: posts,
      liked_posts: liked_posts,
      title: 'Feed',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const friends = async (req: Request, res: Response) => {
  try {
    const username: any = req?.user;
    if (!username) throw new Error('No username');
    const friends: any = await userModel.friendsStatus(username);
    res.json(friends);
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
    console.log(req.file);

    if (!username) throw new Error('No username');
    if (req?.file) {
      const response = await userModel.insertProfileImage(
        username as string,
        req.file.filename
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
      res.json({
        success: true,
        response: { image: response, title: 'Profile Image Updated' },
      });
    } else {
      console.log('no file');
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
    userModel.addActivity(username as string, `You followed ${friend}`);
    res.json({ success: response });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const unfollowController = async (req: Request, res: Response) => {
  try {
    const username = req?.user;
    const friend = req.params.username;
    const response = await userModel.unfollow(username as string, friend);
    userModel.addActivity(username as string, `You Unfollowed ${friend}`);
    res.json({ success: response });
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
    console.log(followers);
    res.render('followers', { followers: followers, title: 'Followers' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
    console.log(followings);

    res.render('followings', { followings: followings, title: 'Followings' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteFollowerController = async (req: Request, res: Response) => {
  try {
    const username = req?.user;
    const friend = req.params.username;
    const response = await userModel.deleteFollower(username as string, friend);
    res.json({ success: response });
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
    res.json({
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
    res.render('photos', { photos: photos, title: profile_username });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
    res.render('activity', {
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
    console.log(options)
    const response = await userModel.editOptions(username as string, options);
    res.json({ success: true, response: response });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
