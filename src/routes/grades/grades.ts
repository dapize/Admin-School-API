import express from 'express';

import checkJwt from '../../middleware/checkJwt';
import checkRole from '../../middleware/checkRole';


import { newGradeMdwBody } from '../../middleware/grades';
import { newGradeCtrl, gradesListCtrl } from '../../controllers/grades';

const router = express.Router();

// New Course
router.post(
  '/grades/new',
  [
    checkJwt,
    checkRole(['administrator']),
    newGradeMdwBody
  ],
  newGradeCtrl
);

// List courses / Search a course
router.get(
  '/grades',
  [
    checkJwt,
    checkRole(['administrator', 'teacher', 'student'])
  ],
  gradesListCtrl
);

export default router;
