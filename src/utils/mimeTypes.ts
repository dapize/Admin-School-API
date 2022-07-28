export interface IMimeTypes {
  [ propName: string ]: string;
}

export const mimeTypesImgs:IMimeTypes = {
  gif: 'image/gif',
  jpg: 'image/jpg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  bmp: 'image/bmp',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  tif: 'image/tiff',
  tiff: 'image/tiff'
}

export const mimeTypesDocs: IMimeTypes = {
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  pdf: 'application/pdf',
}

const mimeTypes: IMimeTypes = {
  ...mimeTypesImgs,
  ...mimeTypesDocs,
  rar: 'application/x-rar-compressed',
  zip: 'application/zip',
  '7z': 'application/x-7z-compressed',
  mp4: 'video/mp4',
  avi: 'video/x-msvideo',
  mpg: 'video/mpeg',
  mp3: 'audio/mpeg',
  mov: 'video/quicktime',
  wmv: 'video/x-ms-wmv'
}

export default mimeTypes;
