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

		app.route(route_root_path + '/clicont/keys/aes/encrypt')
		  .post(function(req, res) { controllers.clicont_keys_aes_encrypt(req, res); });

		app.route(route_root_path + '/clicont/keys/aes/decrypt')
		  .post(function(req, res) { controllers.clicont_keys_aes_decrypt(req, res); });

		app.route(route_root_path + '/clicont/keys/rsa/encrypt')
		  .post(function(req, res) { controllers.clicont_keys_rsa_encrypt(req, res); });

		app.route(route_root_path + '/clicont/keys/rsa/decrypt')
		  .post(function(req, res) { controllers.clicont_keys_rsa_decrypt(req, res); });

		// local storage
		app.route(route_root_path + '/clicont/localstorage/get')
		  .post(function(req, res) { controllers.clicont_localstorage_get(req, res); });

		app.route(route_root_path + '/clicont/localstorage/set')
		  .post(function(req, res) { controllers.clicont_localstorage_set(req, res); });
		
		// vaults
		app.route(route_root_path + '/clicont/vaults/create')
		  .post(function(req, res) { controllers.clicont_vaults_create(req, res); });
		app.route(route_root_path + '/clicont/vaults/open')
		  .post(function(req, res) { controllers.clicont_vaults_open(req, res); });
		app.route(route_root_path + '/clicont/vaults/value/get')
		  .post(function(req, res) { controllers.clicont_vaults_value_get(req, res); });
		app.route(route_root_path + '/clicont/vaults/value/put')
		  .post(function(req, res) { controllers.clicont_vaults_value_put(req, res); });

		// web3
		app.route(route_root_path + '/clicont/web3')
		.get(function(req, res) { controllers.clicont_web3_root(req, res); });
		
		app.route(route_root_path + '/clicont/web3/provider')
		.get(function(req, res) { controllers.clicont_web3_get_provider(req, res); })
		.post(function(req, res) { controllers.clicont_web3_add_provider(req, res); })
		.put(function(req, res) { controllers.clicont_web3_set_provider(req, res); });
		
		app.route(route_root_path + '/clicont/web3/node')
		.get(function(req, res) { controllers.clicont_web3_node(req, res); });
		
		app.route(route_root_path + '/clicont/web3/account/:id/balance')
		.get(function(req, res) { controllers.clicont_web3_account_balance(req, res); });
		
		// erc20
		app.route(route_root_path + '/clicont/erc20/token/:id')
		.get(function(req, res) { controllers.clicont_erc20_token(req, res); });
		
		app.route(route_root_path + '/clicont/erc20/token/import/:id')
		.get(function(req, res) { controllers.clicont_erc20_token_import(req, res); });

		// authkey
		app.route(route_root_path + '/clicont/account/session/keys')
		.post(function(req, res) { controllers.clicont_session_getAccountKeys(req, res); });
		
		app.route(route_root_path + '/clicont/account/user/add')
		.put(function(req, res) { controllers.clicont_user_addAccount(req, res); });
		app.route(route_root_path + '/clicont/account/user/update')
		.put(function(req, res) { controllers.clicont_user_updateAccount(req, res); });
		app.route(route_root_path + '/clicont/account/user/reactivate')
		.put(function(req, res) { controllers.clicont_user_reactivateAccount(req, res); });
		app.route(route_root_path + '/clicont/account/user/deactivate')
		.put(function(req, res) { controllers.clicont_user_deactivateAccount(req, res); });
		app.route(route_root_path + '/clicont/account/user/remove')
		.put(function(req, res) { controllers.clicont_user_removeAccount(req, res); });

	}
	
	
}

module.exports = ClientContainerRoutes;