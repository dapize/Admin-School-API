import express from 'express';

import checkJwt from '../../middleware/checkJwt';
import checkRole from '../../middleware/checkRole';


import { newCourseMdwBody } from '../../middleware/courses';
import { newCourseCtrl, coursesListCtrl } from '../../controllers/courses';

const router = express.Router();

// New Course
router.post(
  '/courses/new',
  [
    checkJwt,
    checkRole(['administrator']),
    newCourseMdwBody
  ],
  newCourseCtrl
);

// List courses / Search a course
router.get(
  '/courses',
  [
    checkJwt,
    checkRole(['administrator', 'teacher', 'student'])
  ],
  coursesListCtrl
);

export default router;
