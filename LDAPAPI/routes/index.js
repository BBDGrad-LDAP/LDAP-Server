import { Router } from 'express';
import users from './users.js';

import { authRouter, verifyTokenMiddleware } from './auth.js';

const router = Router();

router.use('/users', verifyTokenMiddleware('admin'), users); //when adding the middleware it needs the required role so if we have levels of access
router.use('/login', authRouter);

export default router
