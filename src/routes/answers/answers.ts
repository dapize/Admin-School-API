import express from 'express';
import dotenv from 'dotenv';

import paths from '../../config/paths';

import checkJwt from '../../middleware/checkJwt';
import checkRole from '../../middleware/checkRole';
import uploadFile from '../../middleware/uploadFile';

import { mimeTypesImgs } from '../../utils/mimeTypes';

import {
  newAnswerBodyMdw,
  idMdwParams
} from '../../middleware/answers';
import {
  newAnswerCtrl,
  answersListCtrl,
  deleteAnswerCtrl
} from '../../controllers/answers/answers';


dotenv.config();
const router = express.Router();

const uploadAnswer = uploadFile({
  fileSize: Number( process.env.ANSWER_FILE_MAX_SIZE ) * 1024 * 1024,
  mimeTypes: mimeTypesImgs,
  keyName: 'file',
  destination: paths.documents.answers
});

router.post(
  '/answers/new',
  [
    checkJwt,
    checkRole(['student', 'teacher']),
    uploadAnswer,
    newAnswerBodyMdw
  ],
  newAnswerCtrl
);

router.get(
  '/answers/:id',
  [
    checkJwt,
    checkRole( ['administrator', 'student', 'teacher'] ),
    idMdwParams
  ],
  answersListCtrl
);

router.delete(
  '/answers/:id',
  [
    checkJwt,
    checkRole( ['administrator', 'student', 'teacher'] ),
    idMdwParams
  ],
  deleteAnswerCtrl
);


export default router;
