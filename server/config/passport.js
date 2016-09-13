var passport = require('passport');
var request = require('request');
var BasicStrategy = require('passport-local').Strategy;

passport.use(new BasicStrategy(
    function(username, password, done) {
        var settings = {'proxy':'http://'+username+':'+password+'@nknproxy.iitk.ac.in:3128'};
        console.log(settings);
        var r = request.defaults(settings);
        r.get("http://google.com").on('response', function(response) {
                console.log(response.statusCode);
                console.log(response.headers['content-type']);

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
