module.exports = function(app, passport) {
    app.get(/api\//, function(req, res) {
            res.send('{"author": "pallav"}');
    });
};
