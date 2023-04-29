import { Router } from 'express';
import * as authController from '../controllers/authenticationController';
import passport from '../passport';
import { authenticationMiddleware } from '../middleware/authenticationMiddleware';

const router = Router();
router.get('/login', authController.loginPageController);
router.post('/login', authController.loginController);
router.get('/registration', authController.regPageController);
router.post('/registration', authController.registerController);
router.put(
  '/api/users/updateSession',
  authenticationMiddleware,
  authController.updateSessionController
);
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  `/auth/google/blog`,
  passport.authenticate('google', { failureRedirect: '/login' }),
  authController.providerLoginController
);
router.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['user'] })
);
router.get(
  `/auth/github/blog`,
  passport.authenticate('github', { failureRedirect: '/login' }),
  authController.providerLoginController
);
export default router;
