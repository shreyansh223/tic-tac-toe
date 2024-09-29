const express = require('express');

const mongoose = require('mongoose');
const app = express();
const path = require('path');
const http = require('http');
const User = require('./models/User');
const { Server } = require('socket.io');
const cors = require('cors');
app.use(express.json());
app.use(cors());
const server = http.createServer(app);

const io = new Server(server);
try {
  mongoose.connect(
    'mongodb+srv://shreyanshgupta0440:Xk7k7x53mJOe8V7l@cluster0.nascm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
  );
} catch (err) {
  console.log('Failed to connect with mongodb');
}
app.use(express.static(path.resolve('')));
let arr = [];
let playingArray = [];
io.on('connection', (socket) => {
  socket.on('find', (e) => {
    if (e != null) {
      const { name, email } = e;
      arr.push({ name, email });
      if (arr.length >= 2) {
        let p1obj = {
          p1name: arr[0].name,
          p1email: arr[0].email,
          p1value: 'X',
          p1move: '',
        };
        let p2obj = {
          p2name: arr[1].name,
          p2email: arr[1].email,
          p2value: 'O',
          p2move: '',
        };
        let obj = {
          p1: p1obj,
          p2: p2obj,
          sum: 1,
        };
        playingArray.push(obj);
        arr.splice(0, 2);
        io.emit('find', { allPlayers: playingArray });
      }
    }
  });

  socket.on('playing', (e) => {
    console.log(e);
    console.log(playingArray);
    if (e.value == 'X') {
      let objToChange = playingArray.find((obj) => obj.p1.p1name == e.name);
      objToChange.p1.p1move = e.id;
      objToChange.sum++;
    } else if (e.value == 'O') {
      let objToChange = playingArray.find((obj) => obj.p2.p2name == e.name);
      objToChange.p2.p2move = e.id;
      objToChange.sum++;
    }
    io.emit('playing', { allPlayers: playingArray });
  });
  socket.on('gameOver', (e) => {
    playingArray = playingArray.filter((obj) => obj.p1.p1name != e.name);
  });
});

app.get('/', (req, res) => {
  return res.sendFile('index.html');
});
app.post('/login', async (req, res) => {
  const { name, email, password } = req.body;
  console.log(req.body);
  const user = await User.findOne({ email });
  if (!user || user == null || user == undefined) {
    const newUser = new User({
      name,
      email,
      password,
    });
    await newUser.save();
    res.json({
      wins: 0,
      lose: 0,
      draw: 0,
    });
  } else {
    if (password == user.password) {
      res.json({
        body: {
          wins: user.wins,
          lose: user.lose,
          draw: user.draw,
        },
      });
    }
  }
});
app.post('/stats', async (req, res) => {
  const { oppEmail } = req.body;
  const user = await User.findOne({ email: oppEmail });
  if (!user) {
    res.json({ message: 'user not found' });
  } else {
    res.json({ wins: user.wins, lose: user.lose, draw: user.draw });
  }
});
app.post('/result', async (req, res) => {
  const { winner, loser, draw } = req.body;
  if (draw) {
    const user1 = await User.findOneAndUpdate(
      { email: winner },
      { $inc: { draw: 1 } }
    );
    const user2 = await User.findOneAndUpdate(
      { email: loser },
      { $inc: { draw: 1 } }
    );
  } else {
    const user1 = await User.findOneAndUpdate(
      { email: winner },
      { $inc: { wins: 1 } }
    );
    const user2 = await User.findOneAndUpdate(
      { email: loser },
      { $inc: { lose: 1 } }
    );
  }
});
server.listen(3000, () => {
  console.log('port connected to 3000');
});
//Xk7k7x53mJOe8V7ls
