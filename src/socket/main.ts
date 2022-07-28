import { Express } from 'express';
import http from 'http';
import { Server as WebSocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import Logger from 'jet-logger';

import corsConfig from '../config/cors';
import { sockNotification } from './notification';


const socketInit = ( app: Express ) => {
  // creating the WS server
  const server = http.createServer( app );
  const io = new WebSocketServer( server, {
    cors: {
      ...corsConfig(),
      methods: [ 'GET', 'POST' ]
    }
  });

  // middleware to check if the token is valid
  io.use(( socket: Socket, next: ( err?: Error ) => void ) => {
    const token = socket.handshake.auth.token;
    const tokenValid = jwt.verify( token, `${ process.env.JWT_SECRET }`);
    if ( !tokenValid ) return socket.disconnect();
    next();
  });

  io.on('connection', ( socket: Socket ) => {
    Logger.Imp( 'New user connected by socket ID: ' + socket.id )
    sockNotification( socket )
  })

  return server
}

export default socketInit;

