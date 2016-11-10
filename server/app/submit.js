let mongo    = require('mongodb');
let md5      = require('md5');
let fs       = require('fs');
let assert   = require('assert');
let exec     = require('exec');
let client   = mongo.MongoClient;
let url      = "mongodb://localhost:27017/session";
let glob     = {}
let ret      = null;
glob.add = null;

client.connect(url, function(err, db) {
    glob.conn = db.collection("Submissions");
    glob.add = function(id) {
        glob.conn.insert({"id": id, "state": "Queued", "result": "unknown"});
    }
});

glob.submit = function(req, res) {
    if(!req.body.qno.match(/\d+/))
        return res.send("Request doesn't have QNo.\n");

    let qno      = parseInt(req.body.qno.match(/\d+/)[0]);
    let fconfig  = "contest/" + qno + "/config.json";

    let helper = function(base_url, conf, code, name2id, images) {
        url_conf = base_url + conf;
        url_code = base_url + code;
        inp_fold = 'contest/'+qno+'/inputs';
        out_fold = 'contest/'+qno+'/outputs';
        fs.readdir(inp_fold, function(err, i) {
            fs.readdir(out_fold, function(err, o) {
                ques_url = base_url + qno;
                inp_nums = "" + Math.min(i.length, o.length);
                uniqueId = Math.floor(new Date()) + "-" + req.user;

                spec = { 
                    "containers": [{
                        "name": uniqueId,
                        "image": images[name2id[req.body.lang]],
                        "args": [url_conf, url_code, ques_url, inp_nums],
                        "imagePullPolicy": "IfNotPresent",
                        "resources": {
                            "limits": {
                                "cpu": 1,
                                "memory": "224Mi"
                            },
                            "request": {
                                "cpu": 1,
                                "memory": "224Mi"
                            }
                        },
                        "securityContext": { "privileged": true }
                    }]};
                spec = JSON.stringify({"spec": spec});
                console.log("Here");
                cmd = "kubectl run --requests='cpu=1,memory=224Mi' --restart=Never "+
                    "--image=" + images[name2id[req.body.lang]] +
                    " --overrides='" + spec + "' " + uniqueId + " -- " + url_conf +
                    " " + url_code + " " + ques_url + " " + inp_nums;
                glob.add(uniqueId);
                child2 = exec(cmd, function(err, stdout, stderr) {
                    assert(!stderr);
                    assert(!err);
                    return res.redirect('/submissions');
                });
            });
        });
    };

    fs.readFile(fconfig, function(err, data) {
        assert(!err);
        config2 = JSON.parse(data);
        ret.dbget('name2id', function(name2id) {
            ret.dbget('config', function(config) {
                ret.dbget('images', function(images) {
                    config1 = config[name2id[req.body.lang]];
                    configN = combine(config1, config2);
                    getTmpURL(configN, function(conf) {
                        getTmpURL(req.body.code, function(code) {
                            ret.dbget('ip', function(ip) {
                                let base_url = "http://" + ip.trim() + ":9090/";
                                helper(base_url, conf, code, name2id, images);
                            });
                        });
                    });
                });
            });
        });
    });
};

module.exports = function(api_glob) {
    ret = api_glob;
    return glob;
};

let combine = function(obj1, obj2) {
    let ret = {};
    for(var i in obj1) {
        ret[i] = obj1[i];
    }
    for(var i in obj2) {
        ret[i] = obj2[i];
    }
    return ret;
};

let getTmpURL = function(strn, call) {
    if(typeof strn !== "string")
        strn = JSON.stringify(strn);
    let hash = md5(strn);
    fs.stat("contest/tmp/"+hash, function(err, data) {
        if(err) {
            fs.writeFile("contest/tmp/"+hash, strn, function(err) {
                call("tmp/"+hash);
            });
        } else {
            call("tmp/"+hash);
        }
    });
};
