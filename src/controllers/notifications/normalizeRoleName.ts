import { TSource } from "../../models/question";

const normalizeRoleName = ( role: TSource ) => {
  return role === 'teachers' ? 'teacher' : 'student'
}

export default normalizeRoleName;
