import express from 'express';

import checkJwt from '../../middleware/checkJwt';
import checkRole from '../../middleware/checkRole';

import { listRecordsMdl, listMyRecordsMdl, competencieMdl, idRecordMdl, idStudentMdl } from '../../middleware/records';
import { recordsListCtrl, myRecordsListCtrl, updateCompetencieCtrl, recordsReportCtrl } from '../../controllers/records/records';

const records = express.Router();


records.get(
  '/records',
  [
    checkJwt,
    checkRole(['administrator', 'teacher']),
    listRecordsMdl
  ],
  recordsListCtrl
);

records.get(
  '/records/:id',
  [
    checkJwt,
    checkRole(['student']),
    idRecordMdl,
    listMyRecordsMdl
  ],
  myRecordsListCtrl
);

records.patch(
  '/records/:id',
  [
    checkJwt,
    checkRole(['administrator', 'teacher']),
    idRecordMdl,
    competencieMdl
  ],
  updateCompetencieCtrl
);

// get Pdf tuition
records.get(
  '/records/report/:id',
  [
    checkJwt,
    checkRole(['administrator', 'teacher']),
    idStudentMdl
  ],
  recordsReportCtrl
);

export default records;
