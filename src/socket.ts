"use strict"

/*
 * 
 * This is supposed to be used on the client/browser-side of
 * https://github.com/mihop/m4l-apiserver
 * 
 * It starts a websocket connection with ws://host:port.
 * If a socket error is encountered, everything stops and
 * the ErrorListeners(s) are called. 
 * 
 * Every sent message gets an id (mess_id) as its first param.
 * This id is sent back by the server as the first param in its response(s).
 * The WebSocket.onmessage listener can then use the id to call the corresponding callback.
 * 
 * Danger: There is no timeout, so this keeps waiting for responses as long as there is no response
 * with status 0 (ok) or 2 (error). In other words, if you supply a callback to 
 * the send function and there is no response, it leaks.
 * 
 */

var ssplit = require("string-split-keep")


var mess_id = 0

var open_actions: Action[] = []
var error_listeners: ValueCallback[] = []
var resp_listeners: {[key:number]: NodeCallback} = {}

var open : boolean = false
var error : Event = undefined;

var ws = new WebSocket("ws://" + location.hostname + ":" + location.port)

ws.onopen = function() {
	open = true
	open_actions.forEach(function(l) { callAction(l, "Error in onOpen Action") })
	open_actions = []
}

ws.onerror = function(e) {
	console.error("Websocket error", e)
	open = false
	error = e
	error_listeners.forEach(l => callListener(l, e, "Error in onError Listener"))
	error_listeners = []
}

ws.onmessage = function(e: MessageEvent) {
	var data = ssplit(e.data, " ", 3);
	var id = parseInt(data[0])
	var status = parseInt(data[1])
	var message = data[2]
	var cb = resp_listeners[id]
	if(!cb) {
		console.warn("Received socket message without subscriber", message)
		return
	}
	try {
		switch(status) {
		case 0: //ok
			delete resp_listeners[id]
			cb(null, message)
			break
		case 1: //keep-alive
			cb(null, message)
			break
		case 2: // error
			delete resp_listeners[id]
			cb(message, null)
			break
		default: throw "unknown status: " + status
		}
	} catch(e) {
		console.error("Error in socket message subscriber", cb, e)
	}
}


export module socket {
	
	export function onOpen(action: Action) {
		if(!open) open_actions.push(action)
		else callAction(action, "Error in onOpenAction")
	}
	
	export function onError(callback: ValueCallback) {
		if(!error) error_listeners.push(callback)
		else callListener(callback, error, "Error in onError Listener")
	}
	
	export function send(message: any, callback?: NodeCallback) {
		if(!open) throw "can't send websocket message: no connection!"
		var id = ++mess_id
		if(callback) resp_listeners[id] = callback
		ws.send(id + " " + message)
	}
}


function callAction(action: Action, err_mess: string) {
	try {
		action()
	} catch(e) {
		console.error(err_mess, action, e)
	}
}

function callListener(l: ValueCallback, val: any, err_mess: string) {
	try {
		l(val)
	} catch(e) {
		console.error(err_mess, l, val, e)
	}	
}

