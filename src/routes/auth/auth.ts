import express from 'express';
import { loginCtrl, registerCtrl } from '../../controllers/auth';
import { loginMdw, registerMdw } from '../../middleware/auth';

const router = express.Router();

router.post('/login', loginMdw, loginCtrl)

router.post('/register', registerMdw, registerCtrl)

export default router;
