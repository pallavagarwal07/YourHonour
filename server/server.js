let express      = require('express');
let pug          = require('pug');
let fs           = require('fs');
let morgan       = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser   = require('body-parser');
let passport     = require('passport');
let session      = require('express-session');
var mongoose     = require('mongoose');
let cluster      = require('cluster');
let template     = fs.readFileSync('./views/template.html', 'utf8').split("_DEADBEEF_");
let app          = express();
let fServer      = express();
let dir          = './views/';
let passStrategy = require('./app/passport.js');
let MongoStore   = require('connect-mongo')(session);
var userSchema   = mongoose.Schema({name: String});

// Compile all pug files before starting the server. Only the compiled
// javascript will be server. The page will be rendered on the client side!
files = fs.readdirSync(dir);
for(let i=0; i<files.length; i++) {
    if(files[i].match(/\.pug$/)) {
        let fn = pug.compileFileClient(dir + files[i], {compileDebug: false});
        let jsname = files[i].replace(/\.pug$/, '.js');
        fs.writeFileSync(dir + "_cache_/" + jsname, fn);
    }
}

mongoose.connect("mongodb://localhost:27017/session");

// Let's prepare the app. Actual requests will be handled
// separately in different file.
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({ 
    secret: 'acamadethiscrap',
    maxAge: new Date(Date.now() + 3600000),
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
        mongooseConnection:mongoose.connection
    }, function(err) {
        console.log(err || 'connect-mongodb setup ok');
    })
}));
app.use(passport.initialize());
app.use(passport.session());

//if (cluster.isMaster) {
    //// Count the machine's CPUs
    //var cpuCount = require('os').cpus().length;
    //for (var i = 0; i < cpuCount; i += 1) {
        //cluster.fork();
    //}
    require('./app/mode.js');
    console.log(cluster.isMaster);
//} else {
    // Define all routes
    let routes = require('./app/routes.js');
    routes(app, passport, template);

    app.use(express.static('./views/'));
    fServer.use(express.static('./contest/'));

    app.listen(9000, function(){
        console.log("App listening: 9000");
    });
    fServer.listen(9090, function(){
        console.log("FileServer listening: 9090");
    });
//}
