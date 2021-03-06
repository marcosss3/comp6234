// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var Converter      = require("csvtojson").Converter;
var converter      = new Converter({});

// configuration ===========================================

var port = process.env.PORT || 8080; 

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); 

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override')); 

// set the static files location
app.use(express.static(__dirname + '/public')); 
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/resources', express.static(__dirname + '/resources'));

// start app
app.listen(port);
console.log('Server initialised on port ' + port + "...")

var shareprices;

converter.fromFile("./resources/easyjet.csv", function (err, result) {
    shareprices = result;
});

app.get('/api/data/sharePrices', function (req, res) {
    res.json(shareprices);
});

// expose app           
exports = module.exports = app;