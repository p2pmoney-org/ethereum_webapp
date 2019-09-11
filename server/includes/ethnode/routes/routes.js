/**
 * 
 */
'use strict';


class EthNodeRoutes {
	
	constructor(app, global) {
		this.app = app;
		this.global = global;
		
		var ethnodeservice = global.getServiceInstance('ethnode');
		
		ethnodeservice.routes = this; // keep this referenced to stay in memory
		
		var EthNodeControllers = require('../controllers/controllers.js');
		
		this.controllers = new EthNodeControllers(global);
	}
	
	registerRoutes() {
		var app = this.app;
		var global = this.global;
		
		var controllers = this.controllers;
		
		global.log('EthNodeRoutes.registerRoutes called')
		
		var route_root_path = global.route_root_path;

		// web3
		app.route(route_root_path + '/web3')
		.get(function(req, res) { controllers.web3_root(req, res); });
		
		app.route(route_root_path + '/web3/provider')
		.get(function(req, res) { controllers.web3_root(req, res); })
		.put(function(req, res) { controllers.web3_set_provider(req, res); });
		
		app.route(route_root_path + '/web3/node')
		.get(function(req, res) { controllers.web3_node(req, res); });
		
		app.route(route_root_path + '/web3/account/:id/balance')
		.get(function(req, res) { controllers.web3_account_balance(req, res); });
		
		app.route(route_root_path + '/web3/account/:id/code')
		.get(function(req, res) { controllers.web3_account_code(req, res); });
		app.route(route_root_path + '/web3/account/:id/tx/count')
		.get(function(req, res) { controllers.web3_account_transaction_count(req, res); });
		
		app.route(route_root_path + '/web3/block/currentnumber')
		.get(function(req, res) { controllers.web3_block_current_number(req, res); });
		app.route(route_root_path + '/web3/block/:id')
		.get(function(req, res) { controllers.web3_block(req, res); });
		app.route(route_root_path + '/web3/block/:id/txs')
		.get(function(req, res) { controllers.web3_block_and_transactions(req, res); });
		
		app.route(route_root_path + '/web3/tx/:id')
		.get(function(req, res) { controllers.web3_transaction(req, res); });
		app.route(route_root_path + '/web3/tx/:id/receipt')
		.get(function(req, res) { controllers.web3_transaction_receipt(req, res); });
		
		app.route(route_root_path + '/web3/findtx')
		.post(function(req, res) { controllers.web3_find_transaction(req, res); });
		app.route(route_root_path + '/web3/usertx')
		.post(function(req, res) { controllers.web3_user_transactions(req, res); });
		app.route(route_root_path + '/web3/sendtx')
		.post(function(req, res) { controllers.web3_sendtransaction(req, res); });
		

		app.route(route_root_path + '/web3/artifact/load')
		.post(function(req, res) { controllers.web3_artifact_load(req, res); });
		app.route(route_root_path + '/web3/contract/load')
		.post(function(req, res) { controllers.web3_contract_load(req, res); });
		app.route(route_root_path + '/web3/contract/at')
		.post(function(req, res) { controllers.web3_contract_at(req, res); });
		app.route(route_root_path + '/web3/contract/new')
		.post(function(req, res) { controllers.web3_contract_new(req, res); });
		app.route(route_root_path + '/web3/contract/:id/call')
		.post(function(req, res) { controllers.web3_contract_call(req, res); });
		app.route(route_root_path + '/web3/contract/:id/send')
		.post(function(req, res) { controllers.web3_contract_send(req, res); });

		// truffle (obsolete)
		app.route(route_root_path + '/truffle/artifact/load')
		.post(function(req, res) { controllers.web3_artifact_load(req, res); });
		app.route(route_root_path + '/truffle/contract/load')
		.post(function(req, res) { controllers.web3_contract_load(req, res); });
		app.route(route_root_path + '/truffle/contract/at')
		.post(function(req, res) { controllers.web3_contract_at(req, res); });
		app.route(route_root_path + '/truffle/contract/new')
		.post(function(req, res) { controllers.web3_contract_new(req, res); });
		app.route(route_root_path + '/truffle/contract/:id/call')
		.post(function(req, res) { controllers.web3_contract_call(req, res); });
		app.route(route_root_path + '/truffle/contract/:id/send')
		.post(function(req, res) { controllers.web3_contract_send(req, res); });
}
	
	
}

module.exports = EthNodeRoutes;