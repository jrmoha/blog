import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticationMiddleware } from '../middleware/authenticationMiddleware';

import multer from 'multer';
import path from 'path';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const path = __dirname + '/../public/images/users';
    return cb(null, path);
  },
  filename: (req, file, cb) => {
    cb(null, `${new Date().getTime() + path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage: storage, limits: { fieldSize: 800000 } });
const router = Router();

router.get('/', authenticationMiddleware, userController.getFeed);
router.get('/api/friends', authenticationMiddleware, userController.friends);
router.post(
  '/api/follow/:username',
  authenticationMiddleware,
  userController.followController
);
router.delete(
  '/api/unfollow/:username',
  authenticationMiddleware,
  userController.unfollowController
);router.delete(
  '/api/delete/photo',
  authenticationMiddleware,
  userController.deleteProfilePictureController
);
router.post(
  '/api/image/change',
  authenticationMiddleware,
  upload.single('image'),
  userController.updateProfilePictureController
);
router.get(
  '/users/:username/followers',
  authenticationMiddleware,
  userController.followersPageController
);
router.get(
  '/users/:username/followings',
  authenticationMiddleware,
  userController.followingsPageController
);
router.get(
  '/users/:username/photos',
  authenticationMiddleware,
  userController.photosPageController
);
router.delete(
  '/api/delete/:username',
  authenticationMiddleware,
  userController.deleteFollowerController
);

export default router;
