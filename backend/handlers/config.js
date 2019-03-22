module.exports = {
    'facebookAuth' : {
        'clientID'      : 'your-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'     : 'http://localhost:4000/api/auth/facebook/callback',
        'profileURL': 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email'

    },

    'twitterAuth' : {
        'consumerKey'        : 'your-consumer-key-here',
        'consumerSecret'     : 'your-client-secret-here',
        'callbackURL'        : 'http://localhost:4000/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'         : '652617525060-mr8bf452u9knh8v3luvgeplnaicee6i5.apps.googleusercontent.com',
        'clientSecret'     : '-TB65d-AprIxVrGVi_tUt5d0',
        'callbackURL'      : 'http://localhost:4000/auth/google/callback'
    }
};