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