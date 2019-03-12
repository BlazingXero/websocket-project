// TODO
// save chatHistory to DB
// remap rooms on server start


const express = require('express');
// const server = require('http').createServer()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const config = require('./db');
const handlers = require('./handlers/socket-handler.js');
const makeHandlers = require('./handlers/socket-handler');
const ClientManager = require('./handlers/client-handler');
const ChatroomManager = require('./handlers/chatroom-manager');

const users = require('./routes/user');
const chatroom = require('./routes/chatroom');

const clientManager = ClientManager();
const chatroomManager = ChatroomManager();

mongoose.connect(config.auth, { useNewUrlParser: true }).then(
    () => {
    	chatroomManager.getAllChatrooms();
    	console.log('AuthDB is connected')
    },
    err => { console.log('Can not connect to the database'+ err)}
);

// mongoose.connect(config.chat, { useNewUrlParser: true }).then(
//     () => {console.log('ChatDB is connected') },
//     err => { console.log('Can not connect to the database'+ err)}
// );

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http)
app.use(passport.initialize());
require('./passport')(passport);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api/users', users);
app.use('/api/chatroom', chatroom);

app.get('/', function(req, res) {
    res.send('hello');
});

io.on('connection', function (client) {
	// chatroomManager.getAllChatrooms();
	console.log('a user connected', client.id);

	const {
		handleRegister,
		handleUnregister,
		handleJoin,
		handleLeave,
		handleMessage,
		// handleGetChatrooms,
		// handleGetAvailableUsers,
		handleNewChatroom,
		handleEnterChatroom,
		handleGetChatHistory,
		handleDisconnect,
		// handleJoinChatroom,
		handleCurrentOnlineMembers,
		handleExitChatroom
	} = makeHandlers(client, clientManager, chatroomManager)

	client.on('register', handleRegister)

	client.on('unregister', handleUnregister)

	client.on('join', handleJoin)

	client.on('leave', handleLeave)

	client.on('enterChatroom', handleEnterChatroom)

	client.on('exitChatroom', handleExitChatroom)

	client.on('getChatHistory', handleGetChatHistory)

	client.on('currentOnlineMembers', handleCurrentOnlineMembers)

	client.on('message', handleMessage)

	client.on('newChatroom', handleNewChatroom)

	client.on('disconnect', function () {
		console.log('client disconnect...', client.id)
		handleDisconnect()
	})

	client.on('error', function (err) {
		console.log('received error from client:', client.id)
		console.log(err)
	})
})

const PORT = process.env.PORT || 5000;

http.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});