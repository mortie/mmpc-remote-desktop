var express = require("express");
var fs = require("fs");
var crypto = require("crypto");
var colors = require("colors");

var streamServer = require("./lib/stream-server");
var ScreenRecorder = require("./js/screen-recorder");
var xdo = require("./js/xdotool");

colors.setTheme({
	info: "grey",
	error: "red",
	ok: "green"
});

var conf = JSON.parse(fs.readFileSync("conf.json"));
var tmp;

var secret = crypto.randomBytes(16).toString("hex");

//Static web content
fs.writeFileSync("web/conf.js", "window.conf = "+JSON.stringify(conf)+";");
var app = express();
app.use(express.static("web"));
app.listen(conf.port);
console.log(("Listening to port "+conf.port+".").ok);

//Streaming server
var stream = streamServer.stream(secret, conf.stream_port, conf.ws_port);

//Screen Recorder
var recorder = new ScreenRecorder(conf.width, conf.height, secret, conf.stream_port);

stream.onupdate = function(numConnections) {
	if (numConnections === 0) { 
		console.log("Stopping screen recording.".info);
		recorder.stop();
	} else if (!recorder.isRecording) {
		console.log("Starting screen recording.".info);
		recorder.record();
	}
};

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
