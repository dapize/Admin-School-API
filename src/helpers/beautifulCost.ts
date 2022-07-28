const beautifulCost = ( cost: number ) => {
  let costString: string = cost.toString();
  if ( costString.includes('.') ) {
    const decimalLength = costString.split('.')[1].length;
    if ( decimalLength === 1 ) costString += '0';
  } else {
    costString += '.00';
  }
  return `S/.${ costString }`
}

export default beautifulCost;

