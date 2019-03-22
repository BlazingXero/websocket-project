const mongoose = require('mongoose');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	firstname: {
		type: String,
		required: true
	},
	lastname: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	avatar: {
		type: String
	},
	googleProvider: {
		type: {
			id: String,
			token: String
		},
		select: false
	},
	date: {
		type: Date,
		default: Date.now
	}
}, {
	collection: 'user'
});

UserSchema.set('toJSON', {getters: true, virtuals: true});

UserSchema.statics.upsertGoogleUser = function(accessToken, refreshToken, profile, cb) {
	var that = this;
	return this.findOne({
		'googleProvider.id': profile.id
	}, function(err, user) {
		// no user was found, lets create a new one
		if (!user) {
			const avatar = gravatar.url(profile.emails[0].value, {
				s: '200',
				r: 'pg',
				d: 'mm'
			});
			let password = "";
			const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

			for (let i = 0; i < 9; i++)
				password += char.charAt(Math.floor(Math.random() * char.length));
			
			var newUser = new that({
				firstname: profile.name.givenName,
				lastname: profile.name.familyName,
				username: profile.displayName,
				email: profile.emails[0].value,
				password,
				avatar,
				googleProvider: {
					id: profile.id,
					token: accessToken
				}
			});

			bcrypt.genSalt(10, (err, salt) => {
				if(err) console.error('There was an error');
				else {
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if(err) console.error('There was an error');
						else {
							newUser.password = hash;
							newUser
								.save()
								.then(user => {
									return cb(null, user)
								});
						}
					});
				}
			});
		} else {
			return cb(err, user);
		}
	});
};

const User = mongoose.model('users', UserSchema);

module.exports = User;