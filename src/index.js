import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import path from 'path';
import morgan from 'morgan';

import ChatEvents from './events/chat';

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

io.on('connection', (socket) => {
  console.log('User connected', socket.id);
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
