import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import path from 'path';
import morgan from 'morgan';
import ChatEvents from './events/chat';
import RoomEvents from './events/room';
import PokerRooms from './PokerRooms';
import UserEvents from './events/user';

const port = process.env.PORT || 3000;
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

  socket.on(RoomEvents.GET_ROOM_STATUS_FROM_CLIENT, (roomID) => {
    io.emit(
      RoomEvents.GET_ROOM_STATUS_FROM_SERVER,
      pokerRooms.checkIfRoomExist(roomID)
    );
  });

  socket.on(RoomEvents.CONNECT_TO_ROOM, (roomID) => {
    const roomData = pokerRooms.getRoomData(roomID);
    io.emit(RoomEvents.GET_ROOM_FROM_SERVER, roomData);
  });

  socket.on(UserEvents.ADD_USER_FROM_CLIENT, ({ roomID, userData }) => {
    const userID = pokerRooms.addUser(roomID, userData);
    io.emit(RoomEvents.USER_CONNECTED, { roomID, userID });
  });

  socket.on(RoomEvents.GET_ROOM_FROM_CLIENT, (roomID) => {
    const roomData = pokerRooms.getRoomData(roomID);
    io.emit(RoomEvents.GET_ROOM_FROM_SERVER, roomData);

    console.log(`${roomID} sent to client`);
  });

  socket.on(RoomEvents.SET_ROOM_MESSAGE_FROM_CLIENT, ({ roomID, text }) => {
    pokerRooms.changeMessage(roomID, text);
  });

  socket.on(RoomEvents.DISCONNECT_FROM_ROOM, ({ roomID, userID }) => {
    pokerRooms.deleteUser(roomID, userID);
  });

  socket.on(RoomEvents.START_GAME, (roomID) => {
    pokerRooms.startGame(roomID);
    io.emit(RoomEvents.GAME_BEGUN, roomID);
  });

  socket.on(RoomEvents.CLOSE_ROOM, (roomID) => {
    pokerRooms.close(roomID);
    io.emit(RoomEvents.ROOM_CLOSED, roomID);
  });

  socket.on(RoomEvents.UPDATE_SETTINGS, ({ roomID, newSettings }) => {
    pokerRooms.updateSettings(roomID, newSettings);
  });

  socket.on(RoomEvents.ADD_ISSUE, ({ roomID, issue }) => {
    pokerRooms.addIssue(roomID, issue);
  });

  socket.on(RoomEvents.DELETE_ISSUE, ({ roomID, issueID }) => {
    pokerRooms.deleteIssue(roomID, issueID);
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
