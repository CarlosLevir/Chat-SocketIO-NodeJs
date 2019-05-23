const express = require("express");
const cors = require("cors");
const path = require("path");
const ejs = require("ejs");
require("dotenv").config();

const app = express();

app.use(cors());

const server = require("http").Server(app);
const io = require("socket.io")(server);

app.use(express.static(path.resolve(__dirname, "..", "public")));
app.set("views", path.resolve(__dirname, "..", "public"));

app.engine("html", ejs.renderFile);
app.set("view engine", "html");

app.use("/", (req, res) => {
  res.render("index.html");
});

let messages = [];
let socketIds = [];

io.on("connection", socket => {
  socketIds[socket.request.connection._peername.address.replace(/[f:]/g, "")] =
    socket.id;
  socket.emit("previousMessages", messages);
  socket.on("newMessage", data => {
    const { newMessage, ip } = data;
    const { address, port } = socket.request.connection._peername;

    if (ip !== "") {
      io.to(socketIds[ip]).emit("receivedMessage", {
        address: `${address}:${port}`,
        newMessage
      });
    } else {
      messages.push({ address: `${address}:${port}`, newMessage });

      io.emit("receivedMessage", { address: `${address}:${port}`, newMessage });
    }
  });
});

server.listen(process.env.PORT || 3000);
