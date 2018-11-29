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
		this.remoteauthenticationserverinstance = null;
		
		// user database (json file)
		this.users = {};
	}
	
	loadService() {
		this.global.log('loadService called for service ' + this.name);
		
		var global = this.global;
		
		this.users = global.readJson("users");

	}

	// optional  service functions
	registerHooks() {
		console.log('registerHooks called for ' + this.name);
		
		var global = this.global;
		
		global.registerHook('installMysqlTables_hook', this.name, this.installMysqlTables_hook);

		global.registerHook('createSession_hook', this.name, this.createSession_hook);
		global.registerHook('isSessionAnonymous_hook', this.name, this.isSessionAnonymous_hook);
		global.registerHook('isSessionAuthenticated_hook', this.name, this.isSessionAuthenticated_hook);
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
				  UserUUID varchar(36) DEFAULT NULL,
				  Type int(11) NOT NULL,
				  PrivateKey varchar(192) DEFAULT NULL,
				  Address varchar(44) DEFAULT NULL,
				  PublicKey varchar(132) DEFAULT NULL,
				  RsaPublicKey varchar(132) DEFAULT NULL,
				  Description varchar(256) DEFAULT NULL,
				  PRIMARY KEY (KeyId)
				)`;
		
		// execute query
		var res = mysqlcon.execute(sql);
		
		
		// close connection
		mysqlcon.close();
		

		result.push({service: this.name, handled: true});
		
		return true;
	}
	
	createSession_hook(result, params) {
		var global = this.global;
		
		var session = params[0];
		
		if (!session)
			return false;
		
		var sessionuuid = session.getSessionUUID();

		global.log('createSession_hook called for ' + this.name + ' on session ' + sessionuuid);
		
		if (global.config['authkey_server_url']) {
			
			var remoteauthenticationserver = this.getRemoteAuthenticationServerInstance();
			
			var user = remoteauthenticationserver.getUser(session);
			
			if (user) {
				var useruuid = user.getUserUUID();
				
				// check if user exists in our database
				var authenticationserver = this.getAuthenticationServerInstance();
				
				if (!authenticationserver.userExistsFromUUID(useruuid)) {
					global.log('remote user not found in database, inserting user with uuid: ' + useruuid);
					
					// save user
					user.altloginmethod = 'remote-authkey-server';
					
					authenticationserver.saveUser(session, user);
				}
				else {
					global.log('remote user found in database with uuid: ' + useruuid);
				}
				
				// attach user to session
				session.impersonateUser(user);
				
			}

			result.push({service: this.name, handled: true});
		}
		
		
		return true;
	}

	isSessionAnonymous_hook(result, params) {
		var global = this.global;
		
		var session = params[0];
		
		if (!session)
			return false;
		
		var sessionuuid = session.getSessionUUID();

		global.log('isSessionAnonymous_hook called for ' + this.name + ' on session ' + sessionuuid);
		
		if (global.config['authkey_server_url']) {
			
			if (!session[this.name]) session[this.name] = {};
			var sessioncontext = session[this.name];
			
			var now = Date.now();
			
			if (sessioncontext.anonymousupdate && ((now - sessioncontext.anonymousupdate) < 5000)) {
				// update only every 5s
				result.push({service: this.name, handled: true});
				return true;
			}
			
			sessioncontext.anonymousupdate = now;
			
			global.log('checking remote user details');
			var remoteauthenticationserver = this.getRemoteAuthenticationServerInstance();
			
			var user = remoteauthenticationserver.getUser(session);
			
			if (user) {
				var useruuid = user.getUserUUID();
				
				// check if user exists in our session
				if (session.getUserUUID() != useruuid) {
					global.log('remote user not found in session, inserting user with uuid: ' + useruuid);
					
					// impersonate user
					session.impersonateUser(user);
				}
				
			}
			else {
				if (session.isanonymous === false) {
					global.log('remote session became anonymous, set local session accordingly');
					session.disconnectUser();
				}
			}

			result.push({service: this.name, handled: true});
		}
		
		
		return true;
	}

	isSessionAuthenticated_hook(result, params) {
		var global = this.global;
		
		var session = params[0];
		
		if (!session)
			return false;
		
		var sessionuuid = session.getSessionUUID();

		global.log('isSessionAuthenticated_hook called for ' + this.name + ' on session ' + sessionuuid);
		
		if (global.config['authkey_server_url']) {
			
			if (!session[this.name]) session[this.name] = {};
			var sessioncontext = session[this.name];
			
			var now = Date.now();
			
			if (sessioncontext.authenticatedupdate && ((now - sessioncontext.authenticatedupdate) < 5000)) {
				// update only every 5s
				result.push({service: this.name, handled: true});
				return true;
			}
			
			sessioncontext.authenticatedupdate = now;
			
			global.log('checking remote session details');
			var remoteauthenticationserver = this.getRemoteAuthenticationServerInstance();
			
			var sessionstatus = remoteauthenticationserver.getSessionStatus(session);
			
			if (sessionstatus) {
				var isauthenticated = sessionstatus['isauthenticated'];
				
				// check if authentication flags match
				if (session.isauthenticated != isauthenticated) {
					global.log('remote user authentication different from session, remote is: ' + isauthenticated);
					
					// set session flag
					session.isauthenticated = isauthenticated;
				}
				
			}
			else {
				global.log('remote session not found ' + sessionuuid);
				
				if (session.isanonymous === false) {
					global.log('remote session does not exist and local session thinks is is not anonymous');
					session.disconnectUser();
				}
			}

			result.push({service: this.name, handled: true});
		}
		
		
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
	
	getRemoteAuthenticationServerInstance() {
		if (this.remoteauthenticationserverinstance)
			return this.remoteauthenticationserverinstance;
			
		var RemoteAuthenticationServer = require('./model/remote-authentication-server.js');
		
		this.remoteauthenticationserverinstance = new RemoteAuthenticationServer(this);
		
		return this.remoteauthenticationserverinstance;
	}
	
	createPasswordObjectInstance(password, salt, pepper, hashmethod) {
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
	
	createBlankCryptoKeyInstance() {
		var CryptoKey = require('./model/cryptokey.js');
		
		var cryptokey = new CryptoKey();
		
		return cryptokey;
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