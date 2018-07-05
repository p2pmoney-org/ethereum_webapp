// additional js variables for overload on standard dapp
/**
 * 
 */
'use strict';

class XtraConfigModule {
	constructor() {
		this.name = 'xtraconfig';
		
		this.global = null; // put by global on registration
		this.isready = false;
		this.isloading = false;
		
		this.ethereum_node_access_path = './js/src/xtra/lib/ethereum-node-access.js';
	}
	
	init() {
		console.log('xtraconfig module init called');
		
		this.isready = true;
	}
	
	// compulsory  module functions
	loadModule(parentscriptloader, callback) {
		console.log('xtraconfig module loadModule called');
		
		if (this.isloading)
			return;
			
		this.isloading = true;

		var self = this;

		var modulescriptloader = parentscriptloader.getChildLoader('xtraconfigmoduleloader');

		modulescriptloader.load_scripts(function() { self.init(); if (callback) callback(null, self); });

		return modulescriptloader;	
	}
	
	isReady() {
		return this.isready;
	}

	hasLoadStarted() {
		return this.isloading;
	}

	// optional  module functions
	registerHooks() {
		console.log('xtraconfig module registerHooks called');
		
		var global = this.global;
		
		global.registerHook('preFinalizeGlobalScopeInit_hook', 'xtraconfig', this.preFinalizeGlobalScopeInit_hook);
		global.registerHook('postFinalizeGlobalScopeInit_hook', 'xtraconfig', this.postFinalizeGlobalScopeInit_hook);
		
		global.registerHook('getEthereumNodeAccessInstance_hook', 'xtraconfig', this.getEthereumNodeAccessInstance_hook);
	}
	
	//
	// hooks
	//
	preFinalizeGlobalScopeInit_hook(result, params) {
		console.log('xtraconfig preFinalizeGlobalScopeInit_hook called');
		
		var global = this.global;

		// create script load promise now
		var ethereum_node_access_path = this.ethereum_node_access_path;
		
		var nodeaccesspromise = ScriptLoader.createScriptLoadPromise(ethereum_node_access_path, function() {
			console.log('XtraEthereumNodeAccess loaded')
		})
		
		global.pushFinalInitializationPromise(nodeaccesspromise);

				
		result['xtraconfig'] = true;
		
		return true;
	}

	postFinalizeGlobalScopeInit_hook(result, params) {
		console.log('xtraconfig postFinalizeGlobalScopeInit_hook called');
		
		var global = this.global;
		var commonmodule = global.getModuleObject('common');

		// overload EthereumNodeAccess class
		this.EthereumNodeAccess = window.Xtra_EthereumNodeAccess;
		
		// reset ethereum instance if already instantiated
		var session = commonmodule.getSessionObject();
		session.ethereum_node_access_instance = null;

		result['xtraconfig'] = true;
		
		return true;
	}


	getEthereumNodeAccessInstance_hook(result, params) {
		console.log('xtraconfig getEthereumNodeAccessInstance_hook called');
		
		var global = XtraConfig.getGlobalObject();
		var xtraconfigmodule = global.getModuleObject('xtraconfig');
		
		var session = params[0];
		
		result[0] = new this.EthereumNodeAccess(session); 
		
		return true;
	}


	
}

class XtraConfig {
	
	constructor() {
		console.log("XtraConfig constructor called");
		
		//this.ethereum_node_access_path = './js/src/xtra/lib/ethereum-node-access.js';
		this.allow_remote_access = 'enabled';
		this.rest_server_url = ':rest_server_url';
		this.rest_server_api_path = ':rest_server_api_path';
		
		this.defaultgaslimit = ':defaultgaslimit';
		this.defaultgasprice = ':defaultgasprice';
		
		this.need_to_unlock_accounts = ':need_to_unlock_accounts';
		this.wallet_account_challenge = ':wallet_account_challenge';
		this.wallet_account = ':wallet_account';
		
		this.init();
	}
	
	init() {
		console.log("XtraConfig initializing");
		
		// replace if necessary values of Config
		this.overloadConfig();

		// hooks
		this.initHooks();
	}
	
	initHooks() {
		// OBSOLETE: should use module mechanism now
		console.log("XtraConfig initializing hooks");
		
		var global = XtraConfig.getGlobalObject();
		var mvcmodule = global.getModuleObject('mvc');
		var controllers = mvcmodule.getControllersObject();

		//
		// violent javascript overloading when not hooks exists
		//
		
		// overload handleDisplayIdentificationBox
		controllers.handleDisplayIdentificationBox = this.handleDisplayIdentificationBox;
		
	}
	
	overloadConfig() {
		if ( typeof window !== 'undefined' && window && window.Config) {
			
			var overload_gaslimit = (this.defaultgaslimit.substring(1) == 'defaultgaslimit' ? false : true);
			if (overload_gaslimit)
				window.Config.defaultGasLimit =  parseInt(this.defaultgaslimit);
			
			var overload_gasprice = (this.defaultgasprice.substring(1) == 'defaultgasprice' ? false : true);
			if (overload_gasprice)
				window.Config.defaultGasPrice = this.defaultgasprice;

		
			
			var overload_need_to_unlock_accounts = (this.need_to_unlock_accounts.substring(1) == 'need_to_unlock_accounts' ? false : true);
			if (overload_need_to_unlock_accounts)
				window.Config.need_to_unlock_accounts = this.need_to_unlock_accounts;
		
			var overload_wallet_account_challenge = (this.wallet_account_challenge.substring(1) == 'wallet_account_challenge' ? false : true);
			if (overload_wallet_account_challenge)
				window.Config.wallet_account_challenge = this.wallet_account_challenge;
		
			var overload_wallet_account = (this.wallet_account.substring(1) == 'wallet_account' ? false : true);
			if (overload_wallet_account)
				window.Config.wallet_account = this.wallet_account;
		
		
		
		}
	}
	
	handleDisplayIdentificationBox() {
		console.log("XtraConfig.handleDisplayIdentificationBox called");

		// watch-out, 'this' is defined as the context
		// of the calling object from event listener
		var global = XtraConfig.getGlobalObject();
		
		var app = global.getAppObject();
		
		var commonmodule = global.getModuleObject('common');
		var session = commonmodule.getSessionObject();

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
					
					if (privatekey) {
						var sessionaccount = global.createBlankAccountObject();
						
						sessionaccount.setPrivateKey(privatekey);
						
						session.impersonateAccount(sessionaccount);
						
						app.refreshDisplay();
					}
					else {
						prompt("Could not retrieve private key!");
					
					}
					
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

GlobalClass.getGlobalObject().registerModuleObject(new XtraConfigModule());

/*if ( typeof window !== 'undefined' && window ) // if we are in browser and not node js (e.g. truffle)
{
	window.Config.XtraConfig = XtraConfig;
	
	// register xtraconfig module
	var global = GlobalClass.getGlobalObject();
	
	global.registerModuleObject(new XtraConfigModule());
}*/
