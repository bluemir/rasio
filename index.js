var EventEmitter = require("events").EventEmitter;
var util = require("util");
var Pin = require("./pin.js");

var PINS = require("./pins.js");

var rasio = new EventEmitter();
rasio.VALUE = {
	HIGH : 1,
	LOW  : 0
}
rasio.MODE = {
	OUTPUT : "out",
	INPUT : "in"
}

Pin.setDefaultErrorHandler(function(err){
	if(!err) return;
	if(rasio.emit("error", err)){
		console.err("Missing Error Handler : ", err);
	}
});
rasio.pin = [];
for(pinNumber in PINS.v2){
	rasio.pin[pinNumber] = new Pin(PINS.v2[pinNumber]);
}

rasio.enable = function(pinNumber, mode, callback){
	this.pin[pinNumber].enable(mode, callback);
}
rasio.read = function(pinNumber, callback){
	this.pin[pinNumber].read(callback);
}
rasio.write = function(pinNumber, value, callback){
	this.pin[pinNumber].write(value, callback);
}

module.exports = rasio;
