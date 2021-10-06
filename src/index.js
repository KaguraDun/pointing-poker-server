import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import path from 'path';
import morgan from 'morgan';
import crypto from 'crypto';
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

    console.log(`user:${roomData.owner} create room:${roomData.ID}`);
  });

  socket.on(RoomEvents.GET_ROOM_STATUS_FROM_CLIENT, (roomID) => {
    const isRoomExist = pokerRooms.checkIfRoomExist(roomID);
    io.emit(RoomEvents.GET_ROOM_STATUS_FROM_SERVER, isRoomExist);
    console.log(
      `room:${roomID} status is` + (isRoomExist ? 'exist' : 'not exist')
    );
  });

  socket.on(RoomEvents.CONNECT_TO_ROOM, (roomID) => {
    const roomData = pokerRooms.getRoomData(roomID);
    io.emit(RoomEvents.GET_ROOM_FROM_SERVER, roomData);
  });

  socket.on(UserEvents.ADD_USER_FROM_CLIENT, ({ roomID, userData }) => {
    const userID = pokerRooms.addUser(roomID, userData);
    io.emit(RoomEvents.USER_CONNECTED, { roomID, userID });
    console.log(`user:${userID} added to ${roomID}`);
  });

  socket.on(RoomEvents.GET_ROOM_FROM_CLIENT, (roomID) => {
    const roomData = pokerRooms.getRoomData(roomID);
    io.emit(RoomEvents.GET_ROOM_FROM_SERVER, roomData);
    console.log(`room:${roomID} sent to client`);
  });

  socket.on(RoomEvents.SET_ROOM_MESSAGE_FROM_CLIENT, ({ roomID, text }) => {
    pokerRooms.changeMessage(roomID, text);
    console.log(`room:${roomID} set message`);
  });

  socket.on(RoomEvents.DISCONNECT_FROM_ROOM, ({ roomID, userID }) => {
    pokerRooms.deleteUser(roomID, userID); 
    io.emit(RoomEvents.USER_DISCONNECTED, { roomID, userID });
    console.log(`user:${userID} disconnected from room:${roomID}`);
  });

  socket.on(RoomEvents.START_GAME, (roomID) => {
    pokerRooms.startGame(roomID);
    io.emit(RoomEvents.GAME_BEGUN, roomID);
    console.log(`room:${roomID} game started`);
  });

  socket.on(RoomEvents.UPDATE_GAME_STATE, ({ roomID, newGameState }) => {
    pokerRooms.updateGameState(roomID, newGameState);
    console.log(`room:${roomID} game state updated`);
  });

  socket.on(RoomEvents.CLOSE_ROOM, (roomID) => {
    pokerRooms.close(roomID);
    io.emit(RoomEvents.ROOM_CLOSED, roomID);
    console.log(`room:${roomID} closed`);
  });

  socket.on(RoomEvents.UPDATE_SETTINGS, ({ roomID, newSettings }) => {
    pokerRooms.updateSettings(roomID, newSettings);
    console.log(`room:${roomID} settings updated`);
  });

  socket.on(RoomEvents.ADD_ISSUE, ({ roomID, issueData }) => {
    pokerRooms.addIssue(roomID, issueData);
    console.log(`room:${roomID} issue added`);
  });

  socket.on(RoomEvents.EDIT_ISSUE, ({ roomID, issueID, issueData }) => {
    pokerRooms.editIssue(roomID, issueID, issueData);
    console.log(`room:${roomID} issue:${issueID} edited`);
  });

  socket.on(RoomEvents.DELETE_ISSUE, ({ roomID, issueID }) => {
    pokerRooms.deleteIssue(roomID, issueID);
    console.log(`room:${roomID} issue:${issueID} deleted`);
  });

  socket.on(
    ChatEvents.SEND_MESSAGE_FROM_CLIENT,
    ({ roomID, userID, messageText }) => {
      const messageID = crypto.randomBytes(5).toString('hex');

      io.emit(ChatEvents.GET_MESSAGE_FROM_SERVER, {
        ID: messageID,
        roomID,
        userID: userID,
        text: messageText,
      });

      console.log(`room:${roomID} user:${userID} sent message`);
    }
  );

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});
