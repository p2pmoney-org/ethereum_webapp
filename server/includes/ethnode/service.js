/**
 * 
 */
'use strict';


class Service {
	
	constructor() {
		this.name = 'ethnode';
		this.global = null;
	}
	
	loadService() {
		this.global.log('loadService called for service ' + this.name);
		
		this.EthereumNode = require('./model/ethnode.js');
	}

	// optional  service functions
	registerHooks() {
		console.log('registerHooks called for ' + this.name);
		
		var global = this.global;
		
		global.registerHook('installMysqlTables_hook', this.name, this.installMysqlTables_hook);
		global.registerHook('installWebappConfig_hook', this.name, this.installWebappConfig_hook);
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