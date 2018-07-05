/**
 * 
 */
'use strict';


class AuthKeyRoutes {
	
	constructor(app, global) {
		this.app = app;
		this.global = global
	}
	
	registerRoutes() {
		var app = this.app;
		var global = this.global;
		
		global.log('AuthKeyRoutes.registerRoutes called')
		
		var route_root_path = global.route_root_path;

		var AuthKeyControllers = require('../controllers/authkey-controllers.js');

		app.route(route_root_path + '/authorize')
		.get(AuthKeyControllers.authorize);
		
		
	}
	
	
}

module.exports = AuthKeyRoutes;