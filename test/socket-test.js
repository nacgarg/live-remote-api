

/*
 * This tests 2 things: First, it's a unit test for the socket.js file,
 * second an integration test for https://github.com/mihop/m4l-apiserver.
 * It requires Live and the the ApiServer device running on localhost:7475.
 * 
 */

global.WebSocket = require("websocket").w3cwebsocket
global.location = { hostname: "127.0.0.1", port: "7475" }

var socket = require("../target/socket").socket

socket.onError(e => {
	console.error("socket.onError called unexpectedly", e)
	process.exit(1)
})

describe("socket", function() {
	describe("onOpen", () => {
		it("should open if Live/ApiServer is running on localhost:7475", done => socket.onOpen(done))
		it("should handle multiple subscribers", done => socket.onOpen(done))
	})
	describe("send", () => {
		it("should send the message and call the callback with the response", done => {
			socket.send("echo themessage", function(err, mess) {
				if(err) done(err)
				else if(mess != "themessage") done("echo should be 'themessage', was '" + mess + "'")
				else done()
			})
		})
		it("should call the callback with an error for garbage messages", done => {
			socket.send("this makes no sense at all", function(err, mess) {
				if(err) done()
				else done("no error! message = '" + mess + "'")
			})
		})
		it("should call the callback with an error for unknown api keys", done => {
			socket.send("12 this makes no sense at all", function(err, mess) {
				if(err) done()
				else done("no error! message = '" + mess + "'")
			})
		})		
	})
})
