"use strict"

/*
 *
 * This class probably comes closest to the LiveAPI js object in m4l.
 * Every RemoteApi object has its corresponding LiveAPI object on the server.
 * It sends/receives messages as the would look in max and exposes the results in a more js-idiomatic way.
 * It probably shows best the wastefulness of the protocol (strings where there should be numbers).
 * Alas, it was fast & easy to implement, so forgive me.
 * Use RemoteApi.create to instantiate and destroy() to, yaknow, destroy.
 * 
 */

import { socket } from "./socket"

export class RemoteApi {
	info: any
	error: string
	errorListener: (err: string) => void

	constructor(info: any) {
		this.info = info
	}
	
	onError(callback: (val: string) => void) {
		this.errorListener = callback
	}
	
	get(property: string, callback: ValueCallback) {
		var self = this
		socket.send("get " + this.info.key + " " + property, function(err, val) {
			if(err) self.setError(err)
			else callback(val)
		})
	}
	
	set(property: string, value: any) {
		socket.send("set " + this.info.key + " " + property + " " + value)
	}

	observe(property: string, callback: ValueCallback) {
		var self = this
		socket.send("observe " + this.info.key + " " + property, function(err, val) {
			if(err) self.setError(err)
			else callback(val)
		})
	}
	
	call(name: string, params: any[] | any, callback?: ValueCallback) {
		var self = this
		var ps = ""
		if(params) {
			if(params instanceof Array) ps = " " + params.join(" ")
			else ps = " " + params
		}
		if(!callback) socket.send("call " + this.info.key + " " + name + ps)
		else socket.send("call " + this.info.key + " " + name + ps, function(err, val) {
			if(err) self.setError(err)
			else callback(val)
		})
	}
	
	destroy() {
		socket.send("destroy " + this.info.key)
	}
	
	private setError(err: string) {
		this.error = err
		if(this.errorListener) this.errorListener(err)
	}
	
	static create(path: string, callback: NodeCallback, followPath: boolean = false) {
		socket.send("new " + path + " " + followPath, function(err, info) {
			if(err) callback(err, null)
			else callback(null, new RemoteApi(JSON.parse(info)))
		})
	}

	static info(path: string, callback: NodeCallback) {
		socket.send("info " + path, function(err, info) {
			if(err) callback(err, null)
			else callback(null, JSON.parse(info))
		})
	}
	
	static onOpen(action: Action) {
		socket.onOpen(action)
	}
	
	static echo(message: string, callback: NodeCallback) {
		socket.send("echo " + message, callback)
	}
}
