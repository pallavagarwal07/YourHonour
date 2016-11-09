let fs     = require('fs');
var path   = require('path');
let mongo  = require('mongodb');
var config    = JSON.parse(fs.readFileSync("contest/config.json"));
let name2id   = {};
let id2name   = {};
let images    = {};


let client = mongo.MongoClient;
let url    = "mongodb://localhost:27017/session";
let conn   = null;
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
        conn.update({}, {"$set": {"numques": count}}, {"upsert": true}, function(err, out) {
            if(err)
                console.log("some error updating numques to " + count + "!!\n");
            else {
                if(JSON.parse(out).ok == 1)
                    console.log("successfully updated");
                else
                    console.log("couldn't update");
            }
        });
    });
};

let set_globals = function() {
    fs.readFile("contest/config.json", function(err, data) {
        if(err)
            console.error("Error");

        let config = JSON.parse(data);

        for(var i in config) {
            id2name[i] = config[i].name;
            name2id[config[i].name] = i;
            images[i] = "pallavagarwal07/" + config[i].image + ":latest";
        }
        conn.update({}, {"$set": {"id2name": id2name}}, {"upsert": true}, function(err, out) {
            if(err)
                console.log("Error uploading id2name");
            else {
                if(JSON.parse(out).ok == 1)
                    console.log("successfully updated id2name");
                else
                    console.log("couldn't update id2name");
            }
        });
        conn.update({}, {"$set": {"name2id": name2id}}, {"upsert": true}, function(err, out) {
            if(err)
                console.log("Error uploading name2id", err);
            else {
                if(JSON.parse(out).ok == 1)
                    console.log("successfully updated name2id");
                else
                    console.log("couldn't update name2id");
            }
        });
        conn.update({}, {"$set": {"images": images}}, {"upsert": true}, function(err, out) {
            if(err)
                console.log("Error uploading images");
            else {
                if(JSON.parse(out).ok == 1)
                    console.log("successfully updated images");
                else
                    console.log("couldn't update images");
            }
        });
    });
};

client.connect(url, function(err, db) {
    conn = db.collection("YourHonour");
    update_list();
    set_globals();
    setInterval(update_list, 3000);
});
