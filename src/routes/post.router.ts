import { Router } from 'express';
import * as postController from '../controllers/post.controller';
import { authenticationMiddleware } from '../middleware/authentication.middleware';
import upload from '../middleware/postsMulter.middleware';
const router = Router();
router
  .post(
    '/api/create',
    authenticationMiddleware,
    upload.array('images', 10),
    postController.createPost
  )
  .put('/edit', authenticationMiddleware, postController.editPost)
  .delete('/delete', authenticationMiddleware, postController.deletePost)
  .get('/search', authenticationMiddleware, postController.searchForAPost)
  .get('/api/search', authenticationMiddleware, postController.searchForAPost)
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
  .get(
    '/user/:username',
    authenticationMiddleware,
    postController.getPostsByUser
  )
  .get(
    '/hashtags/:hashtag',
    authenticationMiddleware,
    postController.getPostsByHashtag
  )
  .get('/trending', authenticationMiddleware, postController.trendingPosts);
export default router;
