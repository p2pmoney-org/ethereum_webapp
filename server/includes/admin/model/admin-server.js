'use strict';

class AdminServer {
	constructor(global) {
		this.global = global;
	}
	
	//
	// file sytem
	//
	checkDataDirectories() {
		// check webapp_app_dir is writable
	}

	//
	// database
	//
	async _getLocalMysqlServerVersion() {
		var global = this.global;
		var output = false;
		
		var cmd = 'mysqld --version';
		
		var result = await global.executeCmdLineAsync(cmd);
		
		if (result !== false) {
			output = result;
		}
	    
		return output;
	}
	
	async _pingMysqlHost() {
		var global = this.global;
		var output = false;
		
		var mysqlcon = await global.getMySqlConnectionAsync();

		var cmd = 'mysql --host=' + mysqlcon.host + ' --port=' + mysqlcon.port;
		
		var result = await global.executeCmdLineAsync(cmd);
		
		if (result !== false) {
			output = result;
		}
	    
		return output;
	}
	
	async checkDataBaseServer() {
		var global = this.global;

		global.log('AdminServer.checkDataBaseConnection called');
		
		var mysqlversion = false;

		try {
			var mysqlcon = await global.getMySqlConnectionAsync();
			mysqlversion = await mysqlcon.getMysqlServerVersionAsync();
		}
		catch(e) {
			global.log('Exception: ' + e);
		}
		
		if (mysqlversion == false)
			return false;
		
		return true;
	}

	async checkRootBlankPassword() {
		var global = this.global;

		global.log('AdminServer.checkRootBlankPassword called');

		var org_mysqlcon = await global.getMySqlConnectionAsync();
		var mysqlcon = org_mysqlcon.clone();

		mysqlcon.database = null;
		mysqlcon.username = 'root';
		mysqlcon.password = null;
		
		try {
			let isActive = await mysqlcon.isActiveAsync();
			if (isActive) {
				var sql = "SHOW DATABASES;";
				
				// open connection
				await mysqlcon.openAsync();
				
				// execute query
				var result = await mysqlcon.executeAsync(sql);
				
				global.log('root still has no password');
				//global.log('result is ' + JSON.stringify(result));
				
				// close connection
				await mysqlcon.closeAsync();
				
				return true;
			}
			else {
				return false;
			}
		}
		catch(e) {
			global.log('exception: ' + e);
			global.log('root has a password');
			return false;
		}
	}

	async checkDataBase(databasename) {
		var global = this.global;
		var result = [];
		
		global.log('AdminServer.checkDataBase called');
		
		await this.checkDataBaseConnection()
		
		return result;
	}
	
	async checkDataBaseConnection() {
		var global = this.global;

		global.log('AdminServer.checkDataBaseConnection called');

		var mysqlcon = await global.getMySqlConnectionAsync();

		try {
			// open connection
			await mysqlcon.openAsync();
			
			let isActive = await mysqlcon.isActiveAsync();
			if (isActive) {
				var sql = "SHOW DATABASES;";
				
				// execute query
				var result = await mysqlcon.executeAsync(sql);
				
				// close connection
				await mysqlcon.closeAsync();
				
				return true;
			}
			else {
				return false;
			}
			
		}
		catch(e) {
			return false;
		}
	}

	//
	// ethereum node
	//
	checkGethConnection() {
		
	}
	
	
	//
	// Utilities functions
	//

	
	// save config file
	async saveConfig(session) {
		var hasSuperAdminPrivilegesAsync = await session.hasSuperAdminPrivilegesAsync();
		if (!hasSuperAdminPrivilegesAsync)
			throw 'only a super admin can save application config';

		var global = this.global;

		var config = global.config;
		
		await global.saveJsonAsync('config', config);
	}
	
	// read launch.config
	async readLaunchConfig(session) {
		var hasSuperAdminPrivilegesAsync = await session.hasSuperAdminPrivilegesAsync();
		if (!hasSuperAdminPrivilegesAsync)
			throw 'only a super admin can read launch config';

		var global = this.global;

		var filepath = '/home/appuser/launch.config';
		
		return global.readVariableFile(filepath);
	}
	
	async getApplicationInfoList(session) {
		var hasSuperAdminPrivilegesAsync = await session.hasSuperAdminPrivilegesAsync();
		if (!hasSuperAdminPrivilegesAsync)
			throw 'only a super admin can read application info';
		
		var variables = {};
		
		var global = this.global;
		
		// code version
		variables['Code version'] = global.getCurrentVersion();
		
		var commonservice = global.getServiceInstance('common');
		
		var parameters = await commonservice.getGlobalParametersAsync('CurrentVersion');
		
		for (var i = 0; i < (parameters ? parameters.length : 0); i++) {
			variables['Install version'] = parameters[i].value;
		}
		
		return variables;
	}
	
	// mysql
	async checkMysqlRootPassword(password) {
		if (!password)
			throw 'You must provide a password';
		
		var global = this.global;

		var org_mysqlcon = await global.getMySqlConnectionAsync();
		var mysqlcon = org_mysqlcon.clone();

		mysqlcon.database = null;
		mysqlcon.username = 'root';
		mysqlcon.password = password;
		
		try {
			let isActive = await mysqlcon.isActiveAsync();
			if (isActive) {
				var sql = "SHOW DATABASES;";
				
				// open connection
				await mysqlcon.openAsync();
				
				// execute query
				var result = await mysqlcon.executeAsync(sql);
				
				global.log('result is ' + JSON.stringify(result));
				
				// close connection
				await mysqlcon.closeAsync();
				
				return true;
			}
			else {
				return false;
			}
		}
		catch(e) {
			return false;
		}
		
	}
	
	async changeMysqlRootPassword(oldpassword, newpassword) {
		if (!oldpassword && !this.checkRootBlankPassword())
			throw 'Can not change root password without current password';
		
		var global = this.global;
		
		global.log('AdminServer.changeMysqlRootPassword called');

		var org_mysqlcon = await global.getMySqlConnectionAsync();
		var mysqlcon = org_mysqlcon.clone();

		mysqlcon.database = null;
		mysqlcon.username = 'root';
		mysqlcon.password = (oldpassword ? oldpassword : null);
		
		try {
			
			var sql = "ALTER USER 'root'@'localhost' IDENTIFIED BY '" + newpassword + "';";
			
			// open connection
			await mysqlcon.openAsync();
			
			global.log('execute query: ' + sql);

			// execute query
			var result = await mysqlcon.executeAsync(sql);
			
			
			global.log('result is ' + JSON.stringify(result));
			
			sql = "GRANT ALL PRIVILEGES ON *.* TO root@localhost;";
			result = await mysqlcon.executeAsync(sql);
			sql = "FLUSH PRIVILEGES;";
			result = await mysqlcon.executeAsync(sql);
			
			// close connection
			await mysqlcon.closeAsync();
			
			return true;
		}
		catch(e) {
			global.log('exception changing mysql root password: ' + e);
			return false;
		}
		
	}
	
	async _createDatabase(mysqlcon, databasename) {
		var sql = 'CREATE DATABASE IF NOT EXISTS ' + databasename + ";";
		
		// open connection
		await mysqlcon.openAsync();
		
		// execute query
		var result = await mysqlcon.executeAsync(sql);
		
		// close connection
		await mysqlcon.closeAsync();
	}
	
	async _createWebappuser(mysqlcon, webappdatabase, webappuser, webappuserpassword) {
		var sql = "CREATE USER '" + webappuser + "'@'localhost' IDENTIFIED BY '" + webappuserpassword + "';";
		
		// open connection
		await mysqlcon.openAsync();
		
		// execute query
		var result = await mysqlcon.executeAsync(sql);
		
		sql = "GRANT ALL PRIVILEGES ON " + webappdatabase + ".* TO '" + webappuser + "'@'localhost';";
		result = await mysqlcon.executeAsync(sql);
		
		// close connection
		await mysqlcon.closeAsync();
	}
	
	async _createMysqlWebappTables(mysqlcon, webappdatabase) {
		
	}
	
	async installMysqlTables(session, inputs) {
		var global = this.global;
		
		var rootpassword = inputs.rootpassword;
		
		var hasSuperAdminPrivilegesAsync = await session.hasSuperAdminPrivilegesAsync();
		if (!hasSuperAdminPrivilegesAsync)
			throw 'only root can install mysql tables';

		var result = [];
		
		var params = [];
		
		params.push(session);
		
		var org_mysqlcon = await global.getMySqlConnectionAsync();
		var mysqlcon = org_mysqlcon.clone();

		mysqlcon.database = null;
		mysqlcon.username = 'root';
		mysqlcon.password = rootpassword;
		mysqlcon.setTablePrefix(inputs.mysql_table_prefix);
		
		params.push(mysqlcon);
		
		// keep connection in the session for subsequent install steps
		session.pushObject('mysqlcon', mysqlcon);
		
		// create webapp database
		var webappuser = inputs.mysql_username;
		var webappuserpassword = inputs.mysql_password;
		var webappdatabase = inputs.mysql_database;
		
		await this._createDatabase(mysqlcon, webappdatabase);
		mysqlcon.database = webappdatabase;
		
		// create webapp user and grant rights
		await this._createWebappuser(mysqlcon, webappdatabase, webappuser, webappuserpassword);
		
		// create globalparameters table
		await this._createMysqlWebappTables(mysqlcon, webappdatabase);
		
		// invoke hooks to let services add their tables
		var ret = global.invokeHooks('installMysqlTables_hook', result, params); // legacy sync
		ret = await global.invokeAsyncHooks('installMysqlTables_asynchook', result, params);
		
		if (ret && result && result.length) {
			global.log('installMysqlTables_hook result is ' + JSON.stringify(result));
		}
	}
	
	async installWebappConfig(session, inputs) {
		var global = this.global;

		var config = {};
		
		config.service_name="ethereum_webapp";
		config.server_listening_port=8000;
		config.service_uuid=global.guid();

		config.route_root_path="/api";
		config.rest_server_url=inputs.rest_server_url;
		config.rest_server_api_path=inputs.rest_server_api_path;


		config.enable_log=1;
		config.write_to_log_file=0;
		config.log_path="/home/appuser/var/lib/ethereum_webapp/logs/server.log";
		 

		// geth
		config.web3_provider_url="http://127.0.0.1";
		config.web3_provider_port=8545;


		// mysql
		config.mysql_host="127.0.0.1";
		config.mysql_port=3306;
		config.mysql_database=inputs.mysql_database;
		config.mysql_username=inputs.mysql_username;
		config.mysql_password=inputs.mysql_password;
		config.mysql_table_prefix=inputs.mysql_table_prefix;
		

		// invoke hooks to let services add their settings
		var result = [];
		
		var params = [];

		params.push(session);
		params.push(config);

		var ret = global.invokeHooks('installWebappConfig_hook', result, params); // legacy sync
		ret = await global.invokeAsyncHooks('installWebappConfig_asynchook', result, params);
		
		if (ret && result && result.length) {
			global.log('installWebappConfig_hook result is ' + JSON.stringify(result));
		}
		
		// save json
		global.saveJsonAsync('config', config);
	}
	
	async installFinal() {
		var global = this.global;
		
		var currentversion = global.getCurrentVersion();
		var now = new Date()
		
		var nowstring = global.formatDate(now, 'YYYY-mm-dd HH:MM:SS');
		
		var commonservice = global.getServiceInstance('common');
		
		await commonservice.addGlobalParameterAsync('CurrentVersion', currentversion);
		await commonservice.addGlobalParameterAsync('VersionInstallation', currentversion + ';' + nowstring);
	}
	
	// user management
	async getUsers(session) {
		var global = this.global;
		var hasSuperAdminPrivilegesAsync = await session.hasSuperAdminPrivilegesAsync();
		if (!hasSuperAdminPrivilegesAsync)
			throw 'only a superadmin can get the list of users';
		
		var authkeyservice = global.getServiceInstance('authkey');
		
		var authserver = authkeyservice.getAuthenticationServerInstance() 

		var users = await authserver.getUsersAsync(session);
		
		return users;
	}
	
	async addUser(session, username, useremail, userpassword) {
		var global = this.global;
		
		global.log('AdminServer.addUser called');
		
		var hasSuperAdminPrivilegesAsync = await session.hasSuperAdminPrivilegesAsync();
		if (!hasSuperAdminPrivilegesAsync)
			throw 'only a superadmin can add a user';
		
		var commonservice = global.getServiceInstance('common');
		var authkeyservice = global.getServiceInstance('authkey');
		
		var authserver = authkeyservice.getAuthenticationServerInstance();

		// save user
		var user = commonservice.createBlankUserInstance();
		
		user.setUserName(username);
		user.setUserEmail(useremail);
		user.setUserUUID(session.guid());
		user.setAccountStatus(2);
		
		await authserver.saveUserAsync(session, user);
		
		// save password
		var clearpassword = userpassword;
		var hashmethod = 0;
		var salt = '';
		var pepper = null;
		var passwordobject = authkeyservice.createPasswordObjectInstance(clearpassword, salt, pepper, hashmethod);
		
		await authserver.saveUserPasswordAsync(session, user.getUserUUID(), passwordobject);
	}
	
	async saveUser(session, useruuid, username, useremail, userpassword) {
		var global = this.global;
		
		global.log('AdminServer.saveUser called for useruuid ' + useruuid);

		var hasSuperAdminPrivilegesAsync = await session.hasSuperAdminPrivilegesAsync();
		if (!hasSuperAdminPrivilegesAsync)
			throw 'only a superadmin can save a user';
		
		var commonservice = global.getServiceInstance('common');
		var authkeyservice = global.getServiceInstance('authkey');
		
		var authserver = authkeyservice.getAuthenticationServerInstance() 

		// save user
		var user = await authserver.getUserFromUUIDAsync(session, useruuid);
		
		user.setUserName(username);
		user.setUserEmail(useremail);
		
		await authserver.saveUserAsync(session, user);
		
		if (userpassword && (userpassword.length > 0)) {
			// save password, if changed
			var clearpassword = userpassword;
			var hashmethod = 0;
			var salt = '';
			var pepper = null;
			var passwordobject = authkeyservice.createPasswordObjectInstance(clearpassword, salt, pepper, hashmethod);
			
			await authserver.saveUserPasswordAsync(session, user.getUserUUID(), passwordobject);
		}
	}
	
	async getUserFromUUID(session, useruuid) {
		var global = this.global;
		
		var hasSuperAdminPrivilegesAsync = await session.hasSuperAdminPrivilegesAsync();
		if (!hasSuperAdminPrivilegesAsync)
			throw 'only a superadmin can get a user';
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var authkeyservice = global.getServiceInstance('authkey');
		
		var authserver = authkeyservice.getAuthenticationServerInstance(); 
		
		return authserver.getUserFromUUIDAsync(session, useruuid);
	}
	
	async getUserKeys(session, useruuid) {
		var hasSuperAdminPrivilegesAsync = await session.hasSuperAdminPrivilegesAsync();
		if (!hasSuperAdminPrivilegesAsync)
			throw 'only a superadmin can get list of keys';
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var authkeyservice = global.getServiceInstance('authkey');
		
		var authserver = authkeyservice.getAuthenticationServerInstance() 

		return authserver.getUserKeysFromUserUUIDAsync(session, useruuid);
	}
	
	async addUserKey(session, useruuid, privatekey) {
		var hasSuperAdminPrivilegesAsync = await session.hasSuperAdminPrivilegesAsync();
		if (!hasSuperAdminPrivilegesAsync)
			throw 'only a superadmin can get add a key';
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var authkeyservice = global.getServiceInstance('authkey');
		
		var authserver = authkeyservice.getAuthenticationServerInstance();
		
		var keyuuid = session.guid();
		var cryptokey = authkeyservice.createBlankCryptoKeyInstance();
		var type = 1; // ethereum account

		
		cryptokey.setPrivateKey(privatekey);
		cryptokey.setKeyUUID(keyuuid);
		cryptokey.setType(type);

		return authserver.addUserKeyAsync(session, useruuid, cryptokey);
	}
	
	async deleteUserKey(session, useruuid, keyuuid) {
		var hasSuperAdminPrivilegesAsync = await session.hasSuperAdminPrivilegesAsync();
		if (!hasSuperAdminPrivilegesAsync)
			throw 'only a superadmin can get add a key';
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var authkeyservice = global.getServiceInstance('authkey');
		
		var authserver = authkeyservice.getAuthenticationServerInstance();
		
		return authserver.removeUserKeyAsync(session, useruuid, keyuuid);
	}
}

module.exports = AdminServer;
