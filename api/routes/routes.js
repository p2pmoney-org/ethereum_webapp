/**
 * 
 */

'use strict';


module.exports = function(app, global) {

	//
	// Root routes
	//
	var route_root_path = global.route_root_path;

	var Controller = require('../controllers/controllers.js');
	
	app.route(route_root_path + '/')
	.get(Controller.version);
	app.route(route_root_path + '/version')
	.get(Controller.version);

	
	var includeroot = '../../server/includes';
	
	//
	// EthNode routes
	//
	var EthNodeRoutes = require( includeroot + '/ethnode/routes/routes.js');
		
	var ethnoderoutes = new EthNodeRoutes(app, global);
	
	ethnoderoutes.registerRoutes();

	
	//
	// AuthKey routes
	//
	var AuthKeyRoutes = require( includeroot + '/authkey/routes/routes.js');
		
	var authkeyroutes = new AuthKeyRoutes(app, global);
	
	authkeyroutes.registerRoutes();
	

};