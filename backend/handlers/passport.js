'use strict';

const passport = require('passport');
const User = require('../models/User');
// var FacebookTokenStrategy = require('passport-facebook-token');
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const config = require('./config');

module.exports = function () {
    // passport.use(new FacebookTokenStrategy({
    //         clientID: config.facebookAuth.clientID,
    //         clientSecret: config.facebookAuth.clientSecret
    //     },
    //     function (accessToken, refreshToken, profile, done) {
    //         User.upsertFbUser(accessToken, refreshToken, profile, function(err, user) {
    //             return done(err, user);
    //         });
    //     }));

    passport.use(new GoogleTokenStrategy({
            clientID: config.googleAuth.clientID,
            clientSecret: config.googleAuth.clientSecret
        },
        function (accessToken, refreshToken, profile, done) {
            User.upsertGoogleUser(accessToken, refreshToken, profile, function(err, user) {
                return done(err, user);
            });
        }));
};