/**
 * 
 */
'use strict';


class StorageRoutes {
	
	constructor(app, global) {
		this.app = app;
		this.global = global;
		
		var storageservice = global.getServiceInstance('storage');
		
		storageservice.routes = this; // keep this referenced to stay in memory
		
		var StorageControllers = require('../controllers/controllers.js');
		
		this.controllers = new StorageControllers(global);
	}
	
	registerRoutes() {
		var app = this.app;
		var global = this.global;
		
		var controllers = this.controllers;
		
		global.log('StorageRoutes.registerRoutes called')
		
		var route_root_path = global.route_root_path + '/storage';

		//
		// User storage API
		//
		app.route(route_root_path + '/user')
		.post(function(req, res) { controllers.user_storage(req, res); });
		app.route(route_root_path + '/user')
		.put(function(req, res) { controllers.put_user_storage(req, res); });
		app.route(route_root_path + '/user')
		.delete(function(req, res) { controllers.delete_user_storage(req, res); });
		
		app.route(route_root_path + '/user/import')
		.put(function(req, res) { controllers.user_import(req, res); });
		app.route(route_root_path + '/user/export')
		.post(function(req, res) { controllers.user_export(req, res); });
		
	}
	
	
}

module.exports = StorageRoutes;