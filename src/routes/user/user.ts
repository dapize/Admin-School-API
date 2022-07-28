import express from 'express';

import checkJwt from '../../middleware/checkJwt';
import checkRole from '../../middleware/checkRole';

import { updatePasswordCtrl } from '../../controllers/user';
import { updatePasswordMdw } from '../../middleware/user';

const router = express.Router();

router.patch(
  '/user/:id',
  [
    checkJwt,
    checkRole([ 'student', 'teacher', 'administrator' ]),
    updatePasswordMdw,
  ],
  updatePasswordCtrl
)

export default router;
