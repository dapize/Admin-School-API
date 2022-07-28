import htmlPdf, { FileInfo } from 'html-pdf';
import * as Sqrl from 'squirrelly';

const htmlToPdf = ( values: any, template: string, outFile: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // reemplacing variables
    const html = Sqrl.render(template, values);

    // creating the PDF
    htmlPdf.create( html, {
      format: 'A4'
    }).toFile( outFile, function(err: Error, res: FileInfo ) {
      if (err) return reject(err);
      resolve()
    });
  })
}
export default htmlToPdf;
