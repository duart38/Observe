![alt text](https://raw.githubusercontent.com/duart38/Observe/master/banner.svg "Logo Title Text 1")
# Observe
> **Simply observe any variable** <br>

> ![Test module](https://github.com/duart38/Observe/workflows/Test%20module/badge.svg?branch=master)  
[![nest badge](https://nest.land/badge.svg)](https://nest.land/package/Observe)


## Example (Deno)
```JavaScript
let obs = new Observe("initial value"); // new observable with type String

obs.bind((data) => { // bind to receive updates on value change
    // Do some stuff here (data here is of type string)
});

obs.setValue("another value"); // sets the value
obs.setValue("lorem", "ipsum", "dolor"); // sets the last value as active and emitting the other ones
console.log(obs.setValue("another value"))
```
Also check the examples folder for more examples

## Example (Basic html + js)
> Download Observe.js from the releases tab

**index.html**
```html
<html>
    <head></head>
    <body>
        <h1>Observable value test</h1>
        <script type="module" src="Observe.bundle.js"></script> <!-- Needs to come from a server as type module does not support local files-->
        <script src="./index.js"></script>
    </body>
</html>
```

**index.js**
```JavaScript
var observable = new Observe("s")
observable.bind((d)=>{
    console.log(d)
})
observable.setValue("new val")
```
## Methods

---

| Name           	| Description                                                                                                                                                                                                                 	|
|----------------	|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| getValue()     	| Returns the current value. To be used outside of callbacks                                                                                                                                                                  	|
| getHistory()   	| Gets the change history. Every time a new value is set it is pushed to a history array                                                                                                                                      	|
| bind()         	| used to listen to changes. Takes a callback method that is called with the new data when the observe instance changes. **Returns the function used for the event listener.. To be used with the unBind method (see below)** 	|
| unBind()       	| Unbinds a previously bound EventListener or EventListenerObject. The callback returned by bind() should be provided. Returns this                                                                                           	|
| setValue()     	| Updates the observed value.. all bound will be notified. Setting a value equals to the last set value will do nothing. Returns the value that was passed in it (last value in case multiple)                                	|
| stop()         	| Prevents event from reaching any registered event listeners after the current one. Returns this                                                                                                                             	|
| reset()        	| Restore the state to the original provided method. Returns this                                                                                                                                                             	|
| unBindAll()    	| Unbinds ALL previously bound EventListener or EventListenerObject.                                                                                                                                                          	|
| maxHistorySize 	| Limit the history array size **(can be lowered to save some precious ram)**                                                                                                                                                 	|
| getGlobalObservable 	| If opted in, receives the instance created that was attached to the JS window                                                                                                                                                	|


> The history length is limited to 1000 values.. after this the first value (excluding the original) will be removed on each push.. to increase or decrease this value change the "maxHistorySize" variable

See JSdoc for more information

### It is recommended to lower the value of maxHistorySize if you are not going to use the history.

## Testing
```Shell
deno test
```
