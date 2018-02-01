// additional js variables for overload on standard dapp
/**
 * 
 */
'use strict';

class XtraConfig {
	
	constructor() {
		console.log("XtraConfig constructor called");
		
		this.ethereum_node_access_path = './js/src/xtra/lib/ethereum-node-access.js';
		this.allow_remote_access = 'enabled';
		this.rest_server_url = ':rest_server_url';
		this.rest_server_api_path = ':rest_server_api_path';
		
		this.init();
	}
	
	init() {
		console.log("XtraConfig initializing");
		
		this.initHooks();
	}
	
	initHooks() {
		console.log("XtraConfig initializing hooks");
		
		var global = XtraConfig.getGlobalObject();
		var controllers = global.getControllersObject();

		// overload handleDisplayIdentificationBox
		controllers.handleDisplayIdentificationBox = this.handleDisplayIdentificationBox;
	}
	
	handleDisplayIdentificationBox() {
		console.log("XtraConfig.handleDisplayIdentificationBox called");

		// watch-out, 'this' is defined as the context
		// of the calling object from event listener
		var global = XtraConfig.getGlobalObject();
		var app = global.getAppObject();
		var session = global.getSessionObject();

		var username = prompt("Enter username", "");
		var password = prompt("Enter password", "");

		if (username != null) {
			
			var EthereumNodeAccess = session.getEthereumNodeAccessInstance();
			
			var versionpromise = EthereumNodeAccess.webapp_version(function(err, version) {
				console.log("version is " + version);
			});
			
			var authenticationpromise = EthereumNodeAccess.webapp_session_authenticate(username, password, function(err, res) {
				var authenticated = (res['status'] == '1' ? true : false);
				
				console.log("authentication is " + authenticated);
				
				if (authenticated) {
					var privatekey = res['private_key'];
					
					var sessionaccount = global.createBlankAccountObject();
					
					sessionaccount.setPrivateKey(privatekey);
					
					session.impersonateAccount(sessionaccount);
					
					app.refreshDisplay();
				}
				else {
					prompt("Could not authenticate you with these credentials!");
				}
				
			});

			
		}	
		
	}
	
	static getGlobalObject() {
		var global;
		
		try {
			global = window.Global.getGlobalObject();
		}
		catch(e) {
			console.log("exception in XtraConfig.getGlobalObject " + e);
		}
		
		return global;
	}
}


//export

if ( typeof window !== 'undefined' && window ) // if we are in browser and not node js (e.g. truffle)
window.Config.XtraConfig = XtraConfig;