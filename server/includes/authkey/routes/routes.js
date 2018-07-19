/**
 * 
 */
'use strict';


class AuthKeyRoutes {
	
	constructor(app, global) {
		this.app = app;
		this.global = global;
		
		var authkeyservice = global.getServiceInstance('authkey');
		
		authkeyservice.routes = this; // keep this referenced to stay in memory
		
		var AuthKeyControllers = require('../controllers/controllers.js');
		
		this.controllers = new AuthKeyControllers(global);
	}
	
	registerRoutes() {
		var app = this.app;
		var global = this.global;
		
		var controllers = this.controllers;
		
		global.log('AuthKeyRoutes.registerRoutes called')
		
		var route_root_path = global.route_root_path;

		app.route(route_root_path + '/authorize')
		.get(function(req, res) { controllers.authorize(req, res); });
		
		
		//
		// auth API
		//
		
		// session
		app.route(route_root_path + '/session/authenticate')
		.post(function(req, res) { controllers.session_authenticate(req, res); });
		app.route(route_root_path + '/session/:id/user')
		.get(function(req, res) { controllers.session_getUser(req, res); });
		
		//
		// key API
		//
		app.route(route_root_path + '/key/session/keys')
		.get(function(req, res) { controllers.session_getKeys(req, res); });
		
	}
	
	
}

module.exports = AuthKeyRoutes;