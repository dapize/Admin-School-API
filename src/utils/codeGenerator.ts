const code = ( word: string ) => {
  let rCode = word
    .split('.')
    .join('')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, '')
    .split(' ')
    .join('')
    .substring(0, 3)
    .toLowerCase();
  rCode += '-' + (Math.random() + 1).toString(36).substring(7);
  return rCode;
}

export default code;
