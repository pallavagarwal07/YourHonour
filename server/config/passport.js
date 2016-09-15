var passport = require('passport');
var request = require('request');
var BasicStrategy = require('passport-local').Strategy;

passport.use(new BasicStrategy(
    function(username, password, done) {
        password = require('querystring').escape(password);
        username = require('querystring').escape(username);
        var settings = {'proxy':'http://'+username+':'+password+'@nknproxy.iitk.ac.in:3128'};
        var r = request.defaults(settings);
        r.get("http://google.com").on('response', function(response) {
                if(response.statusCode == 200)
                    return done(null, username);
                else
                    return done(null, false);
        });
    }
));
passport.serializeUser(function(user, done) {
      done(null, user);
});

passport.deserializeUser(function(user, done) {
      done(null, user);
});
