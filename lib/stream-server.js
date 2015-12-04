/*
 * This file is a modified version of stream-server.js from jsmpeg:
 * https://github.com/phoboslab/jsmpeg
 */

var colors = require("colors");

exports.stream = stream;

function stream(STREAM_SECRET, STREAM_PORT, WEBSOCKET_PORT) {
	var self = {};

	var width = 320,
		height = 240;

	var STREAM_MAGIC_BYTES = "jsmp";

	// Websocket Server
	var socketServer = new (require('ws').Server)({port: WEBSOCKET_PORT});
	socketServer.on('connection', function(socket) {
		// Send magic bytes and video size to the newly connected socket
		// struct { char magic[4]; unsigned short width, height;}
		var streamHeader = new Buffer(8);
		streamHeader.write(STREAM_MAGIC_BYTES);
		streamHeader.writeUInt16BE(width, 4);
		streamHeader.writeUInt16BE(height, 6);
		socket.send(streamHeader, {binary:true});

		console.log(("New WebSocket Connection ("+socketServer.clients.length+" total)").ok);
		if (self.onupdate)
			self.onupdate(socketServer.clients.length);

		socket.on('close', function(code, message){
			console.log(("Disconnected WebSocket ("+socketServer.clients.length+" total)").info);
			if (self.onupdate)
				self.onupdate(socketServer.clients.length);
		});
	});

	socketServer.broadcast = function(data, opts) {
		for( var i in this.clients ) {
			if (this.clients[i].readyState == 1) {
				this.clients[i].send(data, opts);
			}
		}
	};


	// HTTP Server to accept incomming MPEG Stream
	var streamServer = require('http').createServer( function(request, response) {
		var params = request.url.substr(1).split('/');

		if( params[0] == STREAM_SECRET ) {
			width = (params[1] || 320)|0;
			height = (params[2] || 240)|0;
			
			console.log((
				"Stream Connected: " + request.socket.remoteAddress + 
				":" + request.socket.remotePort + " size: " + width + 'x' + height
			).info);
			request.on('data', function(data){
				socketServer.broadcast(data, {binary:true});
			});
		}
		else {
			console.log((
				"Failed Stream Connection: "+ request.socket.remoteAddress + 
				request.socket.remotePort + " - wrong secret."
			).red);
			response.end();
		}
	}).listen(STREAM_PORT);

	console.log(("Listening for MPEG Stream on http://127.0.0.1:"+STREAM_PORT+"/<secret>/<width>/<height>").ok);
	console.log(("Awaiting WebSocket connections on ws://127.0.0.1:"+WEBSOCKET_PORT+"/").ok);

	return self;
}
