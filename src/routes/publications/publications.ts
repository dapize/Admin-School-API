import express from 'express';
import dotenv from 'dotenv';

import paths from '../../config/paths';

import checkJwt from '../../middleware/checkJwt';
import checkRole from '../../middleware/checkRole';
import uploadFile from '../../middleware/uploadFile';
import { mimeTypesImgs } from '../../utils/mimeTypes';

import {
  newPublicationBodyMdw,
  newPublicationFileMdw,
  deletePublicationMdw,
  updatePublicationMdwParams,
  updatePublicationMdwBody,
} from '../../middleware/publications';
import {
  newPublicationCtrl,
  publicationsListCtrl,
  deletePublicationCtrl,
  updatePublicationCtrl
} from '../../controllers/publications';

dotenv.config();
const router = express.Router();

const uploadImage = uploadFile({
  fileSize: Number( process.env.PUBLICATION_FILE_MAX_SIZE ) * 1024 * 1024,
  mimeTypes: mimeTypesImgs,
  keyName: 'image',
  destination: paths.images.publications
});

router.post(
  '/publications/new',
  [
    checkJwt,
    checkRole(['administrator']),
    uploadImage,
    newPublicationBodyMdw,
    newPublicationFileMdw
  ],
  newPublicationCtrl
);

router.get(
  '/publications',
  [
    checkJwt,
    checkRole(['administrator', 'student', 'teacher'])
  ],
  publicationsListCtrl
);

router.delete(
  '/publications/:id',
  [
    checkJwt,
    checkRole(['administrator']),
    deletePublicationMdw
  ],
  deletePublicationCtrl
);

router.patch(
  '/publications/:id',
  [
    checkJwt,
    checkRole(['administrator']),
    uploadImage,
    updatePublicationMdwParams,
    updatePublicationMdwBody,
  ],
  updatePublicationCtrl
);

export default router;
