import { IQuestionDb } from '../../models/question'

export interface IQuestionResponse extends Omit<IQuestionDb, 'source'> {
  source: 'teacher' | 'student';
}

const addFullName = ( arr: IQuestionDb[] ) => {
  return arr.map( ( item: IQuestionDb ) => {
    const { _id, title, description, file, source, grade, theme, course, answers, createdAt, author } = item;
    const obj:IQuestionResponse = {
      _id,
      title,
      description,
      source: source === 'students' ? 'student' : 'teacher',
      grade,
      theme,
      answers,
      author,
      createdAt
    }
    if ( course ) obj.course = course;
    if ( file ) obj.file = `${ process.env.BASE_URL }/uploads/documents/questions/${ file }`;
    return obj
  });
}

export default addFullName
