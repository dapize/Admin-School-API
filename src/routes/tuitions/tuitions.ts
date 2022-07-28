import express from 'express';
import dotenv from 'dotenv';

import paths from '../../config/paths';

import checkJwt from '../../middleware/checkJwt';
import checkRole from '../../middleware/checkRole';
import uploadFile from '../../middleware/uploadFile';
import { mimeTypesImgs, mimeTypesDocs } from '../../utils/mimeTypes';

import {
  newTuitionParamsMdw,
  idTuitionMdw,
  existingUser,
  updateTuitionParamsMdw,
  updateTuitionMdwBody
} from '../../middleware/tuitions';
import {
  newTuitionCtrl,
  deleteTuitionCtrl,
  tuitionsListCtrl,
  resetTuitionCtrl,
  tuitionReportCtrl,
  updateTuitionCtrl
} from '../../controllers/tuitions/tuitions';


dotenv.config();
const router = express.Router();

const uploadDocument = uploadFile({
  fileSize: Number( process.env.TUITION_FILE_MAX_SIZE ) * 1024 * 1024,
  mimeTypes: {
    ...mimeTypesDocs,
    ...mimeTypesImgs
  },
  keyName: 'studentTransferDocument',
  destination: paths.documents.tuitions
});

// NEW TUITION
router.post(
  '/tuitions/new',
  [
    checkJwt,
    checkRole(['administrator']),
    uploadDocument,
    newTuitionParamsMdw,
    existingUser
  ],
  newTuitionCtrl
);

router.get(
  '/tuitions',
  [
    checkJwt,
    checkRole(['administrator'])
  ],
  tuitionsListCtrl
);

router.delete(
  '/tuitions/:id',
  [
    checkJwt,
    checkRole(['administrator']),
    idTuitionMdw
  ],
  deleteTuitionCtrl
);

// RESET PASSWORD
router.post(
  '/tuitions/reset/:id',
  [
    checkJwt,
    checkRole(['administrator']),
    idTuitionMdw
  ],
  resetTuitionCtrl
);

// get Pdf tuition
router.get(
  '/tuitions/report/:id',
  [
    checkJwt,
    checkRole(['administrator']),
    idTuitionMdw
  ],
  tuitionReportCtrl
);

router.patch(
  '/tuitions/:id',
  [
    checkJwt,
    checkRole(['administrator']),
    uploadDocument,
    updateTuitionParamsMdw,
    updateTuitionMdwBody
  ],
  updateTuitionCtrl
)



export default router;
