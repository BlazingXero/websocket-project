const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');
const validateUpdateInput = require('../validation/update');

const User = require('../models/User');

router.post('/register', function(req, res) {

	const { errors, isValid } = validateRegisterInput(req.body);

	if(!isValid) {
		return res.status(400).json(errors);
	}
	User.findOne({
		email: req.body.email
	}).then(user => {
		if(user) {
			return res.status(400).json({
				email: 'Email already exists'
			});
		}
		else {
			const avatar = gravatar.url(req.body.email, {
				s: '200',
				r: 'pg',
				d: 'mm'
			});
			const newUser = new User({
				firstname: req.body.firstname,
				lastname: req.body.lastname,
				username: req.body.username,
				email: req.body.email,
				password: req.body.password,
				avatar
			});

			bcrypt.genSalt(10, (err, salt) => {
				if(err) console.error('There was an error', err);
				else {
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if(err) console.error('There was an error', err);
						else {
							newUser.password = hash;
							newUser
								.save()
								.then(user => {
									res.json(user)
								});
						}
					});
				}
			});
		}
	});
});

router.post('/login', (req, res) => {

	const { errors, isValid } = validateLoginInput(req.body);

	if(!isValid) {
		return res.status(400).json(errors);
	}

	const email = req.body.email;
	const password = req.body.password;

	User.findOne({email})
		.then(user => {
			if(!user) {
				errors.email = 'User not found'
				return res.status(404).json(errors);
			}
			bcrypt.compare(password, user.password)
				.then(isMatch => {
					if(isMatch) {
						const payload = {
							id: user.id,
							firstname: user.firstname,
							lastname: user.lastname,
							username: user.username,
							email: user.email,
							avatar: user.avatar
						}
						jwt.sign(payload, 'secret', {
							expiresIn: 3600
						}, (err, token) => {
							if(err) console.error('There is some error in token', err);
							else {
								res.json({
									success: true,
									token: `Bearer ${token}`
								});
							}
						});
					} else {
						errors.password = 'Incorrect Password';
						return res.status(400).json(errors);
					}
				});
		});
});

router.post('/update', (req, res) => {
	const { errors, isValid } = validateUpdateInput(req.body);

	if(!isValid) {
		return res.status(400).json(errors);
	}

	const email = req.body.email;
	User.findOneAndUpdate({email}, { $set: { ...req.body }})
	.then(user => {
		const payload = {
			id: req.body.id,
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			username: req.body.username,
			email: req.body.email,
			avatar: req.body.avatar
		}
		jwt.sign(payload, 'secret', {
			expiresIn: 3600
		}, (err, token) => {
			if(err) console.error('There is some error in token', err);
			else {
				res.json({
					success: true,
					token: `Bearer ${token}`
				});
			}
		});
	})
})

router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
	return res.json({
		id: req.user.id,
		name: req.user.name,
		email: req.user.email
	});
});

module.exports = router;