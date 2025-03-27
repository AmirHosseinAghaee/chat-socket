const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`listening on *:${port}`);
});

io.on("connection", (socket) => {
  console.log(`a user connected`);

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", { ...msg, user_id: socket.id });
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing" , data)
    // io.emit("typing", data ? { ...data, user_id: socket.id } : {});
  });
});
