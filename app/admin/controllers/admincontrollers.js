'use strict';

class AdminControllers {
	constructor(global) {
		this.global = global;
		
		this.adminserver = global.getServiceInstance('admin').getAdminServer();

	}
	
	_getSessionInstance(req) {
		var global = this.global;
		var adminserver = this.adminserver ;

		var sessionuuid = (req.query.sessionuuid ? req.query.sessionuuid : null);
		
		if (!sessionuuid) {
			// look in body in case it's a POST
			sessionuuid = (req.body && req.body.sessionuuid ? req.body.sessionuuid  : null);
		}
		
		
		global.log('AdminControllers._getSessionInstance for : ' + sessionuuid);
		
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;
		var session;

		if (sessionuuid) {
			session = Session.getSession(global, sessionuuid);
		}
		else {
			session = Session.createBlankSession(global);
			
			req.query.sessionuuid = session.getSessionUUID();
			
			if (adminserver.checkRootBlankPassword() == true) {
				this._impersonateRoot(session);;
			}
		}
		
		return session;
	}
	
	_isRootSession(session) {
		var user = session.getUser();
		
		if (user.getUserName() == 'root')
			return true;
		else
			return false;
	}
	
	_impersonateRoot(session) {
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var user = commonservice.createBlankUserInstance();
		
		user.setUserName('root');
		
		var superadminrole = commonservice.createRoleInstance(1, 'SuperAdmin');
		
		user.addRole(superadminrole);
		
		session.impersonateUser(user);
	}
	
	_setupDone() {
		var global = this.global;
		var adminserver = this.adminserver ;

		return adminserver.checkRootBlankPassword() != true;
	}
	
	get_index(req, res, next) {
		var global = this.global;
		var adminserver = this.adminserver ;
		
		var session = this._getSessionInstance(req);
		
		var data = {};
		
		
		var message = 'no message';
		
		var action = (req.query.action ? req.query.action : null);
		
		switch(action) {
			case 'logout':
				this.handleLogout(req);
				break;
	
			default:
				break;
		}

		
		// data to display
		data['title'] = global.service_name;
		
		data['message'] = message;
		
		// session
		var serverdata = {};
		var sessiondata = {};
		var navigationdata = {};
		
		if (this._setupDone())
			serverdata.setupdone = true;
		else
			serverdata.setupdone = false;

		
		sessiondata.islogged = false;
		sessiondata.sessionuuid = session.getSessionUUID();
		
		navigationdata.tab = 0;
		
		data['server'] = serverdata;
		data['session'] = sessiondata;
		data['navigation'] = navigationdata;

		if (!session.isAuthenticated() || !this._isRootSession(session)) {
			global.log('session NOT logged under root');

			sessiondata.islogged = false;
			navigationdata.tab = 2;
		}
		else {
			global.log('session is logged under root');

			// session is authenticated
			sessiondata.islogged = true;
			
			// read request parameter
			var tabparam = req.query.tab;

			// tab requested
			if (serverdata.setupdone) {
				switch(tabparam) {
					case 'login':
						navigationdata.tab = 0;
						break;
						
					case 'container':
						navigationdata.tab = 1;
						break;
						
					case 'application':
						navigationdata.tab = 2;
						break;
						
					case 'users':
						navigationdata.tab = 3;
						break;
						
					default:
						navigationdata.tab = 1; // container
						break;
				}
			
			}
			else {
				navigationdata.tab = -1; // setup
			}
			
			switch(navigationdata.tab) {
				case -1:
					// setup
					break;
			
				case 0:
					// login box
					break;
				
				case 1:
					// container status
					this.prepareContainerStatusView(req, session, data);
					break;
			
				case 2:
					// server status
					this.prepareApplicationConfigView(req, session, data);
					break;
				
				case 3: {
					// managing users
					this.prepareUsersView(req, session, data);
					
					var operation = req.query.operation;
					
					if (operation == 'deletekey') {
						req.body = (req.body ? req.body : {});
						req.body.useruuid = req.query.useruuid;
						req.body.operation = req.query.operation;
						req.body.keyuuid = req.query.keyuuid;

						this.handleUsersSubmit(req, session);
					}
				}
					break;
				
				default:
					// login box
					break;
			
			}
			
		}
		
		// render with index.pug
		res.render('index', data);
	}
	
	post_index(req, res, next) {
		var global = this.global;
		
		global.log('AdminControllers.post_index called');
		
		var action = (req.body ? req.body.action : null);

		global.log('action requested is ' + action);
		
		var adminserver = global.getServiceInstance('admin').getAdminServer();

		var session = this._getSessionInstance(req);
		
		switch(action) {
			case 'install':
				this.handleInstall(req, session);
				break;
			case 'login':
				this.handleLogin(req, session);
				break;
			case 'application':
				this.handleApplicationConfigSubmit(req, session);
				req.tab = 'application';
				break;
			case 'users':
				this.handleUsersSubmit(req, session);
				req.tab = 'users';
				break;
			default:
				break;
		}

		this.get_index(req, res, next) ;
	}
	
	// views
	prepareContainerStatusView(req, session, data) {
		var global = this.global;
		var adminserver = this.adminserver ;

		// read launcher.config
		var launchvariables = [];
		var launchconfig = adminserver.readLaunchConfig(session);
		
		for (var key in launchconfig) {
		    if (launchconfig.hasOwnProperty(key)) {
		        var variable = {};
		        variable.key = key;
		        variable.value = launchconfig[key];
		        
		        launchvariables.push(variable);
		    }
		}

		data['launchvariables'] = launchvariables;
	}
	
	prepareApplicationConfigView(req, session, data) {
		if (!session.hasSuperAdminPrivileges())
			throw 'only a super admin can see the application config';

		var global = this.global;
		var adminserver = this.adminserver ;
		
		var mysqlversion = 'mysql server not running';

		if (adminserver.checkDataBaseServer()) {
			mysqlversion = global.getMySqlConnection().getMysqlServerVersion();
		}
		else {
			data['message'] = 'you should restart the container';
			data['message'] = adminserver._pingMysqlHost();
		}
		 
		// form
		data['web3_provider_url'] = global.web3_provider_url;
		data['web3_provider_port'] = global.web3_provider_port;

		data['mysql_version'] = mysqlversion;
		data['mysql_host'] = global.mysql_host;
		data['mysql_port'] = global.mysql_port;
		data['mysql_database'] = global.mysql_database;
		data['mysql_username'] = global.mysql_username;
		data['mysql_table_prefix'] = global.mysql_table_prefix;
		
		data['route_root_path'] = global.route_root_path;
		data['rest_server_url'] = global.config['rest_server_url'];
		data['rest_server_api_path'] = global.config['rest_server_api_path'];

		// read launcher.config
		var appvariables = [];
		var appconfig = adminserver.getApplicationInfoList(session);
		
		for (var key in appconfig) {
		    if (appconfig.hasOwnProperty(key)) {
		        var variable = {};
		        variable.key = key;
		        variable.value = appconfig[key];
		        
		        appvariables.push(variable);
		    }
		}

		// form
		data['applicationvariables'] = appvariables;
	
	}
	
	_fillUserData(datauser, user) {
		datauser['username'] = user.getUserName();
		datauser['useruuid'] = user.getUserUUID();
		datauser['useremail'] = user.getUserEmail();
		datauser['accountstatus'] = user.getAccountStatus();
	}
	
	prepareUsersView(req, session, data) {
		var global = this.global;
		var adminserver = this.adminserver;
		
		var selecteduseruuid = (req.query.useruuid ? req.query.useruuid : null);
		
		data['users'] = [];
		data['selecteduser'] = {};

		if (!selecteduseruuid) {
			// get list of user
			var users = adminserver.getUsers(session);
			
			
			for (var i = 0; i < users.length; i++) {
				var user = users[i];
				var datauser = {};
				
				this._fillUserData(datauser, user);
				
				data['users'].push(datauser);
			}
		}
		else {
			// get user and his/her keys
			var selecteduser = adminserver.getUserFromUUID(session, selecteduseruuid);
			
			
			if (selecteduser) {
				var datauser = {};
				
				this._fillUserData(datauser, selecteduser)
				
				data['selecteduser'] = datauser;
				
				data['username'] = datauser['username'];
				data['useremail'] = datauser['useremail'];
				
				// keys
				data['selecteduser'].keys = [];
				
				var keys = adminserver.getUserKeys(session, selecteduseruuid);
				
				for (var i = 0; i < keys.length; i++) {
					var userkey = keys[i];
					var datakey = {};
					
					datakey.keyuuid = userkey['uuid'];
					datakey.privatekey = userkey['private_key'];
					
					
					data['selecteduser'].keys.push(datakey);
				}
			}
		}

	}

	// submit
	handleLogout(req) {
		var global = this.global;
		var adminserver = this.adminserver;
		var session = this._getSessionInstance(req);
		
		session.disconnectUser();
	}

	handleLogin(req, session) {
		var global = this.global;
		var adminserver = this.adminserver;
		var session = this._getSessionInstance(req);
		
		global.log('AdminControllers.handleLogin called');

		if (!session.isAuthenticated()) {
			var password = (req.body ? req.body.password : null);
			
			if (adminserver.checkMysqlRootPassword(password)) {
				this._impersonateRoot(session);
			}
			
		}
	}

	handleInstall(req, session) {
		var installinputs = {}
		
		installinputs.rootpassword = (req.body ? req.body.rootpassword : null);

		
		installinputs.rest_server_url = (req.body ? req.body.rest_server_url : null);
		installinputs.rest_server_api_path = (req.body ? req.body.rest_server_api_path : null);

		installinputs.mysql_database = (req.body ? req.body.webappdatabasename : "webapp");
		installinputs.mysql_username = (req.body ? req.body.webappusername : "webappuser");
		installinputs.mysql_password = (req.body ? req.body.webapppassword : Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1));
		installinputs.mysql_table_prefix = (req.body ? req.body.webapptableprefix : "");

		var global = this.global;
		
		global.log('AdminControllers.handleInstall called');
		
		var adminserver = this.adminserver ;
		var session = this._getSessionInstance(req);
		
		if (adminserver.changeMysqlRootPassword(null, installinputs.rootpassword)) {
			this._impersonateRoot(session);;
			
			adminserver.installMysqlTables(session, installinputs);
			
			adminserver.installWebappConfig(session, installinputs);
			
			adminserver.installFinal();
			
			// reload application
			global.reload();
		}
	}
	
	handleApplicationConfigSubmit(req, session) {
		var global = this.global;
		var adminserver = this.adminserver;
		
		global.log('AdminControllers.handleApplicationConfigSubmit called');
		
		if (!session.hasSuperAdminPrivileges())
			throw 'only a super admin can change the application configuration';

		var config = global.config;
		
		
		config.rest_server_url = (req.body && req.body.rest_server_url ? req.body.rest_server_url : config.rest_server_url);
		config.rest_server_api_path = (req.body && req.body.rest_server_api_path ? req.body.rest_server_api_path : config.rest_server_api_path);
		
		config.web3_provider_url = (req.body && req.body.web3_provider_url ? req.body.web3_provider_url : config.web3_provider_url);
		config.web3_provider_port = (req.body && req.body.web3_provider_port ? req.body.web3_provider_port : config.web3_provider_port);
		
		config.mysql_host = (req.body && req.body.mysql_host ? req.body.mysql_host : config.mysql_host);
		config.mysql_port = (req.body && req.body.mysql_port ? req.body.mysql_port : config.mysql_port);
		
		global.saveJson('config', config);
		
		// reload application
		global.reload();
	}
	
	handleUsersSubmit(req, session) {
		var global = this.global;
		var adminserver = this.adminserver;
		
		var username = req.body.username;
		var useremail = req.body.useremail;
		var userpassword = req.body.password
		var confirmPassword = req.body.confirmPassword;
		
		if (userpassword != confirmPassword)
			throw 'password do not match';
		
		var useruuid = (req.body.useruuid ? req.body.useruuid : null);
		
		if (!useruuid) {
			adminserver.addUser(session, username, useremail, userpassword);
		}
		else {
			var operation = (req.body.operation ? req.body.operation : null);
			
			switch(operation) {
				case 'modify': {
					adminserver.saveUser(session, useruuid, username, useremail, userpassword);
				}
				break;
				
				case 'addkey': {
					var privatekey = req.body.privatekey;
					
					adminserver.addUserKey(session, useruuid, privatekey);
				}
				break;
				
				case 'deletekey': {
					var keyuuid = req.body.keyuuid;
					
					adminserver.deleteUserKey(session, useruuid, keyuuid);
				}
				break;
				
				default:
					break;
			}
		}
	}

}

module.exports = AdminControllers;
