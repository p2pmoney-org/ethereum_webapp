/**
 * 
 */
'use strict';


class Service {
	
	constructor() {
		this.name = 'common';
		this.global = null;
	}
	
	loadService() {
		this.global.log('loadService called for service ' + this.name);

		this.Session = require('./model/session.js');
	}
	
	// object
	createBlankUserInstance() {
		var User = require('./model/user.js');
		
		return User.createBlankUserInstance();
	}

}

module.exports = Service;