import fs from 'fs/promises';
import path from 'path';

import paths from '../../config/paths';

const deleteFileUploaded = async ( file: string ) => {
  const pathFile = path.join(path.resolve('./'), paths.documents.answers, file);
  await fs.unlink( pathFile );
}

export default deleteFileUploaded;
