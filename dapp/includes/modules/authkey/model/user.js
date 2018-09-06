'use strict';


var User = class {
	constructor(username) {
		this.username = username;
		
		
		this.getClass = function() { return this.constructor.getClass()};
	}
}

if ( typeof GlobalClass !== 'undefined' && GlobalClass )
GlobalClass.registerModuleClass('authkey', 'User', User);
else
module.exports = User; // we are in node js