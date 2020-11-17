/* eslint-disable prefer-destructuring */
/*
 * Require
 */
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config()
const Server = require('http').Server;
// Une Librairie SOCKET.IO
const socket = require('socket.io');


/*
 * Vars
 */
const app = express();
const server = Server(app);
// Initialisation du socket
const io = socket(server);
const port = process.env.PORT || 3001;

const db = {
  users: {
    'johndoe@gmail.com': {
      password: '2020',
      username: 'John',
    },
  }
};

/*
 * Express
 */
app.use(bodyParser.json());
app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', '*');
  // response.header('Access-Control-Allow-Credentials', true);
  response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  response.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

// Page d'accueil du serveur : GET /
app.get('/', (req, res) => {
  res.send('Chatroom Server');
});

/*
 * Socket.io
 */
// 
let id = 0;
// Le server de socket.io écoute l'évènement connexion et une fois l'user connecté, le server va créer 
// un websocket (ws)
io.on('connection', (ws) => {
  console.log('>> socket.io - connected');
  // ws sert à écouter l'évènement "send_message" (un channel) et à éxecuter la fonction dans le callback
  ws.on('send_message', (message) => {
    // eslint-disable-next-line no-plusplus
    // ajouter un ID à un nouveau message
    message.id = ++id;
    // envoyer le nouveau message à tous les clients qui écoutent ce channel là
    io.emit('send_message', message);
  });
});

// Login avec vérification : POST /login
app.post('/login', (req, res) => {
  console.log('>> POST /login', req.body);

  // Extraction des données de la requête provenant du client.
  const { email, password } = req.body;

  // Vérification des identifiants de connexion proposés auprès de la DB.
  let username;
  if (db.users[email] && db.users[email].password === password) {
    username = db.users[email].username;
  }

  // Réponse HTTP adaptée.
  if (username) {
    console.log('<< 200 OK', username);
    res.send(username);
  }
  else {
    console.log('<< 401 UNAUTHORIZED');
    res.status(401).end();
  }
});

/*
 * Server
 */
server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
