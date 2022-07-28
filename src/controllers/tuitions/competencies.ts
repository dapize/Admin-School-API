import courseModel, { ICourse } from '../../models/courses';
import { ICompetencies, IObjCompetencies } from '../../models/record';

const getCompetencies = async () => {
  const courses = await courseModel.find({}, { competencies: true, code: true });
  const competencies: IObjCompetencies = {};
  courses.forEach( ( item: ICourse ) => {
    const objCompetencies: ICompetencies = {};
    [ ...Array( item.competencies.length ) ].forEach( ( item: undefined, index: number ) => {
      if ( index === 0) objCompetencies.c1 = 0;
      if ( index === 1) objCompetencies.c2 = 0;
      if ( index === 2) objCompetencies.c3 = 0;
      if ( index === 3) objCompetencies.c4 = 0;
    })
    competencies[ item.code ] = objCompetencies
  });
  return competencies
}

export default getCompetencies;
