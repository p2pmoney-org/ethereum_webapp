'use strict';


class CacheObject {
	
	constructor(global, name) {
		this.global = global;
		this.name = name;
		
		this.map = Object.create(null);
		this.validitylimit = 900000; // 15 mn
	}
	
	getName() {
		var now = Date.now();
		var keystring = key.toString();

		return this.name;
	}
	
	getValidityLimit() {
		return this.validitylimit;
	}
	
	setValidityLimit(validitylimit) {
		this.validitylimit = validitylimit;
	}
	
	_entryStillValid(entry) {
		if (!entry)
			return false;
		
		var now = Date.now();
		var then = entry.time;
		
		if ((now - then) < this.validitylimit)
			return true;
		else
			return false;
	}
	
	getValue(key) {
		var keystring = key.toString();
		
		var entry = this.map[keystring];
		
		if (entry) {
			if (this._entryStillValid(entry))
				return entry.value;
			else 
				delete this.map[keystring];
		} 
	}
	
	putValue(key, value) {
		var now = Date.now();
		var keystring = key.toString();
		
		var entry = {key: key, value: value, time: now};
		
		this.map[keystring] = entry;
		
		this.garbage();
	}
	
	empty() {
		this.map = Object.create(null);
	}
	
	garbage() {
		Object.keys(this.map).forEach((key) => {
			var keystring = key.toString();
		    var entry = this.map[keystring];
		    
		    if (!this._entryStillValid(entry))
		    	delete this.map[keystring];
		});		
	}
}

module.exports = CacheObject;