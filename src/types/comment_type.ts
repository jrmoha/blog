type Comment = {
  id?: number;
  username: string;
  user_image?: string;
  post_id: string;
  comment: string;
  comment_time: string;
  isOwner?: boolean;
  modified?: boolean;
};
export default Comment;
