const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ChatroomSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	creatorId: {
		type: String,
		required: true
	},
	creatorUsername: {
		type: String,
		required: true
	},
	description: {
		type: String,
	},
	icon: {
		type: String,
	},
	chatHistory: {
		type: Array,
	},
	createdDate: {
		type: Date,
		default: Date.now
	}
}, {
	collection: 'chatroom'
});

const Chatroom = mongoose.model('chatroom', ChatroomSchema);

module.exports = Chatroom;