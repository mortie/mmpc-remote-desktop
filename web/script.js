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

var scaleValue = 0.7;

function modX(x) {
	return Math.floor(x / scaleValue);
}
function modY(y) {
	return Math.floor(y / scaleValue);
}

canvas.width = (conf.width * scaleValue)+"px";
canvas.style.height = (conf.height * scaleValue)+"px";

var mouseX;
var mouseY;
var prevMouseX;
var prevMouseY;

setInterval(function() {
	if (mouseX === prevMouseX || mouseY === prevMouseY)
		return;

	prevMouseX = mouseX;
	prevMouseY = mouseY;

	xdo("mousemove", [modX(mouseX), modY(mouseY)]);
}, 100);

//Controlling Things
canvas.addEventListener("mousedown", function(evt) {
	evt.preventDefault();
	xdo("mousedown", [evt.button + 1]);
});
canvas.addEventListener("mouseup", function(evt) {
	evt.preventDefault();
	xdo("mouseup", [evt.button + 1]);
});
canvas.addEventListener("mousemove", function(evt) {
	mouseX = evt.offsetX;
	mouseY = evt.offsetY;
});

window.addEventListener("keydown", function(evt) {
	evt.preventDefault();
	var id = getKey(evt);
	console.log(id);
	if (id)
		xdo("keydown", [id]);
});
window.addEventListener("keyup", function(evt) {
	evt.preventDefault();
	var id = getKey(evt);
	if (id)
		xdo("keyup", [id]);
});

canvas.addEventListener("wheel", function(evt) {
	evt.preventDefault();
	var button;
	if (evt.deltaY < 0)
		button = 4;
	else if (evt.deltaY > 0)
		button = 5;
	else if (evt.deltaX < 0)
		button = 6;
	else if (evt.deltaX > 0)
		button = 7;

	xdo("click", [button, modX(evt.offsetX), modY(evt.offsetY)]);
});

canvas.addEventListener("contextmenu", function(evt) {
	evt.preventDefault();
});

var specialKeys = {
	"shift": "Shift_L",
	"ctrl": "Control",
	"control": "Control",
	"enter": "Return",
	"alt": "Alt",
	"capslock": "Caps_Lock",
	"esc": "Escape",
	"escape": "Escape",
	"win": "Super_L",
	"os": "Super_L",
	"meta": "Super_L",
	"u+0008": "BackSpace",
	"backspace": "BackSpace",
	"u+0020": "space",
	"Spacebar": "space",
	" ": "space",
	"left": "Left",
	"arrowleft": "Left",
	"right": "Right",
	"arrowright": "Right",
	"down": "Down",
	"arrowdown": "Down",
	"up": "Up",
	"arrowup": "Up"
};
function getKey(evt) {
	var id = evt.key || evt.keyIdentifier;
	console.log(id);
	if (specialKeys[id.toLowerCase()])
		id = specialKeys[id.toLowerCase()];
	else if (id.indexOf("U+") === 0 && !/[a-zA-Z0-9]/.test(String.fromCharCode(evt.keyCode)))
		id = id.replace("+", "");
	else
		id = String.fromCharCode(evt.keyCode).toLowerCase();
	return id;
}
