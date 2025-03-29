const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const e = require("express");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/chat", (req, res) => {
  res.sendFile(__dirname + "/chat.html");
});

app.get("/chat/:socket_id", (req, res) => {
  res.sendFile(__dirname + "/chat.html");
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`listening on *:${port}`);
});

let users = [];
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const validToken = "1234";
  if (token === validToken) next();
  else console.log("token inValid");
});
io.on("connection", (socket) => {
  // console.log(`a user connected`);

  socket.on("login", (name) => {
    const temp = name;
    users = users.filter((user) => user.id !== temp.id);
    users.push({
      ...temp,
      socket_id: socket.id,
    });

    io.emit("online_user", users);
  });
  socket.on("disconnect", () => {
    const temp_socket_id = socket.id;
    users = users.filter((user) => user.socket_id !== temp_socket_id);
    io.emit("online_user", users);

    console.log("user disconnected");
  });

  socket.on("chat message", (msg) => {
    if (msg?.to)
      io.to(msg.to).emit("chat message", {
        ...msg,
        user_id: socket.id,
        from: socket.id,
      });
    else io.emit("chat message", { ...msg, user_id: socket.id });
  });

  socket.on("typing", (data) => {
    // send to all connection
    socket.broadcast.emit("typing", data);
  });
});
