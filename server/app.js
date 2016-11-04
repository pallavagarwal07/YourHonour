let express  = require('express');
let pug      = require('pug');
let fs       = require('fs');
let app      = express();
let dir      = './views/';
let template = fs.readFileSync('./views/template.html', 'utf8').split("_DEADBEEF_");

files = fs.readdirSync(dir);
for(let i=0; i<files.length; i++) {
    if(files[i].match(/\.pug$/)) {
        let fn = pug.compileFileClient(dir + files[i], {compileDebug: false});
        let jsname = files[i].replace(/\.pug$/, '.js');
        fs.writeFileSync(dir + "_cache_/" + jsname, fn);
    }
}

app.get('/', function(req, res) {
    template[1] = 'index.js';
    res.send(template.join(""));
});

app.get('/api/', function(req, res) {
    res.send('{"author": "Pallav"}');
});

app.use(express.static('./views/'));

app.listen(3000, function() {
    console.log("Listening on port 3000");
});
