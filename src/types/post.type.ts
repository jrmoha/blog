import Comment from './comment.type';
import User from './user.type';

type Post = {
  post_id: number;
  username: string;
  upload_date?: string;
  update_date?: string;
  content: string;
  comments?: Comment[];
  comments_number?: number;
  likes?: User[];
  likes_number?: number;
  images?: string[]|undefined;
  single_image?: string;
  user_image?: string;
  modified?: boolean;
  last_update?: string;
  liked?: boolean;
};

export default Post;
