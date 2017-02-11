let mongo    = require('mongodb');
let assert   = require('assert');
let client   = mongo.MongoClient;
let url      = "mongodb://localhost:27017/session";
let g_submit = null;
let g_api    = null;
let glob     = {};

glob.getStatus = function(req, res) {
    let id = req.query.id;
    g_submit.conn.findOne({id: id}, function(err, data) {
        assert(!err);
        console.log(data);
        res.send(JSON.stringify(data));
    });
};

module.exports = function(retsubmit, retapi) {
    g_submit = retsubmit;
    g_api    = retapi;
    return glob;
};
