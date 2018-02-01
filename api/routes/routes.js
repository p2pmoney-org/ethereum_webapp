/**
 * 
 */

'use strict';


module.exports = function(app) {
	var Global = require('../../server/includes/global.js');
	  
	var global = Global.getGlobalInstance();

	var route_root_path = global.route_root_path;

	var Controller = require('../controllers/controllers');
	
	app.route(route_root_path + '/')
	.get(Controller.version);
	app.route(route_root_path + '/version')
	.get(Controller.version);


	// web3
	app.route(route_root_path + '/web3/:id/balance')
	.get(Controller.web3_balance);
	
	// truffle
	app.route(route_root_path + '/truffle/artifact/load')
	.post(Controller.truffle_loadartifact);
	app.route(route_root_path + '/truffle/contract/load')
	.post(Controller.truffle_loadContract);
	app.route(route_root_path + '/truffle/contract/at')
	.post(Controller.truffle_contract_at);
	app.route(route_root_path + '/truffle/contract/new')
	.post(Controller.truffle_contract_new);
	app.route(route_root_path + '/truffle/contract/:id/call')
	.post(Controller.truffle_method_call);
	app.route(route_root_path + '/truffle/contract/:id/send')
	.post(Controller.truffle_method_sendTransaction);
	
	// session
	app.route(route_root_path + '/session/authenticate')
	.post(Controller.session_authenticate);
	app.route(route_root_path + '/session/:id/user')
	.get(Controller.session_getUser);
};