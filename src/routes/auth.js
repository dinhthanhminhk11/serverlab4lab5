import { Router } from 'express';
import User from '../controller/auth';
const router = Router();
router.post('/auth' , User.functionAuth)
router.post('/auth/verifyOTP' , User.verifyOTP)
router.patch('/auth/updatePass' , User.changePassword)
export default router;