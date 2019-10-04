/**
 * 
 */
'use strict';


class ClientContainerServer {
	constructor(service) {
		this.service = service;
		this.global = service.global;
		
		//var path = require('path');
		//this.app_root_dir = path.join(__dirname, '../clientroot/nodemodules/ethereum_core/imports/');
		
		var Ethereum_core = require('../clientroot/nodemodules/ethereum_core');
		var Ethereum_erc20 = require('../clientroot/nodemodules/ethereum_erc20');

		this.ethereum_core = Ethereum_core.getObject();
		this.ethereum_erc20 = Ethereum_erc20.getObject();
	}
	
	init(callback) {
		var global = this.global;
		var self = this;
		
		var promise_ethereum_core = this.ethereum_core.init();
		
		promise_ethereum_core.then(function() {
			global.log('init of ethereum_core done');
			
			var localstoragedir = global.getConfigValue('local_storage_dir');
			
			if (localstoragedir) {
				var _globalscope = global.getExecutionGlobalScope();
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