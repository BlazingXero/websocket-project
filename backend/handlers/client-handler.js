const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;

const db = mongoose.connection;

module.exports = function () {
	// mapping of all connected clients
	const clients = new Map()

	function registerClient(client, user) {
		clients.set(client.id, { client, user });
	}

	function removeClient(client) {
		clients.delete(client.id)
	}

	function isUserOnline(userId) {
		return _.findWhere(clients, function (c) {
			return c.user._id === ObjectId(userId);
		}).length > 0;
	}

	function getUserDetails(clientId) {
		const client = clients.get(clientId);
		if (client) {
			return clients.get(clientId).user;
		} else {
			return null;
		}

	}

	// function getAvailableUsers() {
	// 	const usersTaken = new Set(
	// 		Array.from(clients.values())
	// 			.filter(c => c.user)
	// 			.map(c => c.user.name)
	// 	)
	// 	return userTemplates
	// 		.filter(u => !usersTaken.has(u.name))
	// }

	function getUserByName(userName, callback) {
		db.collection("user").findOne(
			{ "_id": ObjectId(userName) },
			{ projection: {
				firstname: 1,
				lastname: 1,
				username: 1,
				email: 1,
				avatar: 1
			} },
			function (err, user) {
				if (err) throw err;
				return callback(user);
			}
		)
	}

	function getUserByClientId(clientId) {
		return (clients.get(clientId) || {}).user
	}

	return {
		getUserByName,
		getUserDetails,
		registerClient,
		removeClient,
		getUserByClientId
	}
}