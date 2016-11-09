let exec = require('child_process').exec;
let mark = require('marked');
let IPs  = {};

module.exports = function(app, passport, template) {
    // First do what is common for all requests:
    // DoS attack protection
    app.get(/.*/, function(req, res, next) {

        let decrement = function(val) {
            return (function(){IPs[val]--;});
        };

        let unblockit = function(val) {
            return function() {
                delete state[ip];
                exec('sudo iptables -D INPUT -s '+ip+' -p tcp --dport 9000 -j DROP');
            };
        };

        let ip  = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (ip.substr(0, 7) == "::ffff:") {
              ip = ip.substr(7);
        }

        if(!IPs[ip]) {
            IPs[ip] = 1;
            setTimeout(decrement(ip), 1000);
            next();
        } else {
            IPs[ip]++;
            setTimeout(decrement(ip), 1000);
            if(IPs[ip] > 100 && !state[ip]) {
                state[ip] = 1;
                exec('sudo iptables -I INPUT -s '+ip+' -p tcp --dport 9000 -j DROP');
                setTimeout(unblockit(ip), 30000);
                res.end();
            } else {
                next();
            }
        }
    });

    app.get("/", isNotLoggedIn, function(req, res) {
        template[1] = "index.js";
        res.send(template.join(""));
    });

    app.get('/dashboard', isLoggedIn, function(req, res) {
        template[1] = "dashboard.js";
        res.send(template.join(""));
    });

    app.get('/questions', isLoggedIn, function(req, res) {
        template[1] = "questions.js";
        res.send(template.join(""));
    });

    app.post('/login', passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/',
    }));

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

function isNotLoggedIn(req, res, next) {
    if (!req.isAuthenticated())
        return next();
    res.redirect('/dashboard');
}
