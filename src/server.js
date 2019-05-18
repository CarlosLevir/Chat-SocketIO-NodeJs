const express = require('express');
const cors = require('cors');
const path = require('path');
const ejs = require('ejs');

const app = express();

app.use(cors());

const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(express.static(path.resolve(__dirname, '..', 'public')));
app.set('views', path.resolve(__dirname, '..', 'public'));

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.use('/', (req, res) => {
  res.render('index.html');
});

let messages = [];

io.on('connection', socket => {
  socket.emit('previousMessages', messages);
  socket.on('newMessage', newMessage => {
    const { address, port } = socket.request.connection._peername;

    messages.push({ address: `${address}:${port}`, newMessage });

    io.emit('receivedMessage', { address: `${address}:${port}`, newMessage });
  })
});

server.listen(3000);
