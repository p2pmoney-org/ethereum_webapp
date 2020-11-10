/**
 * 
 */
'use strict';


class Service {
	
	constructor() {
		this.name = 'ethnode';
		this.global = null;
		
		this.EthereumNode = require('./model/ethnode.js');
		
		this.contracts = null;
		
		this.web3_provider_url = null; // default
		this.web3_provider_port= null;
		
		this.web3_providers = null;

	}
	
	loadService() {
		var global = this.global;
		
		global.log('loadService called for service ' + this.name);
		
		this.contracts = global.readJson('contracts');
		
		this.web3_providers = global.readJson('web3providers');
		
		var config = global.config;
		this.web3_provider_url = (config && (typeof config["web3_provider_url"] != 'undefined') ? config["web3_provider_url"] : 'http://localhost');
		this.web3_provider_port = (config && (typeof config["web3_provider_port"] != 'undefined') ? config["web3_provider_port"] : '8545');

		this.protected_read = (config && (typeof config["web3_protected_read"] != 'undefined') && (config["web3_protected_read"] == 1)?  true : false);
		this.protected_write = (config && (typeof config["web3_protected_write"] != 'undefined') && (config["web3_protected_write"] == 0)?  false : true);

	}

	// optional  service functions
	registerHooks() {
		console.log('registerHooks called for ' + this.name);
		
		var global = this.global;
		
		global.registerHook('installMysqlTables_hook', this.name, this.installMysqlTables_hook);
		global.registerHook('installWebappConfig_hook', this.name, this.installWebappConfig_hook);

		global.registerHook('copyDappFiles_hook', this.name, this.copyDappFiles_hook);

		global.registerHook('registerRoutes_hook', this.name, this.registerRoutes_hook);

		global.registerHook('config_network_hook', this.name, this.config_network_hook);

		global.registerHook('getUserContent_hook', this.name, this.getUserContent_hook);
		global.registerHook('putUserContent_hook', this.name, this.putUserContent_hook);
	}
	
	//
	// hooks
	//
	installMysqlTables_hook(result, params) {
		var global = this.global;

		global.log('installMysqlTables_hook called for ' + this.name);
		

		var session = params[0];
		var mysqlcon = params[1];
		
		// we create tables
		var tablename;
		var sql;
		
		// open connection
		mysqlcon.open();
		
		// users table
		tablename = mysqlcon.getTableName('ethereum_transactions_logs');
		sql = "CREATE TABLE IF NOT EXISTS ";
	
		sql += tablename;
		sql += ` (  id INT NOT NULL AUTO_INCREMENT,
				  transaction_uuid VARCHAR(36) NOT NULL,
				  transactionHash varchar(68) DEFAULT NULL,
  				  UserId INT NOT NULL,
				  method VARCHAR(64) NOT NULL,
				  action INT NOT NULL,
				  CreationDate DATETIME NOT NULL,
				  log TEXT NULL,
				  PRIMARY KEY (id)
				)`;
		
		// execute query
		var res = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
		

		result.push({service: this.name, handled: true});
		
		return true;
	}

	installWebappConfig_hook(result, params) {
		var global = this.global;

		global.log('installWebappConfig_hook called for ' + this.name);
		

		var session = params[0];
		var config = params[1];
		
		config.defaultgaslimit="4850000";
		config.defaultgasprice="10000000000";

		config.need_to_unlock_accounts=1, 
		config.wallet_account_challenge=1, 
		config.wallet_account="";
		
		result.push({service: this.name, handled: true});
		
		return true;
	}
	
	registerRoutes_hook(result, params) {
		var global = this.global;

		global.log('registerRoutes_hook called for ' + this.name);
		
		var app = params[0];
		var global = params[1];
		
		//
		// EthNode routes
		//
		var EthNodeRoutes = require( './routes/routes.js');
			
		var ethnoderoutes = new EthNodeRoutes(app, global);
		
		ethnoderoutes.registerRoutes();
		
		result.push({service: this.name, handled: true});
	}
	
	config_network_hook(result, params) {
		var global = this.global;

		global.log('config_network_hook called for ' + this.name);
		
		// compute config
		var rest_server_url = global.getConfigValue('rest_server_url');
		var rest_server_api_path = global.getConfigValue('rest_server_api_path');

		var ethnode_server_url = global.getConfigValue('ethnode_server_url');
		var ethnode_server_api_path = global.getConfigValue('ethnode_server_api_path');
		
		if (!ethnode_server_url) {
			ethnode_server_url = rest_server_url;
		}

		if (!ethnode_server_api_path) {
			ethnode_server_api_path = rest_server_api_path;
		}
		
		var web3_provider_url = global.getConfigValue('web3_provider_url');
		var web3_provider_port = global.getConfigValue('web3_provider_port');
		var web3_provider_full_url = this.buildWeb3ProviderUrl(web3_provider_url, web3_provider_port);


		
		// fill ethnode
		var network_config = params[0];
		
		network_config.ethnodeserver = {};
		
		network_config.ethnodeserver.activate = true;
		network_config.ethnodeserver.rest_server_url = ethnode_server_url;
		network_config.ethnodeserver.rest_server_api_path = ethnode_server_api_path;
		
		// we specify the default web3 provider url for this network
		// be it a direct access by the client or a middle-tier access via this server
		network_config.ethnodeserver.web3_provider_url = web3_provider_full_url;
		
		
		result.push({service: this.name, handled: true});
	}

	
	copyDappFiles_hook(result, params) {
		var global = this.global;
		var path = require('path');
		
		var webapp_service = params[0];
		
		global.log('copyDappFiles_hook called for ' + this.name);
		
		if (webapp_service.overload_dapp_files != 1) {
			// we add config values to let client know what
			// are the overloaded values for web3
			
			var dapp_dir = webapp_service.getServedDappDirectory();
			var config = global.config;
		
			var configlines;
			
			
			var web3_provider_full_url = this.getWeb3ProviderFullUrl();
			
			if (web3_provider_full_url) {
				configlines = '\nwindow.simplestore.Config.push(\'web3_provider_full_url\', \'' + web3_provider_full_url + '\');\n';
				global.append_to_file(path.join(dapp_dir, './app/js/src/config.js'), configlines);
			}
			
			var defaultgaslimit = (config && (typeof config["defaultgaslimit"] != 'undefined') ? config["defaultgaslimit"] : null);
			var defaultgasprice = (config && (typeof config["defaultgasprice"] != 'undefined') ? config["defaultgasprice"] : null);

			if (defaultgaslimit) {
				configlines = '\nwindow.simplestore.Config.push(\'defaultgaslimit\', \'' + defaultgaslimit + '\');\n';
				global.append_to_file(path.join(dapp_dir, './app/js/src/config.js'), configlines);
			}
			
			if (defaultgasprice) {
				configlines = '\nwindow.simplestore.Config.push(\'defaultgasprice\', \'' + defaultgasprice + '\');\n';
				global.append_to_file(path.join(dapp_dir, './app/js/src/config.js'), configlines);
			}
			
			
			var need_to_unlock_accounts = (config && (typeof config["need_to_unlock_accounts"] != 'undefined') ? config["need_to_unlock_accounts"] : null);
			var wallet_account_challenge = (config && (typeof config["wallet_account_challenge"] != 'undefined') ? config["wallet_account_challenge"] : null);
			var wallet_account = (config && (typeof config["wallet_account"] != 'undefined') ? config["wallet_account"] : null);
			
			if (need_to_unlock_accounts) {
				configlines = '\nwindow.simplestore.Config.push(\'need_to_unlock_accounts\', \'' + need_to_unlock_accounts + '\');\n';
				global.append_to_file(path.join(dapp_dir, './app/js/src/config.js'), configlines);
			}
			
			if (wallet_account_challenge) {
				configlines = '\nwindow.simplestore.Config.push(\'wallet_account_challenge\', \'' + wallet_account_challenge + '\');\n';
				global.append_to_file(path.join(dapp_dir, './app/js/src/config.js'), configlines);
			}
			
			if (wallet_account) {
				configlines = '\nwindow.simplestore.Config.push(\'wallet_account\', \'' + wallet_account + '\');\n';
				global.append_to_file(path.join(dapp_dir, './app/js/src/config.js'), configlines);
			}
			
		}

		
		result.push({service: this.name, handled: true});
	}

	_hasBuiltInContracts() {
		if (!this.contracts)
			return false;
		
		if (this.contracts.length == 0)
			return false;
		
		return true;
	}
	
	getUserContent_hook(result, params) {
		var global = this.global;

		global.log('getUserContent_hook called for ' + this.name);
		
		var user = params[0];
		var key = params[1];
		
		if ((key == 'common-contracts') && (this._hasBuiltInContracts())) {
			var usercontent = (result.content ? result.content : params[2]); // for chaining
			
			// add built-in contracts at the beginning
			try {
				var jsonarray = (usercontent && (usercontent != '{}') ? JSON.parse(usercontent) : []);
				
				if (jsonarray.constructor !== Array)
					jsonarray = [];
				
				var contracts = this.contracts;
				
				for (var i = 0; i < contracts.length; i++) {
					jsonarray.unshift(contracts[i]);
				}
				
				if (jsonarray.length)
				result.content = JSON.stringify(jsonarray);
			}
			catch(e) {
			}
			
			result.push({service: this.name, handled: true});
			
			return true;
		}
		
	}
	
	_getBuiltInContractMap() {
		if (this.contractuuidmap)
			return this.contractuuidmap;
		
		this.contractuuidmap = Object.create(null);
		
		var contracts = this.contracts;
		
		for (var i = 0; i < contracts.length; i++) {
			var contract = contracts[i];
			var contractuuid = contract.uuid;
			this.contractuuidmap[contractuuid] = contract;
		}
		
		return this.contractuuidmap;
	}
	
	_atomizeUserContentSync(user, key, usercontentarray) {
		var global = this.global;

		var result;
		var finished = false;
		
		this._atomizeUserContentAsync(user, key, usercontentarray)
		.then((res) => {
			result = res;
			finished = true;
		})
		.catch(err => {
			result = usercontentarray;
			finished = true;
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce();}

		return result;
	}
	
	async _atomizeUserContentAsync(user, key, usercontentarray) {
		var global = this.global;
		var storageservice = global.getServiceInstance('storage');
		var storageserverinstance = storageservice.getStorageServerInstance();
		
		var array;
		var arr_remove = (arr1, arr2) => {
			// we remove from arr1 elements in arr2
			var arr = [];
			var map = {};
			
			for (var i = 0; i < arr2.length; i++) {
				var uuid = arr2[i].uuid;
				map[uuid] = arr2[i];
			}
			
			for (var i = 0; i < arr1.length; i++) {
				var uuid = arr1[i].uuid;
				if (!map[uuid])
					arr.push(arr1[i]);
			}
			
			return arr;
		};


		var useruuid = user.getUserUUID();
		var keystring = key.toString();
		
		var sqlarray = await storageserverinstance.persistor.getUserKeyContentAsync(useruuid, keystring);
		var persistedusercontentstring = (sqlarray && sqlarray['content'] ? sqlarray['content'] : null);
		var persistedusercontentarray = (persistedusercontentstring && (persistedusercontentstring != '{}') ? JSON.parse(persistedusercontentstring) : []);
		//global.log('ELEMENTS IN USER STORAGE: ' + (persistedusercontentarray ? persistedusercontentarray.length : 0));
		//global.log('ELEMENTS IN USER CONTENT ARRAY: ' + (usercontentarray ? usercontentarray.length : 0));
		
		if (usercontentarray.length == persistedusercontentarray.length) {
			//global.log('STORAGE AND USER HAVE SAME LENGTH');
			var difference = arr_remove(persistedusercontentarray, usercontentarray);
			
			if (difference.length == 0) {
				//global.log('STORAGE AND USER ARE IDENTICAL');

				// potential update of storage
				array = usercontentarray;
			}
			else if (usercontentarray.length == 1) {
				//global.log('SIMPLE ADDITION REQUESTED: ' + usercontentarray[0].description);
				
				if (difference.length == persistedusercontentarray.length) {
					// usercontentarray[0] is not in persistedusercontentarray
					// this is a request for a simple addition
					array = (persistedusercontentarray ? persistedusercontentarray : []).concat(usercontentarray);
				}
			}
			else {
				// too different, we do not change storage
				//global.log('TOO DIFFERENT KEEP STORAGE AS IT IS');
				array = persistedusercontentarray;
			}
		}
		else {
			array = persistedusercontentarray;
			
			if (persistedusercontentarray.length < usercontentarray.length) {
				var addition = arr_remove(usercontentarray, persistedusercontentarray);
				
				if (addition.length == 1) {
					array = usercontentarray;
					//global.log('ADDING ONE ELEMENT: ' + addition[0].description);
				}
				else {
					// too different, we do not change storage
					//global.log('TOO DIFFERENT KEEP STORAGE AS IT IS');
				}
			}
			else if (persistedusercontentarray.length > usercontentarray.length) {
				var removal = arr_remove(persistedusercontentarray, usercontentarray);
				
				if (removal.length == 1) {
					array = usercontentarray;
					//global.log('REMOVING ONE ELEMENT: ' + removal[0].description);
				}
				else {
					// too different, we do not change storage
					//global.log('TOO DIFFERENT KEEP STORAGE AS IT IS');
				}
			}
		}
		
		//global.log('RESULT ARRAY IS: ' + (array ? array.length : 0));
		return array;
	}
	
	putUserContent_hook(result, params) {
		var global = this.global;

		global.log('putUserContent_hook called for ' + this.name);
		
		var user = params[0];
		var key = params[1];
		
		if (key == 'common-contracts') {
			var usercontentstring = (result.content ? result.content : params[2]); // for chaining
			var usercontentarray = (usercontentstring && (usercontentstring != '{}') ? JSON.parse(usercontentstring) : []);
			
			if (this._hasBuiltInContracts()) {
				// we remove built-in contracts, based on their uuid
				try {
					var jsonarray = (usercontentstring && (usercontentstring != '{}') ? JSON.parse(usercontentstring) : []);

					if (jsonarray.constructor !== Array)
						jsonarray = [];
					
					var contractmap = this._getBuiltInContractMap() ;
					var newjsonarray = []
					
					for (var i = 0; i < jsonarray.length; i++) {
						var contract = jsonarray[i];
						
						if ((contract.uuid) && (contract.uuid in contractmap)) {
							continue;
						}
						else {
							newjsonarray.push(contract);
						}
					}
					
					if (newjsonarray.length)
						usercontentarray = newjsonarray;
					else 
						usercontentarray = [];
				}
				catch(e) {
				}
			}
			
			// we check modification from existing common contracts in storage
			// and try turn this call into an atomic operation of
			// difference on a single element if arrays are not equivalent
			if (usercontentarray) {
				try {
					usercontentarray = this._atomizeUserContentSync(user, key, usercontentarray);
					var atomizedarray = usercontentarray;
					//global.log('ELEMENTS IN ATOMIZED ARRAY IS: ' + (atomizedarray ? atomizedarray.length : 0));
					//global.log('ATOMIZED ARRAY IS: ' + JSON.stringify(atomizedarray));
				}
				catch(e) {
				}

			}

			
			if (usercontentarray && usercontentarray.length)
				result.content = JSON.stringify(usercontentarray);
			else 
				result.content = '[]';

			
			result.push({service: this.name, handled: true});
			
			return true;
		}
	}
	
	// service functions
	getEthereumNodeInstance(session, web3providerurl) {
		var providerurl;
		var key ;
		
		if (!web3providerurl) {
			// asking for default
			if (session.ethereum_node)
				return session.ethereum_node;
			
			providerurl = this.getWeb3ProviderFullUrl(session);
		}
		else {
			// look if we have already created a web3provider
			var web3provider = this.getWeb3ProviderInstance(session, web3providerurl);
				
			if (web3provider)
				return web3provider.getEthereumNodeInstance();
			
			providerurl = web3providerurl;
		}
		
		var ethereum_node = new this.EthereumNode(session, providerurl);
		
		var global = this.global;
		
		// invoke hooks to let services interact with the new ethereum_node object
		var result = [];
		
		var params = [];
		
		params.push(ethereum_node);

		var ret = global.invokeHooks('createEthereumNodeInstance_hook', result, params);
		
		if (ret && result && result.length) {
			global.log('createEthereumNodeInstance_hook result is ' + JSON.stringify(result));
		}
		
		// create provider
		var web3provider = this.createWeb3ProviderInstance(session, providerurl, ethereum_node);
		
		// and put in map
		this.putWeb3ProviderInstance(session, web3provider);
		
		if (!web3providerurl) {
			// put in default
			session.ethereum_node = ethereum_node;
		}
		
		
		return ethereum_node;
	}
	
	// web providers
	_findBuiltInWeb3Provider(url) {
		if (!this.web3_providers)
			return;
		
		var web3providers = this.web3_providers;
		
		for (var i = 0; i < web3providers.length; i++) {
			var web3provider = web3providers[i];
			var web3providerurl = web3provider.url;
			
			if (web3providerurl == url)
			return web3provider;
		}
	}
	

	getWeb3ProviderInstance(session, providerurl) {
		var key = providerurl.toLowerCase();

		// map of providers
		var session_web3_provider_map = (session.web3_provider_map ? session.web3_provider_map : session.web3_provider_map = Object.create(null));

		return session_web3_provider_map[key];
	}
	
	putWeb3ProviderInstance(session, web3provider) {
		var providerurl = web3provider.getWeb3ProviderUrl();
		var key = providerurl.toLowerCase();

		// map of providers
		var session_web3_provider_map = (session.web3_provider_map ? session.web3_provider_map : session.web3_provider_map = Object.create(null));

		session_web3_provider_map[key] = web3provider;
	}

	
	createWeb3ProviderInstance(session, providerurl, ethereum_node) {
		var global = this.global;
		
		// create instance
		var Web3Provider = require('./model/web3provider.js');
		var web3provider = new Web3Provider(session, providerurl, ethereum_node);
		
		// invoke hooks to let services interact with the new web3provider object
		var result = [];
		
		var params = [];
		
		params.push(web3provider);

		var ret = global.invokeHooks('createWeb3ProviderInstance_hook', result, params);
		
		// look if we have authentication info
		var web3_provider_config = this._findBuiltInWeb3Provider(providerurl);
		
		if (web3_provider_config) {
			web3provider.setConfig(web3_provider_config);
			
			var web3_provider_auth_basic_user = web3_provider_config.auth_basic_user;
			var web3_provider_auth_basic_password = web3_provider_config.auth_basic_password;
			
			if ((web3_provider_auth_basic_user != null) && (web3_provider_auth_basic_password != null)) {
				var auth_basic = {username: web3_provider_auth_basic_user, password: web3_provider_auth_basic_password};
				
				web3provider.setVariable('auth_basic', auth_basic);
			}
		}

		
		// put in map
		this.putWeb3ProviderInstance(session, web3provider);
		
		return web3provider;
	}
	
	buildWeb3ProviderUrl(web3_provider_url, web3_provider_port) {
		if ((web3_provider_port) && (web3_provider_port !== "") && (web3_provider_port !== "80") && (web3_provider_port !== 80))
			return web3_provider_url + ':' + web3_provider_port;
		else
			return web3_provider_url;
	}
	
	getWeb3ProviderFullUrl(session) {
		if (!session)
		return this.buildWeb3ProviderUrl(this.web3_provider_url, this.web3_provider_port);
		else {
			var session_web3_provider_full_url = session.getSessionVariable('web3_provider_full_url');
			
			if (session_web3_provider_full_url)
				return session_web3_provider_full_url;
			else
				return this.buildWeb3ProviderUrl(this.web3_provider_url, this.web3_provider_port);
		}
	}
	
	setWeb3ProviderFullUrl(session, url) {
		if (!session)
			return;
		
		session.setSessionVariable('web3_provider_full_url', url);
		
		// check if ethereum_node_instance needs to be reset
		if (session.ethereum_node)
			session.ethereum_node = null;
	}

	// rigths
	canRead(session) {
		if (this.protected_read != true)
			return true;
		else
			return session.isAuthenticated();
	}
	
	canWrite(session) {
		if (this.protected_write === false)
			return true;
		else
			return session.isAuthenticated();
	}
	
	// faucet
	topUpAccountSync(session, web3providerurl, address) {
		var global = this.global;
		
		var FLOOR_RATIO = 0.2;
		
		var _web3providerurl = (web3providerurl ? web3providerurl : this.getWeb3ProviderFullUrl(session));
		var _ethereumnodeinstance = this.getEthereumNodeInstance(session, _web3providerurl);
		var _web3providerinstance = this.getWeb3ProviderInstance(session, _web3providerurl);
		
		var config = _web3providerinstance.getConfig();
		
		if (!config.faucet_account)
			return null;
		
		if (!config.faucet_privatekey)
			return null;
		
		var top = (config.top_balance ? parseInt(config.top_balance) : 0);
		var web3balance = _ethereumnodeinstance.web3_getAccountBalance(address);
		var balance = parseInt(web3balance);
		
		// TODO: refill does not control for multiple simultaneous request
		// would need a mutex to prevent going over the top
		var topinfo = {balance: balance, top: top};
		
		var gauge = balance / top;
		
		if (gauge < FLOOR_RATIO) {
			// refill when we drop below FLOOR_RATIO (e.g 20%) of the top
			var refill = top - balance;
			
			var web3faucet_balance = _ethereumnodeinstance.web3_getAccountBalance(config.faucet_account);
			var faucet_balance = parseInt(web3faucet_balance);
			
			topinfo.refill = refill;
			
			if (faucet_balance > refill) {
				var ethtransaction = _ethereumnodeinstance.createEthereumTransactionInstance();
				
				ethtransaction.setFromAddress(config.faucet_account);
				ethtransaction.setFromPrivateKey(config.faucet_privatekey);
				
				ethtransaction.setToAddress(address);
				
				ethtransaction.setValue(refill);
				
				var gasLimit = global.getConfigValue('defaultgaslimit');
				var gasPrice = global.getConfigValue('defaultgasprice');
				
				ethtransaction.setGas(gasLimit);
				ethtransaction.setGasPrice(gasPrice);
				
				var signed = _ethereumnodeinstance.signEthereumTransaction(ethtransaction);
				
				if (signed) {
					_ethereumnodeinstance.web3_sendRawTransaction(ethtransaction);
					
					topinfo.sent = true;
				}
			}
			else {
				global.log('WARNING: faucet account has not longer enough funds to top-up accounts!!!');
				
				topinfo.error = 'faucet account has not longer enough funds to top-up accounts!!!';
			}
		}
		else {
			topinfo.error = 'account has still funds higher than ' + Math.floor(FLOOR_RATIO*100) + '% of top-up balance!'
		}
		
		return topinfo;
	}
	
	async topUpAccountAsync(session, web3providerurl, address) {
		var global = this.global;
		
		var FLOOR_RATIO = 0.2;
		
		var _web3providerurl = (web3providerurl ? web3providerurl : this.getWeb3ProviderFullUrl(session));
		var _ethereumnodeinstance = this.getEthereumNodeInstance(session, _web3providerurl);
		var _web3providerinstance = this.getWeb3ProviderInstance(session, _web3providerurl);
		
		var config = _web3providerinstance.getConfig();
		
		if (!config.faucet_account)
			return null;
		
		if (!config.faucet_privatekey)
			return null;
		
		var top = (config.top_balance ? parseInt(config.top_balance) : 0);
		var web3balance = await _ethereumnodeinstance.web3_getAccountBalanceAsync(address);
		var balance = parseInt(web3balance);
		
		// TODO: refill does not control for multiple simultaneous request
		// would need a mutex to prevent going over the top
		var topinfo = {balance: balance, top: top};
		
		var gauge = balance / top;
		
		if (gauge < FLOOR_RATIO) {
			// refill when we drop below FLOOR_RATIO (e.g 20%) of the top
			var refill = top - balance;
			
			var web3faucet_balance = await _ethereumnodeinstance.web3_getAccountBalanceAsync(config.faucet_account);
			var faucet_balance = parseInt(web3faucet_balance);
			
			topinfo.refill = refill;
			
			if (faucet_balance > refill) {
				var ethtransaction = _ethereumnodeinstance.createEthereumTransactionInstance();
				
				ethtransaction.setFromAddress(config.faucet_account);
				ethtransaction.setFromPrivateKey(config.faucet_privatekey);
				
				ethtransaction.setToAddress(address);
				
				ethtransaction.setValue(refill);
				
				var gasLimit = global.getConfigValue('defaultgaslimit');
				var gasPrice = global.getConfigValue('defaultgasprice');
				
				ethtransaction.setGas(gasLimit);
				ethtransaction.setGasPrice(gasPrice);
				
				var signed = await _ethereumnodeinstance.signEthereumTransactionAsync(ethtransaction);
				
				if (signed) {
					await _ethereumnodeinstance.web3_sendRawTransactionAsync(ethtransaction);
					
					topinfo.sent = true;
				}
			}
			else {
				global.log('WARNING: faucet account has not longer enough funds to top-up accounts!!!');
				
				topinfo.error = 'faucet account has not longer enough funds to top-up accounts!!!';
			}
		}
		else {
			topinfo.error = 'account has still funds higher than ' + Math.floor(FLOOR_RATIO*100) + '% of top-up balance!'
		}
		
		return topinfo;
	}


}

module.exports = Service;