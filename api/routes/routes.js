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

	app.route(route_root_path + '/config')
	.get(Controller.config);
	app.route(route_root_path + '/version')
	.get(Controller.version);
	app.route(route_root_path + '/version/support')
	.get(Controller.version_support);

	app.route(route_root_path + '/logs/server/tail')
	.get(Controller.get_logs_server_tail);
	
	var includeroot = '../../server/includes';
	var localroot = '../../server/local';
	
	//
	// Webapp routes
	//
	var WebappRoutes = require( localroot + '/webapp/routes/routes.js');
		
	var webapproutes = new WebappRoutes(app, global);
	
	webapproutes.registerRoutes();

	
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
	

	//
	// Storage routes
	//
	var StorageRoutes = require( includeroot + '/storage/routes/routes.js');
		
	var storageroutes = new StorageRoutes(app, global);
	
	storageroutes.registerRoutes();
	

};