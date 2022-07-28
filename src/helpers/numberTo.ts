export const grades = [
  '1ro Primaria',
  '2do Primaria',
  '3ro Primaria',
  '4to Primaria',
  '5to Primaria',
  '6to Primaria',
  '1ro Secundaria',
  '2do Secundaria',
  '3ro Secundaria',
  '4to Secundaria',
  '5to Secundaria',
]

export const numberToGrade = ( num: number ) => {
  return grades[ num - 1 ]
}
