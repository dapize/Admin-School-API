import express from 'express';
import dotenv from 'dotenv';

import paths from '../../config/paths';

import checkJwt from '../../middleware/checkJwt';
import checkRole from '../../middleware/checkRole';
import uploadFile from '../../middleware/uploadFile';

import { mimeTypesImgs } from '../../utils/mimeTypes';

import {
  newQuestionBodyMdw,
  listQuestionsQueryMdl,
  idQuestionMdwParams,
  updateQuestionMdwBody
} from '../../middleware/questions';
import {
  newQuestionCtrl,
  questionsListCtrl,
  updateQuestionCtrl,
  deleteQuestionCtrl,
  getQuestionCtrl
} from '../../controllers/questions/questions';


dotenv.config();
const router = express.Router();

const uploadQuestion = uploadFile({
  fileSize: Number( process.env.QUESTION_FILE_MAX_SIZE ) * 1024 * 1024,
  mimeTypes: mimeTypesImgs,
  keyName: 'file',
  destination: paths.documents.questions
});

router.post(
  '/questions/new',
  [
    checkJwt,
    checkRole(['student', 'teacher']),
    uploadQuestion,
    newQuestionBodyMdw
  ],
  newQuestionCtrl
);

router.get(
  '/questions',
  [
    checkJwt,
    checkRole( ['administrator', 'student', 'teacher'] ),
    listQuestionsQueryMdl
  ],
  questionsListCtrl
);

router.get(
  '/questions/:id',
  [
    checkJwt,
    checkRole( ['student', 'teacher']),
    idQuestionMdwParams,
  ],
  getQuestionCtrl
);

router.patch(
  '/questions/:id',
  [
    checkJwt,
    checkRole( ['student', 'teacher']),
    uploadQuestion,
    idQuestionMdwParams,
    updateQuestionMdwBody,
  ],
  updateQuestionCtrl
);

router.delete(
  '/questions/:id',
  [
    checkJwt,
    checkRole( ['administrator', 'student', 'teacher'] ),
    idQuestionMdwParams
  ],
  deleteQuestionCtrl
);

export default router;
