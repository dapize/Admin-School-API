import bcrypt from 'bcryptjs';

export const encrypt = async ( txtPlain: string ) => {
  const hash = await bcrypt.hash( txtPlain, 10 );
  return hash;
}

export const compare = async ( passwordPlain: string, hashPassword: string ) => {
  const comparison = await bcrypt.compare( passwordPlain, hashPassword );
  return comparison;
}
