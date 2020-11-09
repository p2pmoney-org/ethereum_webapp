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
		app.route(route_root_path + '/session')
		.post(function(req, res) { controllers.session_status(req, res); });
		app.route(route_root_path + '/session/authenticate')
		.post(function(req, res) { controllers.session_authenticate(req, res); });
		app.route(route_root_path + '/session/:id')
		.get(function(req, res) { controllers.session_status(req, res); });
		app.route(route_root_path + '/session/:id/user')
		.get(function(req, res) { controllers.session_getUser(req, res); });
		app.route(route_root_path + '/session/:id/user')
		.put(function(req, res) { controllers.session_updateUser(req, res); });
		app.route(route_root_path + '/session/logout')
		.post(function(req, res) { controllers.session_logout(req, res); });
		
		//
		// key API
		//
		app.route(route_root_path + '/key/session/keys')
		.get(function(req, res) { controllers.session_getCryptoKeys(req, res); });
		
		app.route(route_root_path + '/key/user/add')
		.put(function(req, res) { controllers.user_addKey(req, res); });
		
		
		//
		// Account API
		//
		app.route(route_root_path + '/account/session/keys')
		.get(function(req, res) { controllers.session_getAccountKeys(req, res); });
		
		app.route(route_root_path + '/account/user/add')
		.put(function(req, res) { controllers.user_addAccount(req, res); });
		app.route(route_root_path + '/account/user/update')
		.put(function(req, res) { controllers.user_updateAccount(req, res); });
		app.route(route_root_path + '/account/user/reactivate')
		.put(function(req, res) { controllers.user_reactivateAccount(req, res); });
		app.route(route_root_path + '/account/user/deactivate')
		.put(function(req, res) { controllers.user_deactivateAccount(req, res); });
		app.route(route_root_path + '/account/user/remove')
		.put(function(req, res) { controllers.user_removeAccount(req, res); });
		
	}
	
	
}

module.exports = AuthKeyRoutes;