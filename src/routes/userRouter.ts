import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticationMiddleware } from '../middleware/authenticationMiddleware';

// import multer from 'multer';
// import path from 'path';
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     return cb(null, __dirname+'../public/images/users');
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${new Date().getTime() + path.extname(file.originalname)}`);
//   },
// });
// const upload = multer({ storage: storage, limits: { fieldSize: 800000 } });
import upload from '../multer';
const router = Router();

// router.get('/feed/:username', userController.getFeed);
router.get('/api/friends',authenticationMiddleware, userController.friends);
router.post(
  '/image/change',
  authenticationMiddleware,
  upload.single('image'),
  userController.updateProfilePictureController
);
export default router;
