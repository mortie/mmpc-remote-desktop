var exec = require("child_process").spawn;
var colors = require("colors");

exports.record = record;

var ignoredErrors = [
	/past duration .+ too large/i,
	/frame= .+/i
];

function record(width, height, secret, streamPort) {
	var child = exec("ffmpeg", [
		"-s", width+"x"+height,
		"-f", "x11grab",
		"-i", ":0.0",
		"-f", "mpeg1video",
		"-r", "30",
		"http://localhost:"+streamPort+"/"+secret+"/"+width+"/"+height
	]);

	child.stdin.on("data", function(data) {
		console.log("ffmpeg(stdout): ".info+data.toString().trim().info);
	});
	child.stderr.on("data", function(data) {
		var str = data.toString();
		var ignore = false;
		for (var i in ignoredErrors) {
			if (ignoredErrors[i].test(str))
				return;
		}
		console.log("ffmpeg(stderr): ".error+str.trim().info);
	});
	child.on("exit", function(code) {
		if (code !== 0) {
			console.log("Ffmpeg exited! Restarting.".error);
			record(width, height, secret, streamPort);
		}
	});
}
