/**
 * 
 */
'use strict';


class Service {
	
	constructor() {
		this.name = 'common';
		this.global = null; // filled on registration
		
		this.serverinstance = null;
	}
	
	loadService() {
		this.global.log('loadService called for service ' + this.name);

		this.Session = require('./model/session.js');
	}
	
	// optional  service functions
	registerHooks() {
		console.log('registerHooks called for ' + this.name);
		
		var global = this.global;
		
		global.registerHook('installMysqlTables_asynchook', this.name, this.installMysqlTables_asynchook);
	}
	
	//
	// hooks
	//
	async installMysqlTables_asynchook(result, params) {
		var global = this.global;

		global.log('installMysqlTables_asynchook called for ' + this.name);
		

		var session = params[0];
		var mysqlcon = params[1];
		
		// open connection
		await mysqlcon.openAsync();
		
		// we create tables
		var tablename;
		var sql;
		
		// globalparameters table
		tablename = mysqlcon.getTableName('globalparameters');
		sql = "CREATE TABLE IF NOT EXISTS ";
	
		sql += tablename;
		sql += ` ( \`Key\` varchar(25) NOT NULL,
				  Type int(11) NOT NULL,
				  Value varchar(250) NOT NULL
				)`;
		
		// execute query
		var res = await mysqlcon.executeAsync(sql);
		
		// sessions tables
		tablename = mysqlcon.getTableName('sessions');
		sql = "CREATE TABLE IF NOT EXISTS ";
	
		sql += tablename;
		sql += ` ( SessionId int(11) NOT NULL AUTO_INCREMENT,
				  SessionUUID varchar(36) NOT NULL,
				  UserId int(11) NOT NULL,
				  CreatedOn datetime NOT NULL,
				  LastPingOn datetime NOT NULL,
				  IsAuthenticated int(11) NOT NULL,
				  SessionVariables longblob COMMENT 'Serialized content of Session variables array',
				  PRIMARY KEY (SessionId),
				  UNIQUE KEY SessionUUID (SessionUUID)
				)`;
		
		// execute query
		var res = await mysqlcon.executeAsync(sql);
		
		
		// close connection
		await mysqlcon.closeAsync();
		

		result.push({module: this.name, handled: true});
		
		return true;
	}

	getServerInstance() {
		if (this.serverinstance)
			return this.serverinstance;
			
		var Server = require('./model/server.js');
		
		this.serverinstance = new Server(this);
		
		return this.serverinstance;
	}
	
	// object
	createBlankUserInstance() {
		var User = require('./model/user.js');
		
		return User.createBlankUserInstance();
	}
	
	createRoleInstance(rolevalue, rolename) {
		var Role = require('./model/role.js');
		
		return Role.createRoleInstance(rolevalue, rolename);
		
	}
	
	// persistence
	getGlobalParameters(key) {
		var server = this.getServerInstance();
		
		return server.getGlobalParameters(key);
	}
	
	async getGlobalParametersAsync(key) {
		var server = this.getServerInstance();
		
		return server.getGlobalParametersAsync(key);
	}
	
	saveGlobalParameter(key, value) {
		var server = this.getServerInstance();
		
		server.saveGlobalParameter(key, value);
	}
	
	async saveGlobalParameterAsync(key, value) {
		var server = this.getServerInstance();
		
		await server.saveGlobalParameterAsync(key, value);
	}
	
	addGlobalParameter(key, value) {
		var server = this.getServerInstance();
		
		server.addGlobalParameter(key, value);
	}

	async addGlobalParameterAsync(key, value) {
		var server = this.getServerInstance();
		
		await server.addGlobalParameterAsync(key, value);
	}

}

module.exports = Service;