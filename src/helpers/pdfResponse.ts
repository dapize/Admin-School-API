import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { Response } from 'express';

import htmlToPdf from './htmlToPdf';

interface IPdfResponse {
  output: string;
  values: any;
  res: Response;
  template: string;
}

const pdfResponse = async ( obj: IPdfResponse ) => {
  const { output, values, res, template } = obj;

  await htmlToPdf( values, template.toString(), output );
  const stat = await fs.stat( output );

  const file = fsSync.createReadStream( output );
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=' + path.basename( output ));
  file.pipe(res);

  file.on('close', async () => {
    await fs.unlink( output );
  });
}

export default pdfResponse;
