import { Router } from 'express';
import * as userController from '../controllers/userController';

const router = Router();

router.get('/feed/:username', userController.getFeed);

export default router;
