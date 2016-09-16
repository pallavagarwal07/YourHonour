var express  = require('express');
var app      = express();
var port     = process.env.PORT || 9000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var fileServer = express();

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');
var passStrategy = require('./config/passport.js');
var MongoStore = require('connect-mongo')(session);

mongoose.connect(configDB.url + "/session");

// require('./config/passport')(passport); // pass passport for configuration
app.set('views', './views')
app.set('view engine', 'pug');
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

app.use(session({ 
    secret: 'acamadethiscrap',
    maxAge: new Date(Date.now() + 3600000),
    store: new MongoStore({
        mongooseConnection:mongoose.connection
    }, function(err) {
        console.log(err || 'connect-mongodb setup ok');
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
require('./app/routes.js')(app, passport);
app.use(express.static('views'));
app.get(/(.*)/, function(req, res) {
    res.status(404);
    res.render("404", {url: req.params[0]});
});

fileServer.use(express.static('contest'));

fileServer.listen(9090);
app.listen(port);
console.log('The interface happens on port ' + port);
console.log('The file serving happens on port ' + port);
