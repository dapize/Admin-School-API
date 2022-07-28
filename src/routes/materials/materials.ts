import express from 'express';
import dotenv from 'dotenv';

import paths from '../../config/paths';

import checkJwt from '../../middleware/checkJwt';
import checkRole from '../../middleware/checkRole';
import uploadFile from '../../middleware/uploadFile';

import mimeTypes from '../../utils/mimeTypes';

import {
  newMaterialBodyMdw,
  newMaterialFileMdw,
  materialIdParamsMdw,
  listMaterialsQueryMdl
} from '../../middleware/materials';
import {
  newMaterialCtrl,
  deleteMaterialCtrl,
  materialsListCtrl,
  getMaterialCtrl
} from '../../controllers/materials';

dotenv.config();
const router = express.Router();

const uploadMaterial = uploadFile({
  fileSize: Number( process.env.MATERIAL_FILE_MAX_SIZE ) * 1024 * 1024,
  mimeTypes: mimeTypes,
  keyName: 'file',
  destination: paths.materials
});

const rolesAvailable = ['administrator', 'student', 'teacher'];

router.post(
  '/materials/new',
  [
    checkJwt,
    checkRole( rolesAvailable),
    uploadMaterial,
    newMaterialBodyMdw,
    newMaterialFileMdw
  ],
  newMaterialCtrl
);

router.delete(
  '/materials/:id',
  [
    checkJwt,
    checkRole( rolesAvailable ),
    materialIdParamsMdw
  ],
  deleteMaterialCtrl
);

router.get(
  '/materials',
  [
    checkJwt,
    checkRole( rolesAvailable ),
    listMaterialsQueryMdl
  ],
  materialsListCtrl
);

router.get(
  '/materials/:id',
  [
    checkJwt,
    checkRole( rolesAvailable ),
    materialIdParamsMdw
  ],
  getMaterialCtrl
);


export default router;
