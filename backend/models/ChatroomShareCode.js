const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ChatroomShareCodeSchema = new Schema({
    chatroomId: {
        type: String,
        required: true
    },
    shareCode: {
        type: String,
        required: true
    },
    date: {
    	type: Date,
        required: true
    }
}, {
	collection: 'chatroomsharecode'
});

const ChatroomShareCode = mongoose.model('chatroomShareCode', ChatroomShareCodeSchema);

module.exports = ChatroomShareCode;