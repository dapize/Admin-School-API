import studentModel from '../../models/student';
import teacherModel from '../../models/teacher';
import { TSource } from '../../models/question';
import { IAnswer } from '../../models/answers';
import { INotification, INotificationRecord } from '../../models/notification';

const populatingSource = ( item: INotificationRecord, path: string ) => {
  const source = ( ( item.source as INotification ).answer! as IAnswer ).source;
  return item.populate({
    path,
    model: source === ( 'student' as TSource ) ? studentModel : teacherModel,
    select: 'name lastName secondLastName -_id'
  })
}

export default populatingSource;
