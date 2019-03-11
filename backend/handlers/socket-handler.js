const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;

const db = mongoose.connection;

const _ = require('underscore');

function makeHandleEvent(client, clientManager, chatroomManager) {
	function ensureExists(getter, rejectionMessage) {
		return new Promise(function (resolve, reject) {
			const res = getter()
			return res
				? resolve(res)
				: reject(rejectionMessage)
		})
	}

	function ensureUserSelected(clientId) {
		return ensureExists(
			() => clientManager.getUserByClientId(clientId),
			'select user first'
		)
	}

	function ensureValidChatroom(chatroomId) {
		return ensureExists(
			() => chatroomManager.getChatroomByName(chatroomId),
			`invalid chatroom name: ${chatroomId}`
		)
	}

	function ensureValidChatroomAndUserSelected(chatroomId) {
		return Promise.all([
			ensureValidChatroom(chatroomId),
			ensureUserSelected(client.id)
		])
			.then(([chatroom, user]) => Promise.resolve({ chatroom, user }))
	}

	function handleEvent(chatroomId, createEntry) {
		return ensureValidChatroomAndUserSelected(chatroomId)
			.then(function ({ chatroom, user }) {
				// append event to chat history
				const entry = { user, ...createEntry(), time: new Date() }
				chatroom.addEntry(entry)

				// update record in db
				chatroom.getChatHistory(chatroomId, (chatHistory) => {
					db.collection("chatroom").updateMany(
						{ "_id": ObjectId(chatroomId) },
						{$set: {chatHistory: chatHistory}
					})
				})

				// notify other clients in chatroom
				chatroom.broadcastMessage({ chat: chatroomId, ...entry })

				return chatroom
			})
	}

	return handleEvent
}

module.exports = function (client, clientManager, chatroomManager) {
	const handleEvent = makeHandleEvent(client, clientManager, chatroomManager)

	function handleRegister(userName, callback) {
		clientManager.getUserByName(userName, function (user) {
			clientManager.registerClient(client, user)
			// return callback(null, user)
		})
	}

	function handleJoin(chatroomId, callback) {
		const createEntry = () => ({ event: `joined` })

		handleEvent(chatroomId, createEntry)
			.then(function (chatroom) {
				// callback(null)
			})
			.catch(callback)
	}

	function handleLeave(chatroomId, callback) {
		const createEntry = () => ({ event: `left` })

		handleEvent(chatroomId.chatroomId, createEntry)
			.then(function (chatroom) {
				// remove member from chatroom
				chatroom.removeUser(client.id, clientManager)

				callback(null)
			})
			.catch(callback)
	}

	function handleEnterChatroom (chatroomId, callback) {
		const currentChatroom = chatroomManager.getChatroomByName(chatroomId);
		currentChatroom.addUser(client, clientManager);
		if (callback) {
			return chatroomManager.getChatHistory(chatroomId, callback);
		}
	}

	function handleExitChatroom (chatroomId) {
		const currentChatroom = chatroomManager.getChatroomByName(chatroomId);
		if (currentChatroom) {
			currentChatroom.removeUser(client, clientManager);
		}
	}

	function handleGetChatHistory(chatroomId, callback) {
		return chatroomManager.getChatHistory(chatroomId, callback);
	}

	function handleCurrentOnlineMembers (chatroomId, callback) {
		const currentChatroom = chatroomManager.getChatroomByName(chatroomId);
		const members = currentChatroom.getMembers();
		const memberList = [];
		members.forEach((m, clientId) => {
			const userDetails = clientManager.getUserDetails(clientId)
			memberList.push(userDetails)

		});

		return callback(memberList);
	}

	function handleMessage({ chatroomId, message } = {}, callback) {
		const createEntry = () => ({ message })

		handleEvent(chatroomId, createEntry)
			.then(() => callback(null))
			.catch(callback)
	}

	function handleNewChatroom(chatroom, callback) {
		return callback(chatroomManager.addChatroom(chatroom))
	}

	function handleGetChatrooms(_, callback) {
		return callback(null, chatroomManager.serializeChatrooms())
	}

	function handleGetAvailableUsers(_, callback) {
		return callback(null, clientManager.getAvailableUsers())
	}



	function handleDisconnect() {
		// remove user profile
		clientManager.removeClient(client)
		// remove member from all chatrooms
		// chatroomManager.removeClient(client, clientManager)
	}

	return {
		handleRegister,
		handleNewChatroom,
		handleJoin,
		handleLeave,
		handleEnterChatroom,
		handleExitChatroom,
		handleGetChatHistory,
		handleCurrentOnlineMembers,
		handleMessage,
		handleGetChatrooms,
		handleGetAvailableUsers,
		handleDisconnect,
	}
}
