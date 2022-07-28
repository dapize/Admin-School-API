const readableDate = ( uglyDate?: number | string ) => {
  const timeDate = uglyDate ? new Date( uglyDate ) : new Date();
  return timeDate.getDate() + '/' + ( timeDate.getMonth() + 1 ) + '/' + timeDate.getFullYear()
}

export default readableDate
