/**
 * 
 */
'use strict';


class Service {
	
	constructor() {
		this.name = 'ethnode';
		this.global = null;
		
		this.EthereumNode = require('./model/ethnode.js');
		
		this.contracts = {};
		
		this.web3_provider_url = null;
		this.web3_provider_port= null;
	}
	
	loadService() {
		var global = this.global;
		
		global.log('loadService called for service ' + this.name);
		
		this.contracts = global.readJson('contracts');
		
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
				configlines = '\nConfig.push(\'web3_provider_full_url\', \'' + web3_provider_full_url + '\');\n';
				global.append_to_file(path.join(dapp_dir, './app/js/src/config.js'), configlines);
			}
			
			var defaultgaslimit = (config && (typeof config["defaultgaslimit"] != 'undefined') ? config["defaultgaslimit"] : null);
			var defaultgasprice = (config && (typeof config["defaultgasprice"] != 'undefined') ? config["defaultgasprice"] : null);

			if (defaultgaslimit) {
				configlines = '\nConfig.push(\'defaultgaslimit\', \'' + defaultgaslimit + '\');\n';
				global.append_to_file(path.join(dapp_dir, './app/js/src/config.js'), configlines);
			}
			
			if (defaultgasprice) {
				configlines = '\nConfig.push(\'defaultgasprice\', \'' + defaultgasprice + '\');\n';
				global.append_to_file(path.join(dapp_dir, './app/js/src/config.js'), configlines);
			}
			
			
			var need_to_unlock_accounts = (config && (typeof config["need_to_unlock_accounts"] != 'undefined') ? config["need_to_unlock_accounts"] : null);
			var wallet_account_challenge = (config && (typeof config["wallet_account_challenge"] != 'undefined') ? config["wallet_account_challenge"] : null);
			var wallet_account = (config && (typeof config["wallet_account"] != 'undefined') ? config["wallet_account"] : null);
			
			if (need_to_unlock_accounts) {
				configlines = '\nConfig.push(\'need_to_unlock_accounts\', \'' + need_to_unlock_accounts + '\');\n';
				global.append_to_file(path.join(dapp_dir, './app/js/src/config.js'), configlines);
			}
			
			if (wallet_account_challenge) {
				configlines = '\nConfig.push(\'wallet_account_challenge\', \'' + wallet_account_challenge + '\');\n';
				global.append_to_file(path.join(dapp_dir, './app/js/src/config.js'), configlines);
			}
			
			if (wallet_account) {
				configlines = '\nConfig.push(\'wallet_account\', \'' + wallet_account + '\');\n';
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
		if (this.uuidmap)
			return this.uuidmap;
		
		this.uuidmap = Object.create(null);
		
		var contracts = this.contracts;
		
		for (var i = 0; i < contracts.length; i++) {
			var contract = contracts[i];
			var contractuuid = contract.uuid;
			this.uuidmap[contractuuid] = contract;
		}
		
		return this.uuidmap;
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
				
				for (var i = 0; i < jsonarray.length; i++) {
					var contract = jsonarray[i];
					
					if ((contract.uuid) && (contract.uuid in contractmap)) {
						jsonarray.splice(i,1);
					}
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
	
	// service functions
	getEthereumNodeInstance(session) {
		if (session.ethereum_node)
			return session.ethereum_node;
		
		session.ethereum_node = new this.EthereumNode(session);
		
		var global = this.global;
		
		// invoke hooks to let services interact with the new ethereum_node object
		var result = [];
		
		var params = [];
		
		params.push(session.ethereum_node);

		var ret = global.invokeHooks('createEthereumNodeInstance_hook', result, params);
		
		if (ret && result && result.length) {
			global.log('createEthereumNodeInstance_hook result is ' + JSON.stringify(result));
		}
		
		return session.ethereum_node;
	}
	
	buildWeb3ProviderUrl(web3_provider_url, web3_provider_port) {
		if ((web3_provider_port) && (web3_provider_port !== "") && (web3_provider_port !== "80") && (web3_provider_port !== 80))
			return web3_provider_url + ':' + web3_provider_port;
		else
			return web3_provider_url;
	}
	
	getWeb3ProviderFullUrl() {
		return this.buildWeb3ProviderUrl(this.web3_provider_url, this.web3_provider_port);
	}
	


}

module.exports = Service;