var express = require("express");
var logfmt = require("logfmt");
var compression = require("compression");
var app = express();

app.use(compression());
app.use(logfmt.requestLogger());

// http://stackoverflow.com/questions/23860275/javascript-angular-not-loading-when-using-express
app.use(express.static(__dirname + '/app'));
//add this so the browser can GET the bower files
app.use('/lib', express.static(__dirname + '/lib'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.get('/', function(req, res) {
  res.sendfile('./app/index.html');
});

app.get('/app/lang/:lang.json', function(req, res) {
  res.sendfile('./app/lang/' + req.params.lang + '.json');
});

app.get('/app/config.json', function(req, res) {    
    res.json({
      clientId: process.env.clientId,
      clientSecret: process.env.clientSecret,
      version: process.env.version
    });    
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
