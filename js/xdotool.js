var exec = require("child_process").spawn;

exports.xdo = xdo;
exports.mousedown = mousedown;
exports.mouseup = mouseup;
exports.mousemove = mousemove;
exports.click = click;
exports.keydown = keydown;
exports.keyup = keyup;

function xdo(cmd, args) {
	args.unshift(0);
	args[0] = cmd;
	exec("xdotool", args);
	console.log("xdotool", args.join(" "));
}

function mousedown(button) {
	xdo("mousedown", [button]);
}

function mouseup(button) {
	xdo("mouseup", [button]);
}

function mousemove(x, y) {
	xdo("mousemove", [x, y]);
}

function click(button) {
	xdo("click", [button]);
}

function keydown(key) {
	xdo("keydown", [key]);
}

function keyup(key) {
	xdo("keyup", [key]);
}
