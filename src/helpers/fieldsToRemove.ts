const fieldsToRemove = ( objVault: any, fields: string[] ) => {
  const arrToRemove = fields.filter( (item: string ) => {
    return !objVault.hasOwnProperty( item )
  });
  const objFields:any = {};
  arrToRemove.forEach( ( item: string ) => {
    objFields[ item ] = 1;
  })
  return objFields
}

export default fieldsToRemove;
