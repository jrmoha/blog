import { Router } from 'express';
import * as authController from '../controllers/authentication.controller';
import passport from '../services/passport';
import { authenticationMiddleware } from '../middleware/authentication.middleware';

const router = Router();
router
  .get('/login', authenticationMiddleware, authController.loginPageController)
  .post('/login', authController.loginController)
  .get(
    '/registration',
    authenticationMiddleware,
    authController.regPageController
  )
  .post('/registration', authController.registerController)
  .get('/logout', authController.logoutController)
  .put(
    '/api/users/updateSession',
    authenticationMiddleware,
    authController.updateSessionController
  )
  .get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  )
  .get(
    `/auth/google/blog`,
    passport.authenticate('google', { failureRedirect: '/login' }),
    authController.providerLoginController
  )
  .get('/auth/github', passport.authenticate('github', { scope: ['user'] }))
  .get(
    `/auth/github/blog`,
    passport.authenticate('github', { failureRedirect: '/login' }),
    authController.providerLoginController
  );
export default router;
