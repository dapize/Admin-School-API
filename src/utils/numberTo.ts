// NUMBER TO DOCUMENT TRANSFER TYPE
export const documentsType = [
  'Resolución de Traslado',
  'Ficha de Matricula',
  'Certificado de Estudio',
  'Copia de DNI'
];
export const documentTransferType = ( num: number ) => {
  return documentsType[ num - 1 ]
}


// NUMBER TO GRADE
export const grades = [
  '1ro Primaria',
  '2do Primaria',
  '3ro Primaria',
  '4to Primaria',
  '5to Primaria',
  '6to Primaria',
  '1ro Secundaria',
  '2do Secundaria',
  '3ro Secundaria',
  '4to Secundaria',
  '5to Secundaria',
];
export const grade = ( num: number ) => {
  return grades[ num - 1 ]
}


// NUMBER TO REPRESENTATIVE TYPE

export const representatives = [
  'Apoderado',
  'Padre de Familia',
];
export const representative = ( num: number ) => {
  return representatives[ num - 1 ]
}
