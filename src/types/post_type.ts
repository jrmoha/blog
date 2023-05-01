import Comment from './comment_type';
import User from './user_type';

type Post = {
  post_id: number;
  username: string;
  upload_date?: string;
  update_date?: string;
  content: string;
  comments?: Comment[];
  likes?: User[];
  image?: string|undefined;
};

export default Post;
