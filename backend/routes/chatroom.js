const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const _ = require('underscore');
const validateChatroomInput = require('../validation/chatroom');
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;

const db = mongoose.connection;
const Chatroom = require('../models/Chatroom');
const ChatroomJoined = require('../models/ChatroomJoined');
const ChatroomShareCode = require('../models/ChatroomShareCode');

router.post('/create', (req, res) => {
	const { errors, isValid } = validateChatroomInput(req.body);

	if(!isValid) {
		return res.status(400).json(errors);
	}

	const newChatroom = new Chatroom({
		title: req.body.title,
		creatorId: req.body.creatorId,
		creatorUsername: req.body.creatorUsername,
		description: req.body.description,
		icon: 'laptop'
	});
	newChatroom
		.save()
		.then(chatroom => {
			const chatroomId = chatroom._id;
			const userId = req.body.creatorId
			const newChatroomJoined = new ChatroomJoined({
				chatroomId: chatroomId,
				userId: userId
			});
			newChatroomJoined
			.save()
			.then(chatroomJoined => {
				res.json(chatroom)
			});
		});
});

router.get('/get_joined_chatrooms', (req, res) => {
	const userId = req.query.userId;

	ChatroomJoined.aggregate([
		{ $match : { userId  : userId } },
		{ $lookup : {
			from: "chatroom",
			"let": { "chatroom_id": { "$toObjectId": "$chatroomId" } },
			"pipeline": [
				{ "$match": { "$expr": { "$eq": [ "$_id", "$$chatroom_id" ] } } }
		    ],
			as: "chatroom"
		}}
	])
	.then(chatroom => {
		res.json(chatroom)
	});
});

router.get('/get_chatroom_members', (req, res) => {
	const chatroomId = req.query.chatroomId;
	ChatroomJoined.aggregate([
		{ $match : { chatroomId  : chatroomId } },
		{ $lookup : {
			from: "user",
			let: { "user_id": { "$toObjectId": "$userId" } },
			pipeline: [
				{ "$match": { "$expr": { "$eq": [ "$_id", "$$user_id" ] } } }
		    ],
			as: "user"
		}}
	])
	.then(user => {
		let users = [];
		_.each(user, function (u) {
			const thisUser = u.user[0];
			users.push({
				id: thisUser._id,
				firstname: thisUser.firstname,
				lastname: thisUser.lastname,
				username: thisUser.username,
				avatar: thisUser.avatar,
				online: false
			});
		});
		res.json(users)
	});
})

router.post('/leave_chatroom', (req, res) => {
	ChatroomJoined.deleteOne(req.body, function (err, obj) {
		if (err) {
			res.json(err);
		} else {
			res.json(null);
		}
	});
})

router.post('/create_share_code', (req, res) => {
	// todo check for existing code and upate date if present
	let code = "";
	const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (let i = 0; i < 5; i++)
		code += char.charAt(Math.floor(Math.random() * char.length));
	const newChatroomShareCode = new ChatroomShareCode({
		chatroomId: req.body.chatroomId,
		shareCode: code,
		date: new Date(),
	});

	newChatroomShareCode
		.save()
		.then(shareCode => {
			res.json({shareCode: shareCode.shareCode})
		})
})

router.post('/join_using_code', (req, res) => {
	const shareCode = req.body.shareCode;
	const userId = req.body.userId;
	ChatroomShareCode.findOne({shareCode}, function (err, result) {
		if (!err) {
			if (result) {
				const chatroomId = result.chatroomId
				ChatroomJoined.findOne({chatroomId, userId}, function (err, result) {
					if (!err && !result) {
						const newChatroomJoined = new ChatroomJoined({
							chatroomId: chatroomId,
							userId: userId
						});
						newChatroomJoined
							.save()
							.then(chatroomJoined => {
								res.json({chatroomId})
							});
					} else {
						return res.status(400).json({shareCode: 'Already joined chatroom'});
					}
				})
			} else {
				return res.status(400).json({shareCode: 'Code is invalid'});
			}
		}
	})
})

router.post('/update_chatroom_data', (req, res) => {
	const chatroomId = req.body.chatroomId;
	const messagesRead = req.body.messagesRead;
	const userId = req.body.userId;
	ChatroomJoined.updateOne(
		{ chatroomId, userId },
		{ $set: {
			lastRead: new Date(),
			messagesRead: messagesRead
		}
		
	}, function(err, result) {
		if (err) {
			throw err;
			return res.status(400).json(err);
		}
		
		res.json({chatroomId})
  	})
})

module.exports = router;