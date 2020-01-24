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
		this.web3_provider_port= (config && (typeof config["web3_provider_port"] != 'undefined') ? config["web3_provider_port"] : '8545');
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
		
		network_config.ethnode = {};
		
		network_config.ethnode.activate = true;
		network_config.ethnode.rest_server_url = ethnode_server_url;
		network_config.ethnode.rest_server_api_path = ethnode_server_api_path;
		
		if (!network_config.ethnode.activate)
		network_config.ethnode.web3_provider_url = web3_provider_full_url;
		
		
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
	
	putUserContent_hook(result, params) {
		var global = this.global;

		global.log('putUserContent_hook called for ' + this.name);
		
		var user = params[0];
		var key = params[1];
		
		if ((key == 'common-contracts') && (this._hasBuiltInContracts())) {
			var usercontent = (result.content ? result.content : params[2]); // for chaining
			
			// we remove built-in contracts, based on their uuid
			try {
				var jsonarray = (usercontent && (usercontent != '{}') ? JSON.parse(usercontent) : []);

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
					result.content = JSON.stringify(newjsonarray);
				else 
					result.content = '[]';
			}
			catch(e) {
			}
			
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

}

module.exports = Service;