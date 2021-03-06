const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ChatroomJoinedSchema = new Schema({
    chatroomId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    messagesRead: {
    	type: Number
    },
    lastRead: {
    	type: Date
    }
}, {
	collection: 'chatroomjoined'
});

const ChatroomJoined = mongoose.model('chatroomJoined', ChatroomJoinedSchema);

module.exports = ChatroomJoined;