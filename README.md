# live-remote-api


####The browser part of m4l-ApiServer

This contains the RemoteApi js class, used to communicate with https://github.com/mihop/m4l-apiserver.  

```js
RemoteApi.create("live_set master_track mixer_device volume", function(err, api) {  
	api.observe("value", function(v) {  
		console.log("Master Track Volume Value", v)  
	})  
	api.set("value", 0.85)
})

```  
		






