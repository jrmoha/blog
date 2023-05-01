import { Router } from 'express';
import * as postController from '../controllers/postController';
import { authenticationMiddleware } from '../middleware/authenticationMiddleware';
import multer from 'multer';
import path from 'path';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const path = __dirname + '/../public/images/posts';
    return cb(null, path);
  },
  filename: (req, file, cb) => {
    cb(null, `${new Date().getTime() + path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage: storage,
  limits: { fieldSize: 800000 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(null, false);
    const err = new Error('Only .png, .jpg and .jpeg format allowed!');
    err.name = 'ExtensionError';
    return cb(err);
  },
});
const router = Router();
router.post(
  '/api/create',
  authenticationMiddleware,
  upload.array('images', 4),
  postController.createPost
);
router.put('/edit', postController.editPost);
router.delete('/delete', postController.deletePost);
router.get('/search', postController.searchForAPost);
router.get('/trendingtags', postController.trendingTags);
router.get('/:post_id', postController.getPost);
router.post(
  '/api/post/like/:post_id',
  authenticationMiddleware,
  postController.likePost
);
router.delete(
  '/api/post/unlike/:post_id',
  authenticationMiddleware,
  postController.unlikePost
);
router.get(
  '/api/post/likes/:post_id',
  authenticationMiddleware,
  postController.getLikes
);
router.post('/comment', postController.addComment);
router.delete('/deleteComment', postController.deleteComment);
router.put('/editComment', postController.editComment);
router.post('/viewpost', postController.viewPost);
router.get('/user/:username', postController.getPostsByUser);
router.get(
  '/hashtags/:hashtag',
  authenticationMiddleware,
  postController.getPostsByHashtag
);

export default router;
