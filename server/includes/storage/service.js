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
		
		global.registerHook('installMysqlTables_asynchook', this.name, this.installMysqlTables_asynchook);
		
		global.registerHook('registerRoutes_hook', this.name, this.registerRoutes_hook);

	}
	
	//
	// hooks
	//
	async installMysqlTables_asynchook(result, params) {
		var global = this.global;

		global.log('installMysqlTables_asynchook called for ' + this.name);
		

		var session = params[0];
		var mysqlcon = params[1];
		var install_step = params[2];
		var install_inputs = params[3];

		if (install_inputs && install_inputs[this.name] && install_inputs[this.name].install_step) {
			// run specific
			install_step = install_inputs[this.name].install_step;
		}

		// timestamp of update
		let now = new Date();
		
		let nowstring = global.formatDate(now, 'YYYY-mm-dd HH:MM:SS');
		
		let commonservice = global.getServiceInstance('common');


		switch(install_step) {
			case 'initial_setup': {
				let update_step = 'initial_setup';

				// we create tables
				var tablename;
				var sql;
				
				// open connection
				await mysqlcon.openAsync();
				
				
				// storage_users table
				tablename = mysqlcon.getTableName('storage_users');
				sql = "CREATE TABLE IF NOT EXISTS ";
			
				sql += tablename;
				sql += ` ( UserUUID varchar(36) NOT NULL,
						\`Key\` varchar(256) NOT NULL,
						Content text
						)`;
				
				// execute query
				var res = await mysqlcon.executeAsync(sql);
				
				
				// close connection
				await mysqlcon.closeAsync();

				await commonservice.addGlobalParameterAsync('VersionUpdate_' + this.name, update_step + ';' + nowstring);
			}

			case 'update_0.70.65': {
				let update_step = 'update_0.70.65';

				var tablename;
				var sql;
				
				// open connection
				await mysqlcon.openAsync();


				//
				// Creation of new tables
				//
				
				//
				// Modification of existing tables
				//
				
				// keys
				tablename = mysqlcon.getTableName('storage_users');
				sql = "ALTER TABLE ";
				sql += tablename;
				sql += ` MODIFY UserUUID VARCHAR(128);`;
				
				// execute query
				var res = await mysqlcon.executeAsync(sql);
				
				//
				// Insert new data in existing tables
				//
				


				// close connection
				await mysqlcon.closeAsync();

				await commonservice.addGlobalParameterAsync('VersionUpdate_' + this.name, update_step + ';' + nowstring);
			}

			default: {
				//
				// Version and timestamp of install execution
				//

				let currentversion = global.getCurrentVersion();

				await commonservice.addGlobalParameterAsync('CurrentVersion_' + this.name, currentversion);
			}
			break;
		}

		

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