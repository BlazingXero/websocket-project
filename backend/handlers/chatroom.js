const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;

const db = mongoose.connection;

module.exports = function ({ name, image }) {
	const members = new Map()
	let chatHistory = []

	function broadcastMessage(message) {
		members.forEach(m => m.emit('message', message))
	}

	function addEntry(entry) {
		chatHistory = chatHistory.concat(entry);
	}

	function getChatHistory(chatroomId, callback) {
		if (!chatHistory || chatHistory.length ==0) {
			db.collection("chatroom").findOne({_id: ObjectId(chatroomId)}, function (err, chatroomData) {
				if (err) throw err;
				if (chatroomData.chatHistory) {
					chatHistory = chatroomData.chatHistory;
				}
				return callback(chatroomData.chatHistory || []);
			})
		} else {
			return callback(chatHistory.slice())
		}
	}

	function addUser(client, clientManager) {
		const userDetails = clientManager.getUserDetails(client.id)
		members.set(client.id, client)
		updateOnlineStatus(userDetails, true)
	}

	function removeUser(client, clientManager) {
		const userDetails = clientManager.getUserDetails(client.id)
		members.delete(client.id)
		updateOnlineStatus(userDetails, false)
	}

	function updateOnlineStatus(userDetails, status) {
		if (userDetails) {
			members.forEach(m => {
				m.emit('userOnlineStatusChange', {user: userDetails, status: status})
			});
		}
	}

	function getMembers() {
		return members;
	}

	function serialize() {
		return {
			name,
			image,
			numMembers: members.size
		}
	}

	return {
		broadcastMessage,
		addEntry,
		getChatHistory,
		addUser,
		removeUser,
		getMembers,
		serialize
	}
}
