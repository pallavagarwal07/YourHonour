const exec       = require('child_process').execSync;
let submitModule = require('./codeSubmit.js');
let marked       = require('marked');
let fs           = require('fs');
let IPs          = {};
let state        = {};

module.exports = function(app, passport) {

    app.get(/.*/, function(req, res, next) {
        var cal = function(val) { return function() {IPs[val]--;}; };
        var unb = function(val) { return function() {delete state[ip]; exec('sudo iptables -D INPUT -s '+ip+' -p tcp --dport 9000 -j DROP');};};
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (ip.substr(0, 7) == "::ffff:") {
              ip = ip.substr(7)

        }
        if(!IPs[ip]) {
            IPs[ip] = 1;
            setTimeout(cal(ip), 1000);
            next();
        } else {
            IPs[ip]++;
            setTimeout(cal(ip), 1000);
            if(IPs[ip] > 100 && !state[ip]) {
                state[ip] = 1;
                exec('sudo iptables -I INPUT -s '+ip+' -p tcp --dport 9000 -j DROP');
                setTimeout(unb(ip), 30000);
                res.end();
            } else {
                next();
            }
        }
    });

    app.get("/allsubmissions", isLoggedIn, function(req, res) {
        res.send(JSON.stringify(submitModule.scheduled));
    });

    app.get("/getstatus", isLoggedIn, submitModule.getStatus);

    app.get("/", isNotLoggedIn, function(req, res) {
        res.render('index', {title: 'Login', error: req.flash('error')[0]});
    });

    app.get("/questions", isLoggedIn, function(req, res) {
        submitModule.forceUpdate();
        set = {'total': submitModule.numQues, 'points': [], 'names': []};
        for(var i=1; i<=submitModule.numQues; i++) {
            par = JSON.parse(fs.readFileSync("contest/"+i+"/config.json"));
            set.points[i] = par.points;
            set.names[i] = par.name || "";
        }
        res.render('questions', set);
    });

    app.get('/dashboard', isLoggedIn, function(req, res){
        submitModule.forceUpdate();
        console.log("Force updated to ", submitModule.numQues);
        res.render('dashboard', {
            title: 'Dashboard',
            langs: submitModule.name2id,
            ques:  submitModule.numQues,
            error: req.flash('error')[0]
        });
    });

    app.get(/^\/(\d+)$/, isLoggedIn, function(req, res, next) {
        var ques = parseInt(req.params[0]);
        submitModule.forceUpdate();
        if (ques > submitModule.numQues) {
            next();
            return;
        }
        fs.readFile("contest/" + ques + "/index.md", function(err, data) {
            content = marked(data + "");
            res.render('question', {content: content, ques: ques});
        });
    });

    app.get('/submissions', isLoggedIn, function(req, res){
        res.render('submissions', {title: 'Submissions', error: req.flash('error')[0]});
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.post('/submit', isLoggedIn, submitModule.submit);

    app.post('/login', passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/',
        failureFlash: 'Invalid username or password.'
    }));
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    req.flash('error', 'You are not logged in');
    res.redirect('/');
}

function isNotLoggedIn(req, res, next) {
    if (!req.isAuthenticated())
        return next();
    res.redirect('/dashboard');
}
