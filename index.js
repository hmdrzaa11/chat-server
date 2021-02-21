let express = require("express");
require("dotenv").config();
let socketio = require("socket.io");
let router = require("./routes/router");
let cors = require("cors");
let { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

let app = express();
app.use(cors());

//routes
app.use(router);

let PORT = process.env.PORT || 8000;

let server = app.listen(PORT, "localhost", () =>
  console.log("server on port ", PORT)
);

let io = socketio(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("we have a new connection!!!!!!");
  /******************JOIN********************* */
  socket.on("join", ({ name, room }, callback) => {
    let { user, error } = addUser({ id: socket.id, name, room });
    if (error) {
      return callback(error);
    }

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    socket.emit("message", {
      user: "admin",
      text: `${user.name} welcome to the room ${user.room}`,
    });
    socket.broadcast.to(room).emit("message", {
      user: "admin",
      text: `${user.name}, has joined`,
    });
    //here if there is no error we join user to a room
    socket.join(user.room);
    //give whole users info
    io.to(user.room).emit("roomInfo", { users: getUsersInRoom(user.room) });
    callback();
    socket.on("disconnect", () => {
      io.to(user.room).emit("roomInfo", { users: getUsersInRoom(user.room) });
      socket.broadcast.to(user.room).emit("message", {
        user: user.name,
        text: `${user.name}, has left`,
      });
    });
  });

  /********************* Receiving Messages **************************** */
  socket.on("sendMessage", (message, callback) => {
    let user = getUser(socket.id);
    //emit to all that inside of the room
    io.to(user.room).emit("message", { user: user.name, text: message });
    callback();
  });

  /************************Disconnecting***************************************** */
  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});
