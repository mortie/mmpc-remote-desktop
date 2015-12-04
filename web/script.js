function xdo(cmd, args) {
	var xhr = new XMLHttpRequest();
	var url = "http://"+conf.host+":"+conf.port+"/in/"+cmd+"/"+(args.join("/"));
	console.log(url);
	xhr.open("GET", url);
	xhr.send();
}

// Setup the WebSocket connection and start the player
var client = new WebSocket("ws://"+conf.host+":"+conf.ws_port);

var canvas = document.getElementById("canvas");
var player = new jsmpeg(client, {canvas:canvas});

function modX(x) {
	return x;
}
function modY(y) {
	return y;
}

var mouseX;
var mouseY;
var prevMouseX;
var prevMouseY;

setInterval(function() {
	console.log(mouseX, prevMouseX);
	if (mouseX === prevMouseX || mouseY === prevMouseY)
		return;

	prevMouseX = mouseX;
	prevMouseY = mouseY;

	xdo("mousemove", [mouseX, mouseY]);
}, 100);

//Controlling Things
canvas.addEventListener("click", function(evt) {
	console.log("no");
	xdo("click", [1, evt.offsetX, evt.offsetY]);
});
window.addEventListener("mousemove", function(evt) {
	console.log("s: "+mouseX, evt.offsetX);
	mouseX = evt.offsetX;
	mouseY = evt.offsetY;
	console.log("e: "+mouseX, evt.offsetX);
});
client.addEventListener("touchmove", function(evt) {
	evt.preventDefault();
	console.log("move");
	mouseX = evt.changedTouches[0].clientX - canvas.offsetLeft;
	mouseY = evt.changedTouches[0].clientY - canvas.offsetTop;
});
