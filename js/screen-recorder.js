var exec = require("child_process").spawn;
var colors = require("colors");

module.exports = ScreenRecorder;

var ignoredErrors = [
	/past duration .+ too large/i,
	/frame= .+/i
];

function ScreenRecorder(width, height, secret, streamPort) {
	this.width = width;
	this.height = height;
	this.secret = secret;
	this.streamPort = streamPort;
	this.child;
	this.isRecording = false;

	this.record();
	setTimeout(function() {
		this.stop();
	}.bind(this), 2000);
}
ScreenRecorder.prototype.record = function() {
	this.isRecording = true;

	this.child = exec("ffmpeg", [
		"-s", this.width+"x"+this.height,
		"-f", "x11grab",
		"-i", ":0.0",
		"-f", "mpeg1video",
		"-r", "30",
		"http://localhost:"+this.streamPort+"/"+this.secret+"/"+this.width+"/"+this.height
	]);

	this.child.stdin.on("data", function(data) {
		console.log("ffmpeg(stdout): ".info+data.toString().trim().info);
	}.bind(this));

	this.child.stderr.on("data", function(data) {
		var str = data.toString();
		var ignore = false;
		for (var i in ignoredErrors) {
			if (ignoredErrors[i].test(str))
				return;
		}
		console.log("ffmpeg(stderr): ".error+str.trim().info);
	}.bind(this));

	this.child.on("exit", function(code) {
		if (code !== 0 && code !== 255) {
			console.log(("Ffmpeg exited with code "+code+"! Restarting.").error);
			this.record();
		}
	}.bind(this));
}
ScreenRecorder.prototype.stop = function() {
	this.isRecording = false;
	if (this.child)
		this.child.kill();
}
