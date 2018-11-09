/**
 * 
 */
'use strict';


class WebappRoutes {
	
	constructor(app, global) {
		this.app = app;
		this.global = global;
		
		var webappservice = global.getServiceInstance('ethereum_webapp');
		
		webappservice.routes = this; // keep this referenced to stay in memory
		
		var WebappControllers = require('../controllers/controllers.js');
		
		this.controllers = new WebappControllers(global);
	}
	
	registerRoutes() {
		var app = this.app;
		var global = this.global;
		
		var controllers = this.controllers;
		
		global.log('WebappRoutes.registerRoutes called')
		
		var route_root_path = global.route_root_path;

		// manifest
		app.route(route_root_path + '/webapp/dapp/manifest')
		.get(function(req, res) { controllers.webapp_getDappManifest(req, res); });
		app.route(route_root_path + '/webapp/dapp/manifest')
		.post(function(req, res) { controllers.webapp_postDappManifest(req, res); });
		
	}
	
	
}

module.exports = WebappRoutes;