'use strict';

class Constants {
	//static get CURRENT_VERSION() { return "0.0.1.2018.10.01";}
	// obsolete, set in server.js now

	
	static push(key, value) {
		if (!Constants.valuemap) {
			Constants.valuemap = Object.create(null);
		}
		
		var keystring = key.toString().trim().toLowerCase();
		
		if (!Constants.valuemap[keystring]) {
			Constants.valuemap[keystring] = value;
		}
		else {
			if (Array.isArray(Constants.valuemap[keystring]) === false) {
				var array = [];
				array.push(Constants.valuemap[keystring]);
				Constants.valuemap[keystring] = array;
			}
			
			Constants.valuemap[keystring].push(value);
		}
	}
	
	static get(key) {
		if (!Constants.valuemap) {
			Constants.valuemap = Object.create(null);
		}

		var keystring = key.toString().trim().toLowerCase();

		return Constants.valuemap[keystring];
	}
	
}

module.exports = Constants;