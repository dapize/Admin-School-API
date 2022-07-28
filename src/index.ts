import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import Logger from 'jet-logger';

import initDB from './config/db';
import corsConfig from './config/cors';
import socket from './socket/main'

import loginRoutes from './routes/auth/auth';
import publicationsRoutes from './routes/publications/publications';
import tuitionsRoutes from './routes/tuitions/tuitions';
import coursesRoutes from './routes/courses/courses';
import teachersRoutes from './routes/teachers/teachers';
import gradesRoutes from './routes/grades/grades';
import recordsRoutes from './routes/records/records';
import scheduleRoutes from './routes/schedule/schedule';
import materialsRouters from './routes/materials/materials';
import questionsRouters from './routes/questions/questions';
import answersRouters from './routes/answers/answers';
import userRouters from './routes/user/user';
import notificationsRouters from './routes/notifications/notifications';

const config = dotenv.config();
if ( config.error ) Logger.Err('Missing environment variables');

// DB Connection
export const dbConnection = initDB();

// Init Server
const app = express();

const randomNumberBetween = ( min: number, max: number ) => Math.floor(Math.random() * (max - min + 1) + min);
const port = process.env.NODE_ENV === 'test' ? randomNumberBetween( 3000, 8000 ) : process.env.PORT;

// security with helmet
app.use( helmet() );

// cors and json
app.use( cors( corsConfig() ));
app.use( express.json() );

// routes
app.use( loginRoutes );
app.use( publicationsRoutes );
app.use( tuitionsRoutes );
app.use( coursesRoutes );
app.use( teachersRoutes );
app.use( gradesRoutes );
app.use( recordsRoutes );
app.use( scheduleRoutes );
app.use( materialsRouters );
app.use( questionsRouters );
app.use( answersRouters );
app.use( userRouters );
app.use( notificationsRouters );

// static files
app.use( '/',  (req: Request, res: Response, next: NextFunction) => {
  const materialsAccess = req.url.includes('materials')
  if ( materialsAccess ) return res.status(403).end('403 Forbidden')
  next();
});
app.use( '/', express.static('static') );

// socket IO
const server = socket( app );

// Finnaly the listen
export const listen = server.listen(port, () => {
  Logger.Info(`Server is listening on port ${ port }`);
});

export default app
