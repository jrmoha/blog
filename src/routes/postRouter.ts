import { Router } from 'express';
import * as postController from '../controllers/postController';
import { authenticationMiddleware } from '../middleware/authenticationMiddleware';
import upload from '../middleware/postsMulter';
const router = Router();
router
  .post(
    '/api/create',
    authenticationMiddleware,
    upload.array('images', 10),
    postController.createPost
  )
  .put('/edit', postController.editPost)
  .delete('/delete', postController.deletePost)
  .get('/search', postController.searchForAPost)
  .get('/trendingtags', postController.trendingTags)
  .get('/post/:post_id', authenticationMiddleware, postController.getPost)
  .post(
    '/api/post/like/:post_id',
    authenticationMiddleware,
    postController.likePost
  )
  .delete(
    '/api/post/unlike/:post_id',
    authenticationMiddleware,
    postController.unlikePost
  )
  .get(
    '/api/post/likes/:post_id',
    authenticationMiddleware,
    postController.getLikes
  )
  .post('/api/addComment', authenticationMiddleware, postController.addComment)
  .delete(
    '/api/deleteComment',
    authenticationMiddleware,
    postController.deleteComment
  )
  .put('/api/editComment', authenticationMiddleware, postController.editComment)
  .get('/user/:username', postController.getPostsByUser)
  .get(
    '/hashtags/:hashtag',
    authenticationMiddleware,
    postController.getPostsByHashtag
  )
  .get('/trending', authenticationMiddleware, postController.trendingPosts);

export default router;
