import { Request, Response } from 'express';
import postModel from '../models/postModel';
import { formatTime, getHashtags } from '../utils/functions';
import Post from '../types/post_type';
import userModel from '../models/userModel';
import Comment from '../types/comment_type';
export const createPost = async (req: Request, res: Response) => {
  try {
    const { username, content } = req.body;
    const response: Post = await postModel.createPost(username, content);
    const hashTags = getHashtags(content);
    Promise.allSettled([
      postModel.addHashtags(response.post_id, hashTags),
      userModel.addActivity(username, 'You Created A Post'),
    ]);
    res.json(response);
  } catch (err: any) {
    res.json({ message: err.message, status: err.status });
  }
};
export const editPost = async (req: Request, res: Response) => {
  try {
    const { post_id, new_content } = req.body;
    const response: Post = await postModel.editPost(post_id, new_content);
    const hashTags = getHashtags(new_content);
    Promise.all([
      postModel.deleteHashtags(post_id), //delete all hashtags associated with the post
      postModel.addHashtags(post_id, hashTags), //insert new hashtags
      userModel.addActivity(response.username, 'You Edited A Post'), //add activity to user
    ]);
    res.json(response);
  } catch (err: any) {
    res.json({ message: err.message, status: err.status });
  }
};
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { username, post_id } = req.body;
    await Promise.all([
      postModel.deleteHashtags(post_id),
      postModel.deleteComments(post_id),
      postModel.deleteViews(post_id),
      postModel.deleteLikes(post_id),
      userModel.addActivity(username, 'You Deleted A Post'),
    ]);
    const response: boolean = await postModel.deletePost(post_id);
    if (response) {
      res.json({ message: 'Post Deleted' });
    } else {
      res.json({ message: 'Post Not Found' });
    }
  } catch (err: any) {
    res.json({ message: err.message, status: err.status });
  }
};
export const getPost = async (req: Request, res: Response) => {
  try {
    const post_id: number = parseInt(req.params.post_id);
    const response: Post = await postModel.getPost(post_id);
    res.json(response);
  } catch (err: any) {
    res.json({ message: err.message, status: err.status });
  }
};
export const likePost = async (req: Request, res: Response) => {
  try {
    const { username, post_id } = req.body;
    const response: boolean = await postModel.likePost(username, post_id);
    if (response) {
      userModel.addActivity(username, 'You Liked A Post');
      res.json({ success: true });
    } else {
      res.json({ message: 'Post Not Found' });
    }
  } catch (err: any) {
    res.json({ message: err.message, status: err.status });
  }
};
export const unlikePost = async (req: Request, res: Response) => {
  try {
    const { username, post_id } = req.body;
    const response: boolean = await postModel.unlikePost(username, post_id);
    if (response) {
      res.json({ success: true });
    } else {
      res.json({ message: 'Post Not Found' });
    }
  } catch (err: any) {
    res.json({ message: err.message, status: err.status });
  }
};
export const addComment = async (req: Request, res: Response) => {
  try {
    const { username, post_id, comment } = req.body;
    const response: Comment = await postModel.addComment(
      username,
      post_id,
      comment
    );
    if (response) {
      userModel.addActivity(username, 'You Commented On A Post');
      response.comment_time = formatTime(response.comment_time);
      res.json({ response: response, success: true });
    } else {
      res.json({ message: 'Post Not Found' });
    }
  } catch (err: any) {
    res.json({ message: err.message, status: err.status });
  }
};
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { comment_id, username } = req.body;
    const response: boolean = await postModel.deleteComment(comment_id);
    if (response) {
      Promise.resolve(userModel.addActivity(username, 'You Deleted A Comment'));
      res.json({ message: 'Comment Deleted' });
    } else {
      res.json({ message: 'Post Not Found' });
    }
  } catch (err: any) {
    res.json({ message: err.message, status: err.status });
  }
};
export const editComment = async (req: Request, res: Response) => {
  try {
    const { comment_id, new_comment } = req.body;
    const response: Comment = await postModel.editComment(
      comment_id as number,
      new_comment as string
    );
    if (response) {
      res.json(response);
    } else {
      res.json({ message: 'Post Not Found' });
    }
  } catch (err: any) {
    res.json({ message: err.message, status: err.status });
  }
};
export const getPostsByUser = async (req: Request, res: Response) => {
  try {
    const username: string = req.params.username;
    const response: Post[] = await postModel.getPosts(username);
    res.json(response);
  } catch (err: any) {
    res.json({ message: err.message, status: err.status });
  }
};
export const viewPost = async (req: Request, res: Response) => {
  try {
    const { username, post_id } = req.body;
    const response: boolean = await postModel.viewPost(username, post_id);
    if (response) {
      return res.json({ success: true });
    }
    return res.json({ success: false });
  } catch (err: any) {
    res.json({ message: err.message, status: err.status });
  }
};
export const getPostsByHashtag = async (req: Request, res: Response) => {
  try {
    const hashtag: string = req.params.hashtag;
    const response: Post[] = await postModel.getPostsByHashtag(hashtag);
    res.json(response);
  } catch (err: any) {
    res.json({ message: err.message, status: err.status });
  }
};
export const searchForAPost = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const response: Post[] = await postModel.getPostsBySearch(query);
    if (response.length) {
      res.json(response);
    } else {
      res.json({ message: 'No Posts Found' });
    }
  } catch (err: any) {
    res.json({ message: err.message, status: err.status });
  }
};
export const trendingTags = async (_req: Request, res: Response) => {
  try {
    const response = await postModel.trendingHashtags();
    res.json(response);
  } catch (err: any) {
    res.json({ message: err.message, status: err.status });
  }
};
