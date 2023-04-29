import { Router } from 'express';
import * as postController from '../controllers/postController';
import { authenticationMiddleware } from '../middleware/authenticationMiddleware';

const router = Router();

router.post('/create', postController.createPost);
router.put('/edit', postController.editPost);
router.delete('/delete', postController.deletePost);
router.get('/search', postController.searchForAPost);
router.get('/trendingtags', postController.trendingTags);
router.get('/:post_id', postController.getPost);
router.post('/like', postController.likePost);
router.delete('/unlike', postController.unlikePost);
router.post('/comment', postController.addComment);
router.delete('/deleteComment', postController.deleteComment);
router.put('/editComment', postController.editComment);
router.post('/viewpost', postController.viewPost);
router.get('/user/:username', postController.getPostsByUser);
router.get('/hashtags/:hashtag', postController.getPostsByHashtag);
router.get('/api/likes/:post_id',authenticationMiddleware, postController.getLikes);
export default router;
