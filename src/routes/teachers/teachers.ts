import express from 'express';

import checkJwt from '../../middleware/checkJwt';
import checkRole from '../../middleware/checkRole';


import { newTeacherMdwBody, idTeacherMdwParams, updateTeacherMdwBody  } from '../../middleware/teachers';
import { newTeacherCtrl, teachersListCtrl, deleteTeacherCtrl, updateTeacherCtrl, resetTeacherCtrl } from '../../controllers/teachers';

const router = express.Router();

// New Teacher
router.post(
  '/teachers/new',
  [
    checkJwt,
    checkRole(['administrator']),
    newTeacherMdwBody
  ],
  newTeacherCtrl
);

// List teachers / Search one
router.get(
  '/teachers',
  [
    checkJwt,
    checkRole(['administrator', 'teacher', 'student'])
  ],
  teachersListCtrl
);

router.delete(
  '/teachers/:id',
  [
    checkJwt,
    checkRole(['administrator']),
    idTeacherMdwParams
  ],
  deleteTeacherCtrl
);

router.patch(
  '/teachers/:id',
  [
    checkJwt,
    checkRole(['administrator']),
    idTeacherMdwParams,
    updateTeacherMdwBody
  ],
  updateTeacherCtrl
);

// RESET PASSWORD
router.post(
  '/teachers/reset/:id',
  [
    checkJwt,
    checkRole(['administrator']),
    idTeacherMdwParams
  ],
  resetTeacherCtrl
);

export default router;
