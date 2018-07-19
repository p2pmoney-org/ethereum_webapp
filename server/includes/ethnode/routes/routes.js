/**
 * 
 */
'use strict';


class EthNodeRoutes {
	
	constructor(app, global) {
		this.app = app;
		this.global = global;
		
		var authkeyservice = global.getServiceInstance('ethnode');
		
		authkeyservice.routes = this; // keep this referenced to stay in memory
		
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
		app.route(route_root_path + '/web3/node')
		.get(function(req, res) { controllers.web3_node(req, res); });
		
		app.route(route_root_path + '/web3/account/:id/balance')
		.get(function(req, res) { controllers.web3_account_balance(req, res); });
		
		app.route(route_root_path + '/web3/account/:id/code')
		.get(function(req, res) { controllers.web3_account_code(req, res); });
		
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
		
		app.route(route_root_path + '/web3/contract/load')
		.post(function(req, res) { controllers.web3_contract_load(req, res); });
		app.route(route_root_path + '/web3/contract/:id/call')
		.post(function(req, res) { controllers.web3_contract_call(req, res); });

		// truffle
		app.route(route_root_path + '/truffle/artifact/load')
		.post(function(req, res) { controllers.truffle_loadartifact(req, res); });
		app.route(route_root_path + '/truffle/contract/load')
		.post(function(req, res) { controllers.truffle_loadContract(req, res); });
		app.route(route_root_path + '/truffle/contract/at')
		.post(function(req, res) { controllers.truffle_contract_at(req, res); });
		app.route(route_root_path + '/truffle/contract/new')
		.post(function(req, res) { controllers.truffle_contract_new(req, res); });
		app.route(route_root_path + '/truffle/contract/:id/call')
		.post(function(req, res) { controllers.truffle_method_call(req, res); });
		app.route(route_root_path + '/truffle/contract/:id/send')
		.post(function(req, res) { controllers.truffle_method_sendTransaction(req, res); });
}
	
	
}

module.exports = EthNodeRoutes;