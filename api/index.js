import express from 'express';
import cors from 'cors'
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const PORT = process.env.PORT || 3001;

console.log(`Configured port: ${PORT}`);
const app = express();
const server = createServer(app);
const io = new Server(server,{
  cors:{
    origin:"*",
    methods:["GET","POST"],
    credentials:true,  
  }
})
const __dirname = path.resolve()
// const httpServer = createServer((req, res) => {
//   res.writeHead(200, { 'Content-Type': 'text/plain' });
//   // res.end('Server is running');
// });

// const io = new Server(httpServer, {
//   cors: {
//     origin: '*', // Allow all origins
//     methods: ['GET', 'POST'],
//   },
// });

console.log('Socket.io server created');
app.use(cors())
const allUsers = {};
const allRooms = [];

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);
  allUsers[socket.id] = {
    socket: socket,
    online: true,
  };

  socket.on('request_to_play', (data) => {
    const currentUser = allUsers[socket.id];
    currentUser.playerName = data.playerName;

    let opponentPlayer;

    for (const key in allUsers) {
      const user = allUsers[key];
      if (user.online && !user.playing && socket.id !== key) {
        opponentPlayer = user;
        break;
      }
    }

    if (opponentPlayer) {
      allRooms.push({
        player1: opponentPlayer,
        player2: currentUser,
      });

      currentUser.socket.emit('OpponentFound', {
        opponentName: opponentPlayer.playerName,
        playingAs: 'circle',
      });

      opponentPlayer.socket.emit('OpponentFound', {
        opponentName: currentUser.playerName,
        playingAs: 'cross',
      });

      currentUser.socket.on('playerMoveFromClient', (data) => {
        opponentPlayer.socket.emit('playerMoveFromServer', {
          ...data,
        });
      });

      opponentPlayer.socket.on('playerMoveFromClient', (data) => {
        currentUser.socket.emit('playerMoveFromServer', {
          ...data,
        });
      });
    } else {
      currentUser.socket.emit('OpponentNotFound');
    }
  });

  socket.on('disconnect', () => {
    const currentUser = allUsers[socket.id];
    currentUser.online = false;
    currentUser.playing = false;

    for (let index = 0; index < allRooms.length; index++) {
      const { player1, player2 } = allRooms[index];

      if (player1.socket.id === socket.id) {
        player2.socket.emit('opponentLeftMatch');
        break;
      }

      if (player2.socket.id === socket.id) {
        player1.socket.emit('opponentLeftMatch');
        break;
      }
    }
  });
});

server.listen(PORT,()=>{
  console.log(`Server is running on port ${PORT}`)
})
// httpServer.listen(PORT, () => {
//   console.log(`Server is listening on port ${PORT}`);
// });
app.use(express.static(path.join(__dirname,'/client/dist')))
app.get('*',(req,res)=>{
  res.sendFile(path.join(__dirname,'client','dist','index.html'))
})