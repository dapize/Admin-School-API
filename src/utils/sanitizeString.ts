const letterRegex = /[0-9ña-zA-Z\u00C0-\u00FF ]/;

const sanitizeFileName = ( name: string ) => {
  return name
    .split('')
    .filter( ( item: string ) => {
      if ( item === ' ' ) return true;
      if ( letterRegex.test( item ) ) return true;
      return false;
    })
    .join('')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(' ')
    .join('-');
}

export default sanitizeFileName;
