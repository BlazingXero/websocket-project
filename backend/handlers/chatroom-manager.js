const Chatroom = require('./chatroom')
// const chatroomTemplates = require('../config/chatrooms')

const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;

const db = mongoose.connection;

module.exports = function () {
	const chatrooms = new Map()

	// mapping of all available chatrooms
	function getAllChatrooms () {
		db.collection("chatroom").find({}).toArray(function(err, result) {
			if (err) throw err;
			result.forEach(function(r) {
				chatrooms.set(r._id.toString(), Chatroom(r))
			})
		});
	}

	function removeClient(client, clientManager) {
		chatrooms.forEach(c => c.removeUser(client, clientManager))
	}

	function getChatroomByName(chatroomName) {
		return chatrooms.get(chatroomName)
	}

	function addChatroom (newChatroom, callback) {
		chatrooms.set(newChatroom._id.toString(), Chatroom(newChatroom, callback))
	}

	function getChatHistory(chatroomId, callback) {
		const currentChatroom = chatrooms.get(chatroomId);
		return currentChatroom.getChatHistory(chatroomId, callback);
	}

	function getChatroomMembers(chatroomId, callback) {
		const currentChatroom = chatrooms.get(chatroomId);
		currentChatroom.getMembers()
	}

	function serializeChatrooms() {
		return Array.from(chatrooms.values()).map(c => c.serialize())
	}

	return {
		getAllChatrooms,
		removeClient,
		getChatroomByName,
		addChatroom,
		getChatHistory,
		serializeChatrooms
	}
}