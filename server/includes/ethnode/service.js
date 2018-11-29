/**
 * 
 */
'use strict';


class Service {
	
	constructor() {
		this.name = 'ethnode';
		this.global = null;
		
		this.contracts = {};
	}
	
	loadService() {
		var global = this.global;
		
		global.log('loadService called for service ' + this.name);
		
		this.EthereumNode = require('./model/ethnode.js');
		
		this.contracts = global.readJson('contracts');
	}

	// optional  service functions
	registerHooks() {
		console.log('registerHooks called for ' + this.name);
		
		var global = this.global;
		
		global.registerHook('installMysqlTables_hook', this.name, this.installMysqlTables_hook);
		global.registerHook('installWebappConfig_hook', this.name, this.installWebappConfig_hook);

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
				  ethereum_transaction_uuid VARCHAR(36) NOT NULL,
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
		
		config.defaultgaslimit="8850000";
		config.defaultgasprice="20000000000";

		config.need_to_unlock_accounts=1, 
		config.wallet_account_challenge=1, 
		config.wallet_account="";
		
		result.push({service: this.name, handled: true});
		
		return true;
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
				var jsonarray = (usercontent ? JSON.parse(usercontent) : []);
				
				var contracts = this.contracts;
				
				for (var i = 0; i < contracts.length; i++) {
					jsonarray.unshift(contracts[i]);
				}
				
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
				var jsonarray = (usercontent ? JSON.parse(usercontent) : []);
				
				var contractmap = this._getBuiltInContractMap() ;
				
				for (var i = 0; i < jsonarray.length; i++) {
					var contract = jsonarray[i];
					
					if ((contract.uuid) && (contract.uuid in contractmap)) {
						jsonarray.splice(i,1);
					}
				}
				
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
		
		return session.ethereum_node;
	}

}

module.exports = Service;