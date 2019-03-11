const io = require('socket.io-client')

const socket = io.connect('http://localhost:3000')

export default function () {
	function registerMessageHandler (onMessageReceived) {
		socket.on('message', onMessageReceived)
	}

	function registerUserOnlineStatusChange (userStatus) {
		socket.on('userOnlineStatusChange', userStatus)
	}

	function unregisterHandler() {
		socket.off('message')
		socket.off('userOnlineStatusChange')
	}

	socket.on('error', function (err) {
		console.log('received socket error:')
		console.log(err)
	})

	function socketRegister(user, cb) {
		socket.emit('register', user)
	}

	function socketJoin(chatroomId) {
		socket.emit('join', chatroomId)
	}

	function socketLeave(chatroomId, cb) {
		socket.emit('leave', {chatroomId}, cb)
	}

	function socketEnterChatroom (chatroomId, cb) {
		socket.emit('enterChatroom', chatroomId, cb)
	}

	function socketExitChatroom (chatroomId) {
		socket.emit('exitChatroom', chatroomId)
	}

	function socketGetChatHistory(chatroomId, cb) {
		socket.emit('getChatHistory', chatroomId, cb)
	}

	function socketMessage(chatroomId, message, cb) {
		socket.emit('message', {chatroomId, message}, cb)
	}

	function socketCurrentOnlineMembers (chatroomId, cb) {
		socket.emit('currentOnlineMembers', chatroomId, cb)
	}

	function socketNewChatroom(chatroom, cb) {
		socket.emit('newChatroom', chatroom, cb)
	}

	function socketGetChatroomHistory(chatroomId, cb) {
		socket.emit('getChatroomHistory', chatroomId, cb)
	}

	return {
		registerMessageHandler,
		registerUserOnlineStatusChange,
		unregisterHandler,
		socketRegister,
		socketJoin,
		socketLeave,
		socketEnterChatroom,
		socketExitChatroom,
		socketGetChatHistory,
		socketCurrentOnlineMembers,
		socketMessage,
		socketNewChatroom,
		socketGetChatroomHistory
	}
}