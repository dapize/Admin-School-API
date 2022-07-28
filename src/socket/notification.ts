import { Socket } from 'socket.io';
import Logger from 'jet-logger';
import { INotificationResponse } from '../models/notification';


interface IEntity {
  id: string;
  socket: Socket;
}

const usersMap: Map<string, IEntity> = new Map();

const getNamesRooms = ( socket: Socket ): string[] => {
  const { role, grade, grades } = socket.handshake.auth;
  if ( role === 'student' ) {
    return [ 'room ' + grade ]
  } else { // teacher
    return grades.map( ( grade: number ) => 'room ' + grade )
  }
}

export const notify = ( dni: string, data: INotificationResponse ) => {
  const entity = usersMap.get( dni );
  if ( entity ) {
    const socket = entity.socket;
    socket
      .to( getNamesRooms( socket ) )
      .emit( 'notification:new', data )
  }
}

export const sockNotification = ( socket: Socket ) => {
  // Saving in the map
  usersMap.set( socket.handshake.auth.dni, { id: socket.id, socket });

  // Entering to the corresponding room
  socket.join( getNamesRooms( socket ) );

  socket.on('disconnect', () => {
    Logger.Imp( 'User socket disconnected ID: ' + socket.id )
    getNamesRooms( socket ).forEach( ( room: string ) => socket.leave( room ) )
  });
}
