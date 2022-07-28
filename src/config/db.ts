import mongoose from 'mongoose';
import Logger from 'jet-logger';

const connect = () => {
  mongoose.connect(
    `${process.env.DB_URI}`,
    {
      keepAlive: true
    },
    ( err ) => {
      if ( err ) {
        Logger.Err('Error connecting to the DB');
        return Logger.Err(err)
      }
      Logger.Info('¡DB connection successfully!')
    }
  )

  return mongoose;
}

export default connect;
