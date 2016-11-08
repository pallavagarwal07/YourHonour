let fs     = require('fs');
var path   = require('path');
let mongo  = require('mongodb');
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
                console.log("Some error updating numques to " + count + "!!\n");
            else {
                if(JSON.parse(out).ok == 1)
                    console.log("Successfully updated");
                else
                    console.log("Couldn't update");
            }
        });
    });
};

client.connect(url, function(err, db) {
    conn = db.collection("YourHonour");
    update_list();
    setInterval(update_list, 3000);
});
