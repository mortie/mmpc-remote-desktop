var express = require("express");
var fs = require("fs");
var crypto = require("crypto");

var streamServer = require("./lib/stream-server");
var screenRecorder = require("./js/screen-recorder");
var xdo = require("./js/xdotool");

var conf = JSON.parse(fs.readFileSync("conf.json"));
var tmp;

var secret = crypto.randomBytes(16).toString("hex");

//Static web content
tmp = conf.secret;
conf.secret = "";
fs.writeFileSync("web/conf.js", "window.conf = "+JSON.stringify(conf)+";");
conf.secret = tmp;
var app = express();
app.use(express.static("web"));
app.listen(conf.port);
console.log("Listening to port "+conf.port+".");

//Streaming server
streamServer.stream(secret, conf.stream_port, conf.ws_port);

//Screen Recorder
screenRecorder.record(conf.width, conf.height, secret, conf.stream_port);

//Keyboard/mouse
app.get("/in/mousedown/:button", function(req, res) {
	xdo.mousedown(req.params.button);
	res.end();
});
app.get("/in/mouseup/:button", function(req, res) {
	xdo.mouseup(req.params.button);
	res.end();
});
app.get("/in/mousemove/:x/:y", function(req, res) {
	xdo.mousemove(req.params.x, req.params.y);
	res.end();
});
app.get("/in/keydown/:key", function(req, res) {
	xdo.keydown(req.params.key);
	res.end();
});
app.get("/in/keyup/:key", function(req, res) {
	xdo.keyup(req.params.key);
	res.end();
});
app.get("/in/click/:button/:x/:y", function(req, res) {
	xdo.mousemove(req.params.x, req.params.y);
	xdo.click(req.params.button);
	res.end();
});
