/**
 * 
 */
'use strict';


class ClientContainerRoutes {
	
	constructor(app, global) {
		this.app = app;
		this.global = global;
		
		var clientcontainerservice = global.getServiceInstance('client-container');
		
		clientcontainerservice.routes = this; // keep this referenced to stay in memory
		
		var ClientContainerControllers = require('../controllers/controllers.js');
		
		this.controllers = new ClientContainerControllers(global);
	}
	
	registerRoutes() {
		var app = this.app;
		var global = this.global;
		
		var controllers = this.controllers;
		
		global.log('ClientContainerRoutes.registerRoutes called')
		
		var route_root_path = global.route_root_path;

		// root
		app.route(route_root_path + '/clicont')
		.get(function(req, res) { controllers.clicont_root(req, res); });

		// crypto
		app.route(route_root_path + '/clicont/keys/generate')
		  .get(function(req, res) { controllers.clicont_keys_generate(req, res); });

		app.route(route_root_path + '/clicont/keys/publickeys')
		  .post(function(req, res) { controllers.clicont_keys_publickeys(req, res); });

		app.route(route_root_path + '/clicont/keys/encrypt')
		  .post(function(req, res) { controllers.clicont_keys_encrypt(req, res); });

		app.route(route_root_path + '/clicont/keys/decrypt')
		  .post(function(req, res) { controllers.clicont_keys_decrypt(req, res); });

		// local storage
		app.route(route_root_path + '/clicont/localstorage/get')
		  .post(function(req, res) { controllers.clicont_localstorage_get(req, res); });

		app.route(route_root_path + '/clicont/localstorage/set')
		  .post(function(req, res) { controllers.clicont_localstorage_set(req, res); });

		// web3
		app.route(route_root_path + '/clicont/web3/account/:id/balance')
		.get(function(req, res) { controllers.clicont_web3_account_balance(req, res); });
		
		// erc20
		app.route(route_root_path + '/clicont/erc20/token/:id')
		.get(function(req, res) { controllers.clicont_erc20_token(req, res); });
		
		app.route(route_root_path + '/clicont/erc20/token/import/:id')
		.get(function(req, res) { controllers.clicont_erc20_token_import(req, res); });

	}
	
	
}

module.exports = ClientContainerRoutes;