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
        return fs.statSync(path.join("contest", file)).isDirectory();
    }).length;
    module.exports.numQues = numQues;
};

for(var i in config) {
    id2name[i] = config[i].name;
    name2id[config[i].name] = i;
    images[i] = "pallavagarwal07/" + config[i].image;
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

var submit = function(req, res) {
    var md5hash = md5(req.body.code);
    var filename = req.user + "." + b64(req.body.qno) + "." + b64(req.body.lang) + "." + md5hash;
    filename = filename.replace(/=/g, '');

    fs.writeFile("files/"+filename, req.body.code, function(err) {
        if(err) {
            console.log(err);
            return res.send("System error occured");
        }

        child = exec("ip route get 8.8.8.8 | awk '{print $NF; exit}'", function(err, ip, stderr){
            if(stderr !== "" || err !== null)
                return res.send("System error occured in looking up the hostname");
            url_conf = "http://" + ip.trim() + ":9090/" + configs[req.body.lang];
            url_code = "http://" + ip.trim() + ":9090/" + filename;
            url_inp = "http://" + ip.trim() + ":9090/inputs/" + configs[req.body.qno];
            url_out = "http://" + ip.trim() + ":9090/outputs/" + configs[req.body.qno];

            uniqueId = Math.floor(new Date()) + "-" + req.user;
            cmd = "kubectl run --requests='cpu=1,memory=1224Mi' --restart=Never --image=" + images[req.body.lang] +
                " " + uniqueId + " -- " + url_conf + " " + url_code + " " +
                url_inp + " " + url_out;
            child2 = exec(cmd, function(err, stdout, stderr) {
                if(stderr !== "" || err !== null)
                    return res.send("System error occured in running kubectl");
                scheduled.push(uniqueId);
                return res.send(cmd);
            });
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
