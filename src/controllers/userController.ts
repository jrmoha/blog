import userModel from '../models/userModel';
import { Request, Response } from 'express';
import Post from '../types/post_type';

export const getFeed = async (req: Request, res: Response) => {
  try {
    const username = req.params.username;
    const posts: Post[] = await userModel.getFeed(username);
    res.status(200).json(posts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const friends = async (req: Request, res: Response) => {
  try {
    const username: any = req?.user ;
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
    const username = req?.user ;
    if (!username) throw new Error('No username');
    if (req?.file) {
      const response = await userModel.insertProfileImage(
        username as string,
        req.file.filename
      );
      console.log(response);
      res.json({
        success: true,
        response: { image: response, title: 'Profile Image Updated' },
      });
    } else {
      console.log('no file');
      throw new Error('No File Uploaded');
    }
  } catch (error) {
    console.log('errorrrr');
    console.log(error);
    res.status(500).json(error);
  }
};
