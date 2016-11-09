let mongo  = require('mongodb');
let fs  = require('fs');
let client = mongo.MongoClient;
let url    = "mongodb://localhost:27017/session";
let dbget  = null;

client.connect(url, function(err, db) {
    conn = db.collection("YourHonour");
    dbget = function(name, call) {
        conn.findOne({}, function(err, data) {
            call(data[name]);
        });
    };
});

module.exports = function(app, passport) {
    app.get(/api\/$/, function(req, res) {
            res.send('{"author": "pallav"}');
            });

    app.get(/api\/dashboard/, isLoggedIn, function(req, res) {
        dbget('name2id', function(data) {
            dbget('numques', function(data2) {
                let load = {
                    title: 'Dashboard',
                    langs: data,
                    ques:  data2,
                };
                res.send(JSON.stringify(load));
            });
        });
    });

    app.get(/api\/questions/, isLoggedIn, function(req, res) {
        dbget('numques', function(num) {
            set = {'total': num, 'points': [], 'names': []};
            let counter = 1;
            let run = function() {
                if(counter <= num){
                    fs.readFile("contest/"+counter+"/config.json", function(err, data) {
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
