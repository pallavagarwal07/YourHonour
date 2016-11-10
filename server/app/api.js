let mongo  = require('mongodb');
let fs     = require('fs');
let marked = require('marked');
let assert   = require('assert');
let client = mongo.MongoClient;
let url    = "mongodb://localhost:27017/session";
let glob   = {}
glob.dbget = null;

client.connect(url, function(err, db) {
    conn = db.collection("YourHonour");
    glob.dbget = function(name, call) {
        conn.findOne({}, function(err, data) {
            call(data[name]);
        });
    };
});

module.exports = function(app, passport) {
    app.get('/api/', function(req, res) {
        res.send('{}');
    });

    app.get('/api/dashboard', isLoggedIn, function(req, res) {
        glob.dbget('numques', function(data2) {
            glob.dbget('name2id', function(data) {
                let load = {
                    title: 'Dashboard',
                    langs: data,
                    ques:  data2,
                };
                res.send(JSON.stringify(load));
            });
        });
    });

    app.get('/api/questions', isLoggedIn, function(req, res) {
        glob.dbget('numques', function(num) {
            set = {'total': num, 'points': [], 'names': []};
            let counter = 1;
            let run = function() {
                if(counter <= num){
                    let fname = "contest/"+counter+"/config.json";
                    fs.readFile(fname, function(err, data) {
                        let par = JSON.parse(data);
                        console.log(par);
                        set.points[counter] = par.points;
                        set.names[counter] = par.name || "";
                        counter++;
                        run();
                    });
                } else {
                    res.send(JSON.stringify(set));
                }
            };
            run();
        });
    });

    app.get(/^\/api\/(\d+)$/, isLoggedIn, function(req, res, next) {
        var ques = parseInt(req.params[0]);
        glob.dbget('numques', function(data) {
            if(ques > data) {
                next();
                return;
            }
            let fname = "contest/" + ques + "/index.md";
            fs.readFile(fname, function(err, data) {
                content = marked(data + "");
                res.send(JSON.stringify({
                    "content": content,
                    "ques": ques
                }));
            });
        });
    });

    app.get('/api/submissions', isLoggedIn, function(req, res){
        res.send(JSON.stringify({title: 'Submissions'}));
    });

    return glob;
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
