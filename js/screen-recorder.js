var exec = require("child_process").spawn;

exports.record = record;

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
		console.log(data.toString().trim());
	});
	child.stderr.on("data", function(data) {
		if (data.toString().indexOf("frame=") !== 0)
			console.log(data.toString().trim());
	});
}
