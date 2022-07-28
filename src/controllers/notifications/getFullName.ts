import { IAuthorPersonalData } from "../../interfaces/author";

const getFullName = ( author: IAuthorPersonalData ): string => {
  const { name, lastName, secondLastName } = author;
  return `${ lastName } ${ secondLastName } ${ name }`
}

export default getFullName;
