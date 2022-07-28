import express from 'express';
import dotenv from 'dotenv';

import paths from '../../config/paths';

import checkJwt from '../../middleware/checkJwt';
import checkRole from '../../middleware/checkRole';
import uploadFile from '../../middleware/uploadFile';

import { newAndUpdateScheduleBodyMdw, newScheduleFileMdw, gradeScheduleMdw } from '../../middleware/schedule';
import { newScheduleCtrl, getScheduleCtrl, deleteScheduleCtrl, updateScheduleCtrl } from '../../controllers/schedule';
import { mimeTypesImgs } from '../../utils/mimeTypes';

dotenv.config();
const router = express.Router();

const uploadImage = uploadFile({
  fileSize: Number( process.env.SCHEDULE_FILE_MAX_SIZE ) * 1024 * 1024,
  mimeTypes: mimeTypesImgs,
  keyName: 'image',
  destination: paths.images.schedules
});

router.post(
  '/schedule',
  [
    checkJwt,
    checkRole(['administrator']),
    uploadImage,
    newAndUpdateScheduleBodyMdw,
    newScheduleFileMdw
  ],
  newScheduleCtrl
);

router.patch(
  '/schedule/:grade',
  [
    checkJwt,
    checkRole(['administrator']),
    uploadImage,
    gradeScheduleMdw,
  ],
  updateScheduleCtrl
);

router.get(
  '/schedule/:grade',
  [
    checkJwt,
    checkRole(['administrator', 'student']),
    gradeScheduleMdw
  ],
  getScheduleCtrl
);


router.delete(
  '/schedule/:grade',
  [
    checkJwt,
    checkRole(['administrator']),
    gradeScheduleMdw
  ],
  deleteScheduleCtrl
);

export default router;
