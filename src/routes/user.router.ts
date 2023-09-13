import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticationMiddleware } from '../middleware/authentication.middleware';
import upload from '../middleware/userMulter.middleware';

const router = Router();

router
  .get('/', authenticationMiddleware, userController.getFeed)
  .get(
    '/history',
    authenticationMiddleware,
    userController.historyPageController
  )
  .get(
    '/users/:username',
    authenticationMiddleware,
    userController.profilePageController
  )
  .get('/search', authenticationMiddleware, userController.searchPageController)
  .get(
    '/api/users/search',
    authenticationMiddleware,
    userController.searchForAUser
  )
  .get(
    '/api/loadMoreFeed',
    authenticationMiddleware,
    userController.loadMoreFeed
  )
  .get(
    '/activity',
    authenticationMiddleware,
    userController.activityPageController
  )
  .get(
    '/settings',
    authenticationMiddleware,
    userController.settingsPageController
  )
  .get(
    '/settings/change-password',
    authenticationMiddleware,
    userController.changePassowrdPageController
  )
  .get('/api/friends', authenticationMiddleware, userController.friends)
  .put(
    '/api/editSettings',
    authenticationMiddleware,
    userController.updateSettingsController
  )
  .post(
    '/api/follow/:username',
    authenticationMiddleware,
    userController.followController
  )
  .delete(
    '/api/unfollow/:username',
    authenticationMiddleware,
    userController.unfollowController
  )
  .delete(
    '/api/delete/photo',
    authenticationMiddleware,
    userController.deleteProfilePictureController
  )
  .post(
    '/api/image/change',
    authenticationMiddleware,
    upload.single('image'),
    userController.updateProfilePictureController
  )
  .get(
    '/users/:username/followers',
    authenticationMiddleware,
    userController.followersPageController
  )
  .get(
    '/users/:username/followings',
    authenticationMiddleware,
    userController.followingsPageController
  )
  .get(
    '/users/:username/photos',
    authenticationMiddleware,
    userController.photosPageController
  )
  .delete(
    '/api/delete/:username',
    authenticationMiddleware,
    userController.deleteFollowerController
  )
  .put(
    '/api/change-password',
    authenticationMiddleware,
    userController.changePasswordController
  )
  .delete(
    '/api/history/delete',
    authenticationMiddleware,
    userController.deleteHistoryController
  )
  .delete(
    '/api/history/clear',
    authenticationMiddleware,
    userController.clearHistoryController
  );
export default router;
