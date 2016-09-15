var md5 = require('md5');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var config = JSON.parse(fs.readFileSync("contest/config.json"));
var b64 = function(str) { return ( new Buffer(str).toString('base64') ); };
var scheduled = [];
var executed = {};
var name2id = {};
var id2name = {};
var images = {};

var numQues = fs.readdirSync("contest").filter(function(file) {
    return fs.statSync(path.join("contest", file)).isDirectory();
}).length;

var forceUpdate = function() {
    numQues = fs.readdirSync("contest").filter(function(file) {
        return fs.statSync(path.join("contest", file)).isDirectory() && file.match(/^\d+$/);
    }).length;
    module.exports.numQues = numQues;
};

var combine = function(obj1, obj2) {
    ret = {};
    for(var i in obj1) {
        ret[i] = obj1[i];
    }
    for(var i in obj2) {
        ret[i] = obj2[i];
    }
    return ret;
};

for(var i in config) {
    id2name[i] = config[i].name;
    name2id[config[i].name] = i;
    images[i] = "pallavagarwal07/" + config[i].image + ":latest";
}

var getStatus = function(req, res) {
    var id = req.query.id;
    if(executed[id] == undefined) {
        var child = exec("kubectl get -o json pods "+id+" 2>&1", function(err, out, stderr) {
            if(stderr !== "" || err !== null)
                return res.send("System error occured in looking up the hostname");
            var idState = JSON.parse(out);
            var acState = null;
            if(idState["status"].containerStatuses != undefined) {
                for (var i in idState.status.containerStatuses[0].state) {
                    acState = i;
                    break;
                }
            } else {
                acState = "Queued";
            }
            if(acState == "terminated") {
                var child2 = exec("kubectl logs "+id+" 2>&1", function(err, out, stderr) {
                    if(stderr !== "" || err !== null)
                        return res.send("System error occured in looking up the hostname");
                    executed[id] = {
                        'state': "terminated",
                        'retCd': parseInt(out.split("\n")[0].trim()),
                        'messg': out.split("\n").slice(1).join("\n").trim(),
                    };
                    return res.send(JSON.stringify(executed[id]));
                });
                return;
            }
            var retObj = {'state': acState};
            return res.send(JSON.stringify(retObj));
        });
    } else {
        return res.send(JSON.stringify(executed[id]));
    }
};

var getTmpURL = function(strn) {
    if(typeof strn !== "string")
        strn = JSON.stringify(strn);
    var hash = md5(strn);

    try {
        fs.statSync("contest/tmp/"+hash, fs.F_OK);
    } catch (e) {
        fs.writeFileSync("contest/tmp/"+hash, strn);
    }
    return "tmp/"+hash;
}

var submit = function(req, res) {
    child = exec("ip route get 8.8.8.8 | awk '{print $NF; exit}'", function(err, ip, stderr) {
        if(stderr !== "" || err !== null)
            return res.send("System error occured in looking up the hostname");
        if(!req.body.qno.match(/\d+/))
            return res.send("System error occured in checking question number");

        qno = parseInt(req.body.qno.match(/\d+/)[0]);
        base_url = "http://" + ip.trim() + ":9090/";
        config1  = config[name2id[req.body.lang]];
        config2  = JSON.parse(fs.readFileSync("contest/"+qno+"/config.json"));
        configN  = combine(config1, config2);

        url_conf = base_url + getTmpURL(configN);
        url_code = base_url + getTmpURL(req.body.code);
        url_inp  = base_url + qno + "/inputs/1"
        url_out  = base_url + qno + "/outputs/1"

        uniqueId = Math.floor(new Date()) + "-" + req.user;

        cmd = "kubectl run --requests='cpu=1,memory=1224Mi' --restart=Never " +
               "--image=" + images[name2id[req.body.lang]] + " " + uniqueId +
               " -- " + url_conf + " " + url_code + " " + url_inp + " " + url_out;

        child2 = exec(cmd, function(err, stdout, stderr) {
            if(stderr !== "" || err !== null)
                return res.send("System error occured in running kubectl");
            scheduled.push(uniqueId);
            req.flash('msg', 'Submitted Successfully');
            return res.redirect('/submissions');
        });
    });
};

module.exports = {
    'submit': submit,
    'scheduled': scheduled,
    'getStatus': getStatus,
    'executed': executed,
    'name2id': name2id,
    'numQues': numQues,
    'forceUpdate': forceUpdate
};
