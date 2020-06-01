let io;
const Room = require("./models/room");
const Message = require("./models/message");
const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object

const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.connected[socketid];

const addUser = (user, socket) => {
  const oldSocket = userToSocketMap[user.userID];
  if (oldSocket && oldSocket.id !== socket.id) {
    // there was an old tab open for this user, force it to disconnect
    // FIXME: is this the behavior you want?
    oldSocket.disconnect();
    delete socketToUserMap[oldSocket.id];
  }

  userToSocketMap[user.userID] = socket;
  socketToUserMap[socket.id] = user;
};

const removeUser = (user, socket) => {
  if (user) delete userToSocketMap[user.userID];
  delete socketToUserMap[socket.id];
};

module.exports = {
  init: (http) => {
    io = require("socket.io")(http, {pingTimeout: 60000});

    io.on("connection", (socket) => {
      console.log(`socket has connected ${socket.id}`);
      socket.on("disconnect", (reason) => {
        const user = getUserFromSocketID(socket.id);
        removeUser(user, socket);
        if(user) {
        Room.findOne({roomID: user.roomID}).then((room) => {
          let data = room.data 
          data = data.filter((entry) => {return entry.userID !== user.userID})
          room.data = data
          room.save()
        })
        io.emit("removeUser", {userID: user.userID, roomID: user.roomID});
        let message = new Message({
          sender: {userID: user.userID, userName: user.userName},
          roomID: user.roomID, 
          message: user.userName + " left the Room",
          systemMessage: true
        })
        message.save()
        io.emit("newMessage", message)

        }
      });
    });
  },

  addUser: addUser,
  removeUser: removeUser,

  getSocketFromUserID: getSocketFromUserID,
  getUserFromSocketID: getUserFromSocketID,
  getSocketFromSocketID: getSocketFromSocketID,
  getIo: () => io,
};
