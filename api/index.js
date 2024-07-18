// const { createServer } = require("http");
// const { Server } = require("socket.io");
import { createServer } from "http";
import { Server } from "socket.io";
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: "http://localhost:5174/",
});

// ham all users mai sare users ke socket push karenge
// all users has two properties socket and online
const allUsers = {};
const allRooms = [];
// 1 on connecting to a new socket we will perform this operations
io.on("connection", (socket) => {
  allUsers[socket.id] = {
    socket: socket,
    online: true,
  };
  // 3 on emit on client we will listen the request here on the server side and will get the playername 
  socket.on("request_to_play", (data) => {
    // here we are taking the name of the player we get the client
    const currentUser = allUsers[socket.id];
    // we created this playername because we created it as property of currentUser and in the data we sent the playername   
    currentUser.playerName = data.playerName;

    let opponentPlayer;
    // now we will find a opponent player 
    for (const key in allUsers) {
      const user = allUsers[key];
      // we also need to see that the user is not the same user we are searching for
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

      currentUser.socket.emit("OpponentFound", {
        opponentName: opponentPlayer.playerName,
        playingAs: "circle",
      });
      
      // 4 if the opponent is found we will tell both the current user and the opponent that they can begin game and send their opponent name
      opponentPlayer.socket.emit("OpponentFound", {
        opponentName: currentUser.playerName,
        playingAs: "cross",
      });
      // as a player makes a move we have to pass that state to both the sides to see the changes
      currentUser.socket.on("playerMoveFromClient", (data) => {
        // jo data hame currentplayer se mila use ham opponent ke pas pahucha rhe hai 
        opponentPlayer.socket.emit("playerMoveFromServer", {
          ...data,
        }); 
      });

      opponentPlayer.socket.on("playerMoveFromClient", (data) => {
        currentUser.socket.emit("playerMoveFromServer", {
          ...data,
        });
      });
    } else {
      currentUser.socket.emit("OpponentNotFound");
    }
  });
  // 2 here we are disconnecting a user first we will find that user by socket id 
  socket.on("disconnect", function () {
    const currentUser = allUsers[socket.id];
    currentUser.online = false;
    currentUser.playing = false;

    for (let index = 0; index < allRooms.length; index++) {
      const { player1, player2 } = allRooms[index];

      if (player1.socket.id === socket.id) {
        player2.socket.emit("opponentLeftMatch");
        break;
      }

      if (player2.socket.id === socket.id) {
        player1.socket.emit("opponentLeftMatch");
        break;
      }
    }
  });
});

httpServer.listen(3000);
