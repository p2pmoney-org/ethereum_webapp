/**
 * 
 */
'use strict';

var storageservice;


class Service {
	
	constructor() {
		this.name = 'storage';
		this.global = null;
		
		this.storageserverinstance = null;
	}
	
	loadService() {
		this.global.log('loadService called for service ' + this.name);
		
		var global = this.global;
		
		this.users = global.readJson("users");

		// authentication context
		var authkey_server_passthrough = global.getConfigValue('authkey_server_passthrough');
		this.authkey_server_passthrough = (authkey_server_passthrough == 1 ? true : false);
	}

	// optional  service functions
	registerHooks() {
		console.log('registerHooks called for ' + this.name);
		
		var global = this.global;
		
		global.registerHook('installMysqlTables_hook', this.name, this.installMysqlTables_hook);
		
		global.registerHook('registerRoutes_hook', this.name, this.registerRoutes_hook);

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
		
		
		// storage_users table
		tablename = mysqlcon.getTableName('storage_users');
		sql = "CREATE TABLE IF NOT EXISTS ";
	
		sql += tablename;
		sql += ` ( UserUUID varchar(36) NOT NULL,
				  \`Key\` varchar(256) NOT NULL,
				  Content text
				)`;
		
		// execute query
		var res = mysqlcon.execute(sql);
		
		
		// close connection
		mysqlcon.close();
		

		result.push({service: this.name, handled: true});
		
		return true;
	}
	

	registerRoutes_hook(result, params) {
		var global = this.global;

		global.log('registerRoutes_hook called for ' + this.name);
		
		var app = params[0];
		var global = params[1];
		
		//
		// Storage routes
		//
		var StorageRoutes = require( './routes/routes.js');
			
		var storageroutes = new StorageRoutes(app, global);
		
		storageroutes.registerRoutes();
		
		result.push({service: this.name, handled: true});
	}

	// API
	
	// objects
	getStorageServerInstance() {
		if (this.storageserverinstance)
			return this.storageserverinstance;
			
		var StorageServer = require('./model/storage-server.js');
		
		this.storageserverinstance = new StorageServer(this);
		
		return this.storageserverinstance;
	}
	
	
	// static
	static getService() {
		if (storageservice)
			return storageservice;
		
		throw 'StorageService has not been instantiated';
	}
		
	static instantiateService(global) {
		if (storageservice)
			throw 'StorageService has already been instantiated';
		
		storageservice = new Service();
		
		return storageservice;
	}
	
	
}

module.exports = Service;