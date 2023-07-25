import { Router } from 'express';
import User from '../controller/auth';
const router = Router();
router.post('/auth' , User.functionAuth)
router.post('/auth/verifyOTP' , User.verifyOTP)

export default router;