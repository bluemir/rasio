var EventEmitter = require("events").EventEmitter;
var util = require("util");
var fs = require("fs");

var PREFIX = "/sys/class/gpio/";

var noop = function(){};
var defaultErrorHandler = function(err){
	throw new Error("Missing Error Handler");
}

util.inherits(Pin, EventEmitter);
function Pin(gpioID){
	//if enabled
	var that = this;

	this.gpioID = gpioID;

	this.checkEnabled(function(f){
		if(f){
			that._watcher = watch(that);
		}
	});
}
Pin.setDefaultErrorHandler = function(handler){
	defaultErrorHandler = handler;
}

Pin.prototype.enable = function(mode, callback){ 
	var that = this;
	callback = callback || defaultErrorHandler;

	fs.writeFile(PREFIX + "export", that.gpioID, {encoding:"utf8"}, function(err){
		if(err) {
			switch(err.code){
				case "EBUSY":
					//ignore error
					break;
				default:
					return callback(err);
			}
		}
		fs.writeFile(PREFIX + "gpio" + that.gpioID + "/direction", mode, function(err){
			if(err) return callback(err);
			this._watcher = watch(that);
			callback(null);
		});
	});
}

Pin.prototype.read = function(callback){
	callback = callback || defaultErrorHandler;
	fs.readFile(PREFIX + "gpio" + this.gpioID + "/value", function(err, data){
		if(err) return callback(err);
		callback(parseInt(data));
	});
}
Pin.prototype.write = function(value, callback){
	fs.writeFile(PREFIX + "gpio" + this.gpioID + "/value", value, callback || defaultErrorHandler);
}
Pin.prototype.isEnabled = function(){
	return fs.existsSync(PREFIX + "gpio" + this.gpioID);
}
Pin.prototype.checkEnabled = function(callback){
	fs.exists(PREFIX + "gpio" + this.gpioID, callback);
}
//private
function watch(that){
	return fs
		.watch(PREFIX + "gpio" + that.gpioID + "/value")
		.on("change", onChange)
		.on("error", onError);
	function onChange(){
		fs.readFile(PREFIX + "gpio" + that.gpioID + "/value", function(err, data){
			that.emit("value", parseInt(data));
		});
	}
	function onError(err){
		defaultErrorHandler(err);
	}
}
module.exports = Pin;
