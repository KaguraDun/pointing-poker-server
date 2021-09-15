import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import path from 'path';
import morgan from 'morgan';
import ChatEvents from './events/chat';
import RoomEvents from './events/room';
import PokerRooms from './PokerRooms';

require('dotenv').config();

const port = process.env.SERVER_PORT;
const app = express();

app
  .use('/static', express.static(path.resolve(__dirname, 'public')))
  .use(cors())
  .use(morgan('dev'));

const server = app.listen(port, () => {
  console.log('Server run at ' + port);
});

const io = new Server(server);

const pokerRooms = new PokerRooms();

io.on('connection', (socket) => {
  console.log('User connected', socket.id);

  socket.on(RoomEvents.CREATE_ROOM, (dealerData) => {
    const roomData = pokerRooms.create(dealerData);
    io.emit(RoomEvents.GET_ROOM_FROM_SERVER, roomData);
  });

  socket.on(RoomEvents.CONNECT_TO_ROOM, (userData) => {
    pokerRooms.addUser(userData);
  });

  socket.on(RoomEvents.DISCONNECT_FROM_ROOM, (userID) => {
    pokerRooms.deleteUser(userID);
  });

  socket.on(RoomEvents.CLOSE_ROOM, (roomID) => {
    pokerRooms.closeRoom(roomID);
  });

  let messageKey = 0;

  socket.on(ChatEvents.SEND_MESSAGE_FROM_CLIENT, (messageText) => {
    messageKey += 1;

    io.emit(ChatEvents.GET_MESSAGE_FROM_SERVER, {
      messageID: messageKey,
      text: messageText,
      userID: socket.id,
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});
