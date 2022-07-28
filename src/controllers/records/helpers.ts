import { ICompetencies } from '../../models/record';

export const competenciesParser = ( obj: ICompetencies, nCompetencies: number ): number[] => {
  const competencies: number[] = [];
  [ ...Array( nCompetencies ) ].forEach( ( item: undefined, index: number ) => {
    if ( index === 0) competencies[ 0 ] = obj.c1 || 0;
    if ( index === 1) competencies[ 1 ] = obj.c2 || 0;
    if ( index === 2) competencies[ 2 ] = obj.c3 || 0;
    if ( index === 3) competencies[ 3 ] = obj.c4 || 0;
  })
  return competencies;
}

export const competenciesAverage = ( arr: number[] ): number => {
  const numBetween = arr.filter( ( numItem: number ) => numItem !== 0 );
  const average = arr.reduce((a: number, b: number ) => a + b, 0) / ( numBetween.length || 1 );
  return Math.round( average );
}
