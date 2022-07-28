const errorMessages: { [ propName: string ]: string } = {
  LIMIT_FILE_SIZE: `El archivo es muy grande`,
  LIMIT_FIELD_KEY: 'El nombre del campo es demasiado largo',
  LIMIT_FIELD_VALUE: 'El valor del campo es demasiado largo',
  LIMIT_UNEXPECTED_FILE: 'Campo inesperado'
};

export default ( code: string ): string | undefined => {
  return errorMessages[ code ]
}
