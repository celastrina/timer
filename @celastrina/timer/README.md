# @celastrina/timer

Celastrina Add-On for Time Triggers in Azure Functions.

# Quick Start

Creating your first Timer Function:

```
const {LOG_LEVEL, CelastrinaError, Configuration} = require(“@celastrina/core”);
const {TickEvent, TimerFunction, TimerAddOn} = require(“@celastrina/timer”);

class MyFirstFunction extends TimerFunction {
    constructor(config) {
        super(config);
    } 

    async onTick(event) {
        // Successful tick event!
		event.context.log("Welcome!", LOG_LEVEL.INFO);
		// To reject the event
		//event.reject(CelastrinaError.newError("Something Happened!"));
		// To abort the event, set TimerAddOn.abortOnReject=true, or invoke event.abort();
	}
	
	async onReject(event) {
	    // Rejected tick event.
	    // Rejections do not throw exceptions unless TimerAddOn.abortOnReject=true.
	}
	
	async onAbort(event) {
	    // Aborted event. Typically when an exception happens or TimerAddOn.abortOnReject=true.
	    // TimerFunction will throw the exception after this method is called.
	}
}
 
const _config = new Configuration(“MyFirstFunction”);
const _timerconfig = new TimerAddOn();
_config.addOn(_timerconfig);
module.exports = new MyFirstFunction (_config);
```

You will need to make a few updates to your function.json. You’ll need to add an “entryPoint” attribute with the value 
“execute” and ensure your binding is named “tick”.

```
{
    “entryPoint”: “execute”,
    "bindings": [
        {
           "name": "tick",
           "type": "timerTrigger",
           "direction": "in",
           "schedule": "0 */5 * * * *"
        }
    ]
}
```

For more information please visit [@celastrina/timer](https://github.com/celastrina/timer/wiki) wiki on Github.
