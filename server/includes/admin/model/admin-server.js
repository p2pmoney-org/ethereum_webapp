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
	_getLocalMysqlServerVersion() {
		var global = this.global;
		var output = false;
		
		var cmd = 'mysqld --version';
		
		var result = global.executeCmdLine(cmd);
		
		if (result !== false) {
			output = result;
		}
	    
		return output;
	}
	
	_pingMysqlHost() {
		var global = this.global;
		var output = false;
		
		var mysqlcon = global.getMySqlConnection();

		var cmd = 'mysql --host=' + mysqlcon.host + ' --port=' + mysqlcon.port;
		
		var result = global.executeCmdLine(cmd);
		
		if (result !== false) {
			output = result;
		}
	    
		return output;
	}
	
	checkDataBaseServer() {
		var global = this.global;

		global.log('AdminServer.checkDataBaseConnection called');
		
		var mysqlversion = false;

		try {
			var mysqlcon = global.getMySqlConnection();
			mysqlversion = mysqlcon.getMysqlServerVersion();
		}
		catch(e) {
			global.log('Exception: ' + e);
		}
		
		if (mysqlversion == false)
			return false;
		
		return true;
	}

	checkRootBlankPassword() {
		var global = this.global;

		global.log('AdminServer.checkRootBlankPassword called');

		var mysqlcon = global.getMySqlConnection().clone();

		mysqlcon.database = null;
		mysqlcon.username = 'root';
		mysqlcon.password = null;
		
		try {
			if (mysqlcon.isActive()) {
				var sql = "SHOW DATABASES;";
				
				// open connection
				mysqlcon.open();
				
				// execute query
				var result = mysqlcon.execute(sql);
				
				global.log('root still has no password');
				//global.log('result is ' + JSON.stringify(result));
				
				// close connection
				mysqlcon.close();
				
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

	checkDataBase(databasename) {
		var global = this.global;
		var result = [];
		
		global.log('AdminServer.checkDataBase called');
		
		this.checkDataBaseConnection()
		
		return result;
	}
	
	checkDataBaseConnection() {
		var global = this.global;

		global.log('AdminServer.checkDataBaseConnection called');

		var mysqlcon = global.getMySqlConnection();

		try {
			// open connection
			mysqlcon.open();
			
			if (mysqlcon.isActive()) {
				var sql = "SHOW DATABASES;";
				
				// execute query
				var result = mysqlcon.execute(sql);
				
				// close connection
				mysqlcon.close();
				
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
	saveConfig(session) {
		if (!session.hasSuperAdminPrivileges())
			throw 'only a super admin can save application config';

		var global = this.global;

		var config = global.config;
		
		global.saveJson('config', config);
	}
	
	// read launch.config
	readLaunchConfig(session) {
		if (!session.hasSuperAdminPrivileges())
			throw 'only a super admin can read launch config';

		var global = this.global;

		var filepath = '/home/appuser/launch.config';
		
		return global.readVariableFile(filepath);
	}
	
	getApplicationInfoList(session) {
		if (!session.hasSuperAdminPrivileges())
			throw 'only a super admin can read application info';
		
		var variables = {};
		
		var global = this.global;
		
		// code version
		variables['Code version'] = global.getConstant('CURRENT_VERSION');
		
		var commonservice = global.getServiceInstance('common');
		
		var parameters = commonservice.getGlobalParameters('CurrentVersion');
		
		for (var i = 0; i < (parameters ? parameters.length : 0); i++) {
			variables['Install version'] = parameters[i].value;
		}
		
		return variables;
	}
	
	// mysql
	checkMysqlRootPassword(password) {
		if (!password)
			throw 'You must provide a password';
		
		var global = this.global;

		var mysqlcon = global.getMySqlConnection().clone();

		mysqlcon.database = null;
		mysqlcon.username = 'root';
		mysqlcon.password = password;
		
		try {
			if (mysqlcon.isActive()) {
				var sql = "SHOW DATABASES;";
				
				// open connection
				mysqlcon.open();
				
				// execute query
				var result = mysqlcon.execute(sql);
				
				global.log('result is ' + JSON.stringify(result));
				
				// close connection
				mysqlcon.close();
				
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
	
	changeMysqlRootPassword(oldpassword, newpassword) {
		if (!oldpassword && !this.checkRootBlankPassword())
			throw 'Can not change root password without current password';
		
		var global = this.global;
		
		global.log('AdminServer.changeMysqlRootPassword called');

		var mysqlcon = global.getMySqlConnection().clone();

		mysqlcon.database = null;
		mysqlcon.username = 'root';
		mysqlcon.password = (oldpassword ? oldpassword : null);
		
		try {
			
			var sql = "ALTER USER 'root'@'localhost' IDENTIFIED BY '" + newpassword + "';";
			
			// open connection
			mysqlcon.open();
			
			global.log('execute query: ' + sql);

			// execute query
			var result = mysqlcon.execute(sql);
			
			
			global.log('result is ' + JSON.stringify(result));
			
			sql = "GRANT ALL PRIVILEGES ON *.* TO root@localhost;";
			result = mysqlcon.execute(sql);
			sql = "FLUSH PRIVILEGES;";
			result = mysqlcon.execute(sql);
			
			// close connection
			mysqlcon.close();
			
			return true;
		}
		catch(e) {
			global.log('exception changing mysql root password: ' + e);
			return false;
		}
		
	}
	
	_createDatabase(mysqlcon, databasename) {
		var sql = 'CREATE DATABASE IF NOT EXISTS ' + databasename + ";";
		
		// open connection
		mysqlcon.open();
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
	}
	
	_createWebappuser(mysqlcon, webappdatabase, webappuser, webappuserpassword) {
		var sql = "CREATE USER '" + webappuser + "'@'localhost' IDENTIFIED BY '" + webappuserpassword + "';";
		
		// open connection
		mysqlcon.open();
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		sql = "GRANT ALL PRIVILEGES ON " + webappdatabase + ".* TO '" + webappuser + "'@'localhost';";
		result = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
	}
	
	_createMysqlWebappTables(mysqlcon, webappdatabase) {
		
	}
	
	installMysqlTables(session, inputs) {
		var global = this.global;
		
		var rootpassword = inputs.rootpassword;
		
		if (!session.hasSuperAdminPrivileges())
			throw 'only root can install mysql tables';

		var result = [];
		
		var params = [];
		
		params.push(session);
		
		var mysqlcon = global.getMySqlConnection().clone();

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
		
		this._createDatabase(mysqlcon, webappdatabase);
		mysqlcon.database = webappdatabase;
		
		// create webapp user and grant rights
		this._createWebappuser(mysqlcon, webappdatabase, webappuser, webappuserpassword);
		
		// create globalparameters table
		this._createMysqlWebappTables(mysqlcon, webappdatabase);
		
		// invoke hooks to let services add their tables
		var ret = global.invokeHooks('installMysqlTables_hook', result, params);
		
		if (ret && result && result.length) {
			global.log('installMysqlTables_hook result is ' + JSON.stringify(result));
		}
	}
	
	installWebappConfig(session, inputs) {
		var global = this.global;

		var config = {};
		
		config.service_name="ethereum webapp";
		config.server_listening_port=8000;

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

		var ret = global.invokeHooks('installWebappConfig_hook', result, params);
		
		if (ret && result && result.length) {
			global.log('installWebappConfig_hook result is ' + JSON.stringify(result));
		}
		
		// save json
		global.saveJson('config', config);
	}
	
	installFinal() {
		var global = this.global;
		
		var currentversion = global.getConstant('CURRENT_VERSION');
		var now = new Date()
		
		var nowstring = global.formatDate(now, 'YYYY-mm-dd HH:MM:SS');
		
		var commonservice = global.getServiceInstance('common');
		
		commonservice.addGlobalParameter('CurrentVersion', currentversion);
		commonservice.addGlobalParameter('VersionInstallation', currentversion + ';' + nowstring);
	}
	
	// user management
	getUsers(session) {
		var global = this.global;
		if (!session.hasSuperAdminPrivileges())
			throw 'only a superadmin can get the list of users';
		
		var authkeyservice = global.getServiceInstance('authkey');
		
		var authserver = authkeyservice.getAuthenticationServerInstance() 

		var users = authserver.getUsers();
		
		return users;
	}
	
	addUser(session, username, useremail, userpassword) {
		var global = this.global;
		
		global.log('AdminServer.addUser called');
		
		if (!session.hasSuperAdminPrivileges())
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
		
		authserver.saveUser(session, user);
		
		// save password
		var clearpassword = userpassword;
		var hashmethod = 0;
		var salt = '';
		var pepper = null;
		var passwordobject = authkeyservice.createPasswordObjectInstance(clearpassword, salt, pepper, hashmethod);
		
		authserver.saveUserPassword(session, user.getUserUUID(), passwordobject);
	}
	
	saveUser(session, useruuid, username, useremail, userpassword) {
		var global = this.global;
		
		global.log('AdminServer.saveUser called for useruuid ' + useruuid);

		if (!session.hasSuperAdminPrivileges())
			throw 'only a superadmin can save a user';
		
		var commonservice = global.getServiceInstance('common');
		var authkeyservice = global.getServiceInstance('authkey');
		
		var authserver = authkeyservice.getAuthenticationServerInstance() 

		// save user
		var user = authserver.getUserFromUUID(session, useruuid);
		
		user.setUserName(username);
		user.setUserEmail(useremail);
		
		authserver.saveUser(session, user);
		
		if (userpassword && (userpassword.length > 0)) {
			// save password, if changed
			var clearpassword = userpassword;
			var hashmethod = 0;
			var salt = '';
			var pepper = null;
			var passwordobject = authkeyservice.createPasswordObjectInstance(clearpassword, salt, pepper, hashmethod);
			
			authserver.saveUserPassword(session, user.getUserUUID(), passwordobject);
		}
	}
	
	getUserFromUUID(session, useruuid) {
		var global = this.global;
		
		if (!session.hasSuperAdminPrivileges())
			throw 'only a superadmin can get a user';
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var authkeyservice = global.getServiceInstance('authkey');
		
		var authserver = authkeyservice.getAuthenticationServerInstance(); 
		
		return authserver.getUserFromUUID(session, useruuid);
	}
	
	getUserKeys(session, useruuid) {
		if (!session.hasSuperAdminPrivileges())
			throw 'only a superadmin can get list of keys';
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var authkeyservice = global.getServiceInstance('authkey');
		
		var authserver = authkeyservice.getAuthenticationServerInstance() 

		return authserver.getUserKeysFromUserUUID(session, useruuid);
	}
	
	addUserKey(session, useruuid, privatekey) {
		if (!session.hasSuperAdminPrivileges())
			throw 'only a superadmin can get add a key';
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var authkeyservice = global.getServiceInstance('authkey');
		
		var authserver = authkeyservice.getAuthenticationServerInstance();
		
		var keyuuid = session.guid();

		return authserver.addUserKey(session, useruuid, keyuuid, privatekey);
	}
	
	deleteUserKey(session, useruuid, keyuuid) {
		if (!session.hasSuperAdminPrivileges())
			throw 'only a superadmin can get add a key';
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var authkeyservice = global.getServiceInstance('authkey');
		
		var authserver = authkeyservice.getAuthenticationServerInstance();
		
		return authserver.removeUserKey(session, useruuid, keyuuid);
	}
}

module.exports = AdminServer;
