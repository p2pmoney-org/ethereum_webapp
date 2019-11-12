/**
 * 
 */
'use strict';


class ClientContainerServer {
	constructor(service) {
		this.service = service;
		this.global = service.global;
		
		//var Ethereum_core = require('@p2pmoney-org/ethereum_core');
		//var Ethereum_erc20 = require('@p2pmoney-org//ethereum_erc20');
		
		var Ethereum_core = require('../clientroot/nodemodules/@p2pmoney-org/ethereum_core');
		var Ethereum_erc20 = require('../clientroot/nodemodules/@p2pmoney-org/ethereum_erc20');

		this.ethereum_core = Ethereum_core.getObject();
		this.ethereum_erc20 = Ethereum_erc20.getObject();
	}
	
	init(callback) {
		var global = this.global;
		var self = this;
		
		var promise_ethereum_core = this.ethereum_core.init();
		
		promise_ethereum_core.then(function() {
			global.log('init of ethereum_core done');
			
			var _globalscope = global.getExecutionGlobalScope();
			
			// config
			var Config = _globalscope.simplestore.Config;
			var clientglobal = _globalscope.simplestore.Global.getGlobalObject();

			var web3_provider_url = global.getConfigValue('web3_provider_url');
			
			if (web3_provider_url) {
				if (web3_provider_url.startsWith('https://')) {
					Config.web3provider_protocol = 'https://';
					Config.web3provider_host = web3_provider_url.substring(8);
				}
				else if (web3_provider_url.startsWith('http://')) {
					Config.web3provider_protocol = 'http://';
					Config.web3provider_host = web3_provider_url.substring(7);
				}
				
			}
			
			var web3_provider_port = global.getConfigValue('web3_provider_port');
			
			if (web3_provider_port) {
				if ((web3_provider_port == '80') || (web3_provider_port == 80)) {
					Config.web3provider_port = '';
				}
				else {
					Config.web3provider_port = web3_provider_port;
				}
			}
			
			// set url in ethnode module to overload previous computation
			var fullweb3providerurl = Config.getWeb3ProviderUrl();
			
			var ethnodemodule = clientglobal.getModuleObject('ethnode');
			
			ethnodemodule.setWeb3ProviderUrl(fullweb3providerurl);
			
			// test
			/*var commonmodule = clientglobal.getModuleObject('common');
			var session = commonmodule.createBlankSessionObject();
			
			var ethereumnodeaccessinstance = ethnodemodule.getEthereumNodeAccessInstance(session)
			var url = ethereumnodeaccessinstance._getWeb3Instance()._provider.host;
			global.log('web3 provider is ' + url);*/
			// test


			// local storage
			var localstoragedir = global.getConfigValue('local_storage_dir');
			
			if (localstoragedir) {
				// set storage dir
				var localStorage = _globalscope.simplestore.localStorage;
				
				if ( (localStorage) && (localStorage.setStorageDir) ) {
					global.log('setting local storage directory to: ' + localstoragedir);
					localStorage.setStorageDir(localstoragedir);
				}
			}
			
			
			var promises = [];
			
			// stack promises of dapps modules
			var promise_ethereum_erc20 = self.ethereum_erc20.init();
			
			promises.push(promise_ethereum_erc20);

			var promise_all = Promise.all(promises).then(function(arr) {
				global.log('init of all dapps modules done');

				if (callback)
					callback(null, true);
			});
		});
		
		
	}
	
	
	log(string) {
		var global = this.global;
		
		global.log(string);
	}
	
	getClientContainer(serversession) {
		if (serversession.clientcontainer)
			return serversession.clientcontainer;
		
		// we spawn a new container
		var serverglobal = this.global;
		var simplestore = serverglobal.getExecutionGlobalScope().simplestore;
		
		serverglobal.log('ClientContainerServer.getClientContainer called for sessionuuid ' + serversession.getSessionUUID());
		
		var sessionuuid = serversession.getSessionUUID();
		
		var clientglobal = this.ethereum_core.getGlobalObject();
		var clientcommonmodule = clientglobal.getModuleObject('common');
		
		var clientsession = clientcommonmodule.findSessionObjectFromUUID(sessionuuid);
		
		var ClientContainer = require('./client-container.js');
		var clientcontainer = new ClientContainer(clientglobal, this);
		
		serversession.clientcontainer = clientcontainer;
		
		return clientcontainer;
	}
	
}

module.exports = ClientContainerServer;