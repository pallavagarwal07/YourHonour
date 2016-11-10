let fs       = require('fs');
var path     = require('path');
let mongo    = require('mongodb');
let assert   = require('assert');
var exec     = require('child_process').exec;
let glob     = {}
let client   = mongo.MongoClient;
let url      = "mongodb://localhost:27017/session";
let conn     = null;
glob.name2id = {};
glob.id2name = {};
glob.images  = {};
glob.numques = null;
glob.ip      = null;

let upsert = function(v) {
    // warning: you may be tempted to do {"$set": {v: glob[v]}}
    // But that does not work. {"$set": {[v]: glob[v]}} may work though
    // but only on newer versions of node. So just let this be
    let tmp = {};
    tmp[v] = glob[v];
    conn.update({}, {"$set": tmp}, {"upsert":true}, function(err,out) {
        assert(JSON.parse(out).ok, v, glob[v]);
    });
}

let update_list = function() {
    fs.readdir("contest", function(err, files) {
        count = 0;
        for(let i=0; i<files.length; i++) {
            file = files[i];
            name = path.join("contest", file);
            if (fs.statSync(name).isDirectory() && file.match(/^\d+$/)) {
                count++;
            }
        }
        glob.numques = count;
        upsert('numques');
    });
};

let set_globals = function() {
    fs.readFile("contest/config.json", function(err, data) {
        assert(!err);
        glob.config = JSON.parse(data);

        for(var i in glob.config) {
            glob.id2name[i] = glob.config[i].name;
            glob.name2id[glob.config[i].name] = i;
            glob.images[i] = "pallavagarwal07/"+glob.config[i].image+":latest";
        }

        let cmd = "ip route get 8.8.8.8 | awk '{print $NF; exit}'";
        child = exec(cmd, function(err, _ip, stderr) {
            assert(stderr === "");
            assert(err === null);
            glob.ip = _ip;
            upsert('ip');
        });

        upsert('config');
        upsert('id2name');
        upsert('name2id');
        upsert('images');
    });
};

client.connect(url, function(err, db) {
    conn = db.collection("YourHonour");
    set_globals();
    update_list();
    setInterval(update_list, 3000);
});
