

/*
 * This tests 2 things: First, it's a unit test for the RemoteApi class,
 * second an integration test for https://github.com/mihop/m4l-apiserver.
 * It requires Live and the the ApiServer device running on localhost:7475.
 * 
 */

global.WebSocket = require("websocket").w3cwebsocket
global.location = { hostname: "127.0.0.1", port: "7475" }


var RemoteApi = require("../target/remoteapi").RemoteApi

describe("RemoteApi", () => {
	
	describe("static echo", () => {
		it("should echo the arguments", done => {
			RemoteApi.echo("21 && the 1 message, 0 we want | echoed! 14", (err, mess) => {
				if(err) done(err)
				else if(mess != "21 && the 1 message, 0 we want | echoed! 14") done("unexpected echo: " + mess)
				else done()
			})
		})
	})
	
	describe("static create", () => {
		it("should create a RemoteApi instance", done => {
			RemoteApi.create("live_set", (err, api) => {
				if(err) done(err)
				else {
					api.destroy()
					done()
				}
			})
		})
	})
	
	describe("destroy", () => {
		it("should destroy a RemoteApi instance", done => {
			RemoteApi.create("live_set master_track mixer_device volume", (err, api) => {
				if(err) done(err)
				api.destroy()
				api.onError(e => done())
				api.get("value", val => done("destroyed api still works!"))
			})
		})
	})
	
	describe("set/observe", () => {
		it("set changes value, observe callback receives updated value", done => {
			RemoteApi.create("live_set master_track mixer_device volume", (err, api) => {
				if(err) done(err)
				api.set("value", 0)
				api.observe("value", val => {
					if(val == 0) return
					if(val == 0.71) {
						done()
						api.destroy()
					}
					else done("observed wrong value: " + val)
				})
				api.set("value", 0.71)
			})
		})
	})
	
	describe("call", () => {
		it("should call a function with no params", done => {
			RemoteApi.create("live_set", (err, api) => {
				if(err) done(err)
				api.call("stop_playing")
				api.observe("is_playing", val => {
					if(val == 0) return
					if(val == 1) {
						api.call("stop_playing")
						api.destroy()
						done()
					}
					else done("unexpected is_playing value: " + val)
				})
				api.call("start_playing")
			})
		})
		
		it("should call a function with no params and receive return value", done => {
			RemoteApi.create("live_set", (err, api) => {
				if(err) done(err)
				else api.call("is_cue_point_selected", undefined, val => {
					api.destroy()
					if(val == 1 || val == 0) done()
					else done("unexpected return value: " + val)
				})
			})
		})
		
		it("should call a function with params and receive return value", done => {
			RemoteApi.create("live_app view", (err, api) => {
				if(err) done(err)
				api.call("show_view", "Session")
				api.call("show_view", "Arranger")
				api.call("is_view_visible", "Arranger", val => {
					api.destroy()
					if(val == 1) done()
					else done("Arranger view should be visible")
				})
			})
		})
		
	})
})