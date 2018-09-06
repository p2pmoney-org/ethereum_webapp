/**
 * 
 */
'use strict';

var authkeyservice;


class Service {
	
	constructor() {
		this.name = 'authkey';
		this.global = null;
		
		this.authenticationserverinstance = null;
		
		// user database (json file)
		this.users = {};
	}
	
	loadService() {
		this.global.log('loadService called for service ' + this.name);
		
		var global = this.global;
		
		this.users = global.readJson("users");

		
		/*var fs = require('fs');
		var path = require('path');

		var jsonFileName;
		var jsonPath;
		var jsonFile;
		
		try {
			jsonFileName = 'users.json';
			jsonPath = path.join(global.execution_dir, './settings', jsonFileName);
			jsonFile = fs.readFileSync(jsonPath, 'utf8');
			this.users = JSON.parse(jsonFile);
			
		}
		catch(e) {
			global.log('exception reading json file: ' + e.message); 
		}*/
		
	}

	// optional  service functions
	registerHooks() {
		console.log('registerHooks called for ' + this.name);
		
		var global = this.global;
		
		global.registerHook('installMysqlTables_hook', this.name, this.installMysqlTables_hook);
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
		tablename = mysqlcon.getTableName('users');
		sql = "CREATE TABLE IF NOT EXISTS ";
	
		sql += tablename;
		sql += ` (   UserId int(11) NOT NULL AUTO_INCREMENT,
					  UserUUID varchar(36) NOT NULL,
					  UserEmail varchar(100) NOT NULL,
					  Password varchar(64) DEFAULT NULL,
					  Salt varchar(16) NOT NULL,
					  HashMethod int(11) NOT NULL DEFAULT '-1',
					  AltLoginMethod varchar(25) NOT NULL,
					  AccountStatus int(11) NOT NULL,
					  UserName varchar(50) NOT NULL,
					  RegistrationDate datetime NOT NULL,
					  LastModificationOn datetime NOT NULL,
					  DisabledOn datetime DEFAULT NULL,
					  DiscardedOn datetime DEFAULT NULL,
					  LastLoginOn datetime DEFAULT NULL,
					  LastSessionOn datetime DEFAULT NULL,
					  PRIMARY KEY (UserId),
					  UNIQUE KEY UserUUID (UserUUID),
					  UNIQUE KEY UserEmail (UserEmail),
					  KEY UserId (UserId)
				)`;
		
		// execute query
		var res = mysqlcon.execute(sql);
		

		// roles table
		tablename = mysqlcon.getTableName('roles');
		sql = "CREATE TABLE IF NOT EXISTS ";
	
		sql += tablename;
		sql += ` ( RoleId int(11) NOT NULL,
				  RoleValue int(11) NOT NULL,
				  RoleName varchar(50) NOT NULL,
				  PRIMARY KEY (RoleId)
				)`;
		
		// execute query
		var res = mysqlcon.execute(sql);
		
		// insert values
		sql = "INSERT INTO " + tablename + "(`RoleId`, `RoleValue`, `RoleName`) VALUES ('1', '1', 'SuperAdmin')";
		
		// users_roles table
		tablename = mysqlcon.getTableName('users_roles');
		sql = "CREATE TABLE IF NOT EXISTS ";
	
		sql += tablename;
		sql += ` ( UserId int(11) NOT NULL,
					RoleId int(11) NOT NULL
				)`;
		
		// execute query
		var res = mysqlcon.execute(sql);
		
		
		// keys table
		tablename = mysqlcon.getTableName('keys');
		sql = "CREATE TABLE IF NOT EXISTS ";
	
		sql += tablename;
		sql += ` ( KeyId int(11) NOT NULL AUTO_INCREMENT,
				  UserId int(11) DEFAULT NULL,
				  KeyUUID varchar(36) NOT NULL,
				  PrivateKey varchar(68) DEFAULT NULL,
				  PRIMARY KEY (KeyId)
				)`;
		
		// execute query
		var res = mysqlcon.execute(sql);
		
		
		// close connection
		mysqlcon.close();
		

		result.push({service: this.name, handled: true});
		
		return true;
	}


	// API
	getVersion() {
		var global = this.global;
		
		var mysqlcon = global.getMySqlConnection();
		
		var query = 'SHOW TABLES;';
		
		var result = mysqlcon.execute(query);
		
        return JSON.stringify(result.rows);
	}
	
	// objects
	getAuthenticationServerInstance() {
		if (this.authenticationserverinstance)
			return this.authenticationserverinstance;
			
		var AuthenticationServer = require('./model/authentication-server.js');
		
		this.authenticationserverinstance = new AuthenticationServer(this);
		
		return this.authenticationserverinstance;
	}
	
	createPasswordObject(password, salt, pepper, hashmethod) {
		var PasswordObject = require('./model/passwordobject.js');
		
		var passwordobject = new PasswordObject();
		
		switch (hashmethod) {
			case 0:
				passwordobject.setClearPassword(password, salt, pepper, hashmethod);
			break;
			
			default:
				throw 'do not support this hashmethod: ' + hashmethod;
			break;
		
		}
		
		
		return passwordobject;
	}
	
	// static
	static getService() {
		if (authkeyservice)
			return authkeyservice;
		
		throw 'AuthKeyService has not been instantiated';
	}
		
	static instantiateService(global) {
		if (authkeyservice)
			throw 'AuthKeyService has already been instantiated';
		
		authkeyservice = new Service();
		
		return authkeyservice;
	}
	
	
}

module.exports = Service;