const express = require("express");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require('morgan')
const bodyParser = require('body-parser')
const app = express();

require("dotenv").config();

app.use(bodyParser.json({ limit: '50Mb' }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(helmet());
app.use(compression());
app.use(morgan('dev'))
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// http://stackoverflow.com/questions/23860275/javascript-angular-not-loading-when-using-express
app.use(express.static(__dirname + "/app"));
//add this so the browser can GET the bower files
app.use("/lib", express.static(__dirname + "/lib"));
app.use("/node_modules", express.static(__dirname + "/node_modules"));

app.get("/", function(req, res) {
  res.sendFile("./app/index.html");
});

app.get("/app/lang/:lang.json", function(req, res) {
  res.sendFile("./app/lang/" + req.params.lang + ".json");
});

app.get("/app/config.json", function(req, res) {
  res.json({
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    version: process.env.version
  });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
