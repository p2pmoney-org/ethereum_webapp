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
		//this.users = {};
	}
	
	loadService() {
		this.global.log('loadService called for service ' + this.name);
		
		var global = this.global;
		
		//this.users = global.readJson("users");

		// default remote authentication
		this.authkey_server_url = global.getConfigValue('authkey_server_url');
		this.authkey_server_api_path = global.getConfigValue('authkey_server_api_path');

		var auth_check_frequency = global.getConfigValue('auth_check_frequency');
		this.auth_check_frequency = (auth_check_frequency ? parseInt(auth_check_frequency) : 5000);

		var authkey_server_passthrough = global.getConfigValue('authkey_server_passthrough');
		this.authkey_server_passthrough = (authkey_server_passthrough == 1 ? true : false);
	}

	// optional  service functions
	registerHooks() {
		console.log('registerHooks called for ' + this.name);
		
		var global = this.global;
		
		global.registerHook('installMysqlTables_hook', this.name, this.installMysqlTables_hook);

		global.registerHook('copyDappFiles_hook', this.name, this.copyDappFiles_hook);
		global.registerHook('overloadDappFiles_hook', this.name, this.overloadDappFiles_hook);

		global.registerHook('registerRoutes_hook', this.name, this.registerRoutes_hook);

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
	
	copyDappFiles_hook(result, params) {
		var global = this.global;

		global.log('copyDappFiles_hook called for ' + this.name);

		var webapp_service = params[0];
		
		var fs = require('fs');
		var path = require('path');
		
		var service_base_dir = __dirname;
		var dapp_dir = webapp_service.getServedDappDirectory();
		

		// add authkey_version to ./app/js/src/constants.js
		var ethereum_webapp_version = global.getCurrentVersion();
		var copyversionlines = '\nwindow.simplestore.Constants.push(\'authkey_version\', {value: \'' + ethereum_webapp_version + '\'});\n';
		
		global.append_to_file(path.join(dapp_dir, './app/js/src/constants.js'), copyversionlines);

		
		// files
		var sourcepath;
		var destdir;

		// copy interfaces
		var sourcedir = service_base_dir + '/client/includes/interface';
		
		if (global._checkFileExist(fs, sourcedir)) {
			destdir = path.join(dapp_dir, './app/includes/interface');
			
			global.copydirectory(sourcedir, destdir);
		}
		
		// copy modules in /app/js/src/xtra/modules
		var sourcedir = service_base_dir + '/client/includes/modules';
		
		if (global._checkFileExist(fs, sourcedir)) {
			destdir = path.join(dapp_dir, './app/includes/modules');
			
			global.copydirectory(sourcedir, destdir);
		}
		
		// add load of client modules to config.js
		
		// authkey client module
		var modulename = 'authkey';
		var modulepath = './includes/modules/authkey/module.js';
		
		var copymodulelines = '\nwindow.simplestore.Config.push(\'xtramoduleload\', {name: \'' + modulename + '\', path:\'' + modulepath + '\'});\n';
		
		global.append_to_file(path.join(dapp_dir, './app/js/src/config.js'), copymodulelines);
		
		// we add constants to provide authkey_url and authkey_server_api_path
		// to authkey client module
		var authkey_server_url = global.getConfigValue('authkey_server_url');
		var authkey_server_api_path = global.getConfigValue('authkey_server_api_path');
		
		var auth_server_url = global.getConfigValue('auth_server_url');
		var auth_server_api_path = global.getConfigValue('auth_server_api_path');
		
		var key_server_url = global.getConfigValue('key_server_url');
		var key_server_api_path = global.getConfigValue('key_server_api_path');
		
		if (!authkey_server_url) {
			// if neither auth or key defined, turn to default
			if ((!auth_server_url) && (!key_server_url))
			authkey_server_url =  global.getConfigValue('rest_server_url');
		}
		
		if (!authkey_server_api_path) {
			if ((!auth_server_api_path) && (!key_server_api_path))
			authkey_server_api_path = global.getConfigValue('rest_server_api_path');
		}
		
		var configlines;
		
		// put authkey
		if (authkey_server_url) {
			configlines = '\nwindow.simplestore.Config.push(\'authkey_server_url\', \'' + authkey_server_url + '\');\n';
			global.append_to_file(path.join(dapp_dir, './app/js/src/config.js'), configlines);
		}
		
		// then put url for auth and/or key that have been specified (if any)
		if (auth_server_url) {
			configlines = '\nwindow.simplestore.Config.push(\'auth_server_url\', \'' + auth_server_url + '\');\n';
			global.append_to_file(path.join(dapp_dir, './app/js/src/config.js'), configlines);
		}
		
		if (key_server_url) {
			configlines = '\nwindow.simplestore.Config.push(\'key_server_url\', \'' + key_server_url + '\');\n';
			global.append_to_file(path.join(dapp_dir, './app/js/src/config.js'), configlines);
		}
		
		if (authkey_server_api_path) {
			configlines = '\nwindow.simplestore.Config.push(\'authkey_server_api_path\', \'' + authkey_server_api_path + '\');\n';
			global.append_to_file(path.join(dapp_dir, './app/js/src/config.js'), configlines);
		}
		
		// then put api_path for auth and/or key that have been specified (if any)
		if (auth_server_api_path) {
			configlines = '\nwindow.simplestore.Config.push(\'auth_server_api_path\', \'' + auth_server_api_path + '\');\n';
			global.append_to_file(path.join(dapp_dir, './app/js/src/config.js'), configlines);
		}

		if (key_server_api_path) {
			configlines = '\nwindow.simplestore.Config.push(\'key_server_api_path\', \'' + key_server_api_path + '\');\n';
			global.append_to_file(path.join(dapp_dir, './app/js/src/config.js'), configlines);
		}

		
		// check if will overload or just copy
		if (webapp_service.overload_dapp_files != 1) {
			// do copies of values that won't be put in XtraConfig
			// and which must be inserted if (webapp_service.overload_dapp_files != 1)
			
			// if no authkey server specified in settings, we put rest_server (normally current server) to do authkey
			if (!authkey_server_url) {
				authkey_server_url =  global.getConfigValue('rest_server_url');
				
				configlines = '\nwindow.simplestore.Config.push(\'authkey_server_url\', \'' + authkey_server_url + '\');\n';
				global.append_to_file(path.join(dapp_dir, './app/js/src/config.js'), configlines);
			}
			
			if (!authkey_server_api_path) {
				authkey_server_api_path = global.getConfigValue('rest_server_api_path');

				configlines = '\nwindow.simplestore.Config.push(\'authkey_server_api_path\', \'' + authkey_server_api_path + '\');\n';
				global.append_to_file(path.join(dapp_dir, './app/js/src/config.js'), configlines);
			}
		}
		
		
		
		result.push({service: this.name, handled: true});
	}
	
	overloadDappFiles_hook(result, params) {
		var global = this.global;

		global.log('overloadDappFiles_hook called for ' + this.name);
		
	}

	registerRoutes_hook(result, params) {
		var global = this.global;

		global.log('registerRoutes_hook called for ' + this.name);
		
		var app = params[0];
		var global = params[1];
		
		//
		// AuthKey routes
		//
		var AuthKeyRoutes = require( './routes/routes.js');
			
		var authkeyroutes = new AuthKeyRoutes(app, global);
		
		authkeyroutes.registerRoutes();
		
		result.push({service: this.name, handled: true});
	}

	_getUserFromRemoteAuthenticationServer(session) {
		var global = this.global;
		var remoteauthenticationserver = this.getRemoteAuthenticationServerInstance();
		
		var user = remoteauthenticationserver.getUser(session);
		
		if (user) {
			var useruuid = user.getUserUUID();

			if (useruuid) {
				// check if user exists in our database
				var authenticationserver = this.getAuthenticationServerInstance();
				
				if (!authenticationserver.userExistsFromUUID(session, useruuid)) {
					global.log('remote user not found in database, inserting user with uuid: ' + useruuid);
					
					// save user
					user.altloginmethod = 'remote-authkey-server';
					
					authenticationserver.saveUser(session, user);
				}
				else {
					global.log('remote user found in database with uuid: ' + useruuid);
				}
			}
			
		}
		
		return user;
	}
	
	createSession_hook(result, params) {
		var global = this.global;
		
		var session = params[0];
		
		if (!session)
			return false;
		
		var sessionuuid = session.getSessionUUID();

		global.log('createSession_hook called for ' + this.name + ' on session ' + sessionuuid);
		
		if (global.config['authkey_server_url']) {
			
			var user = this._getUserFromRemoteAuthenticationServer(session);
			
			if (user) {
				
				// attach user to session
				session.impersonateUser(user);
				
			}

			result.push({service: this.name, handled: true});
		}
		
		
		return true;
	}
	
	_getSessionTransientContext(session) {
		var name = 'service-' + this.name;
		
		var sessioncontext = session.getObject(name);
		
		if (!sessioncontext) {
			sessioncontext = {};
			session.pushObject(name, sessioncontext);
		}
		
		return sessioncontext;
	}
	
	_isRootSession(session) {
		if (!session)
			return false;
		
		if (session.getUser() === null)
			return false;
		
		return session.getUser().isSuperAdmin();
	}

	isSessionAnonymous_hook(result, params) {
		var global = this.global;
		
		var session = params[0];
		
		if (!session)
			return false;
		
		if (this._isRootSession(session))
			return false; // we do not handle (local) root user
		
		var sessionuuid = session.getSessionUUID();

		global.log('isSessionAnonymous_hook called for ' + this.name + ' on session ' + sessionuuid);
		
		if (global.config['authkey_server_url']) {
			
			var sessioncontext = this._getSessionTransientContext(session) ;
			
			var now = Date.now();
			
			if (sessioncontext.anonymousupdate && ((now - sessioncontext.anonymousupdate) < this.auth_check_frequency)) {
				// update only every 5s
				result.push({service: this.name, handled: true});
				return true;
			}
			
			sessioncontext.anonymousupdate = now;
			
			global.log('checking remote user details');
			
			var user = this._getUserFromRemoteAuthenticationServer(session);

			
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
				if (session.user) {
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
		
		if (this._isRootSession(session))
			return false; // we do not handle (local) root user
		
		var sessionuuid = session.getSessionUUID();

		global.log('isSessionAuthenticated_hook called for ' + this.name + ' on session ' + sessionuuid);
		
		if (global.config['authkey_server_url']) {
			
			var sessioncontext = this._getSessionTransientContext(session) ;
			
			var now = Date.now();
			
			if (sessioncontext.authenticatedupdate && ((now - sessioncontext.authenticatedupdate) < this.auth_check_frequency)) {
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
				
				if (session.user) {
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
		
        return global.getVersionInfo();
	}
	
	// objects
	getAuthenticationServerInstance() {
		if (this.authenticationserverinstance)
			return this.authenticationserverinstance;
			
		var global = this.global;
		var AuthenticationServer = require('./model/authentication-server.js');
		
		this.authenticationserverinstance = new AuthenticationServer(this);
		
		// invoke hook to let other services potentially overload instance
		var result = [];
		
		var params = [];
		
		params.push(this.authenticationserverinstance);

		var ret = global.invokeHooks('getAuthenticationServerInstance_hook', result, params);
		
		if (ret && result && result.length) {
			global.log('getAuthenticationServerInstance_hook result is ' + JSON.stringify(result));
		}
		
		return this.authenticationserverinstance;
	}
	
	getRemoteAuthenticationServerInstance() {
		if (this.remoteauthenticationserverinstance)
			return this.remoteauthenticationserverinstance;
			
		var global = this.global;
		var RemoteAuthenticationServer = require('./model/remote-authentication-server.js');
		
		this.remoteauthenticationserverinstance = new RemoteAuthenticationServer(this);
		
		// invoke hook to let other services potentially overload instance
		var result = [];
		
		var params = [];
		
		params.push(this.remoteauthenticationserverinstance);

		var ret = global.invokeHooks('getRemoteAuthenticationServerInstance_hook', result, params);
		
		if (ret && result && result.length) {
			global.log('getRemoteAuthenticationServerInstance_hook result is ' + JSON.stringify(result));
		}
		
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

	getDefaultAuthUrl() {
		var rest_server_url = this.global.config['authkey_server_url'];
		var rest_server_api_path = this.global.config['authkey_server_api_path'];

		return rest_server_url + rest_server_api_path;
	}

	getUserIdHash(userid) {
		var global = this.global;
		var cryptoservice = global.getServiceInstance('crypto');
		var cryptoserver = cryptoservice.getCryptoServerInstance();

		var useridstring = userid.toString(); // to be sure

		return cryptoserver.getStringHash(useridstring, 24);
	}

	getAuthUrlHash(authurl) {
		if (!authurl)
			return null;

		var defaultauthurl = this.getDefaultAuthUrl();

		if (authurl == defaultauthurl)
			return 'default';

		var global = this.global;

		var cryptoservice = global.getServiceInstance('crypto');
		var cryptoserver = cryptoservice.getCryptoServerInstance();

		return cryptoserver.getStringHash(authurl, 8);
	}

	isValidEmail(session, emailaddress) {
		if (!emailaddress)
			return false;
		
		var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
		
		if(emailaddress.match(mailformat))
			return true;
		else
			return false;
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