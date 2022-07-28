import { IAnswerDb } from '../../models/answers'

export interface IAnswerResponse extends Omit<IAnswerDb, 'question' | 'source'> {
  source: 'teacher' | 'student';
}

const addFullName = ( arr: IAnswerDb[] ) => {
  return arr.map( ( item: IAnswerDb ) => {
    const { _id, file, content, source, createdAt, author } = item;
    const obj: IAnswerResponse = {
      _id,
      content,
      source: source === 'students' ? 'student' : 'teacher',
      author,
      createdAt
    }
    if ( file ) obj.file = `${ process.env.BASE_URL }/uploads/documents/answers/${ file }`;
    return obj
  });
}

export default addFullName
