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
	app.route(route_root_path + '/config/network')
	.get(Controller.config_network);
	
	
	app.route(route_root_path + '/version')
	.get(Controller.version);
	app.route(route_root_path + '/version/support')
	.get(Controller.version_support);

	app.route(route_root_path + '/logs/server/tail')
	.get(Controller.get_logs_server_tail);
	
	//
	// invoke hook to let services registers their routes
	//
	var result = [];
	
	var params = [];
	
	params.push(app);
	params.push(global);

	var ret = global.invokeHooks('registerRoutes_hook', result, params);
	
	if (ret && result && result.length) {
		global.log('some services handled registerRoutes_hook ' + JSON.stringify(result));
	}
	

};