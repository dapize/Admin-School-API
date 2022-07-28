import path from 'path';
import fs from 'fs/promises';

import { IFile } from '../middleware/uploadFile';

const deletingFile = async ( file: IFile ) => {
  const { path: fileUploaded } = file;
  const pathFile = path.join( path.resolve('./'), fileUploaded );
  await fs.unlink( pathFile );
}

export default deletingFile;
