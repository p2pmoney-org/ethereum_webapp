'use strict';

var Module = class {
	
	constructor() {
		this.name = 'authkey';
		
		this.global = null; // put by global on registration
		this.isready = false;
		this.isloading = false;
		
		this.authkeyinterface = null;
		//this.authkey_server_access_instance = null;
		
		this.controllers = null;
	}
	
	init() {
		console.log('module init called for ' + this.name);
		
		this.isready = true;
	}
	
	// compulsory  module functions
	loadModule(parentscriptloader, callback) {
		console.log('loadModule called for module ' + this.name);

		if (this.isloading)
			return;
			
		this.isloading = true;

		var self = this;
		var global = this.global;

		// authkey
		var modulescriptloader = global.getScriptLoader('authkeyloader', parentscriptloader);
		
		
		var xtraroot = './js/src/xtra';
		
		var interfaceroot = xtraroot + '/interface';

		modulescriptloader.push_script( interfaceroot + '/authkey-server-access.js');
		
		//var moduleroot = './includes/modules/authkey';
		var moduleroot = xtraroot + '/modules/authkey';

		modulescriptloader.push_script( moduleroot + '/authkey-interface.js');

		//modulescriptloader.push_script( moduleroot + '/control/controllers.js');

		modulescriptloader.push_script( moduleroot + '/model/user.js');
		
		modulescriptloader.load_scripts(function() { self.init(); if (callback) callback(null, self); });
		
		return modulescriptloader;
	}
	
	isReady() {
		return this.isready;
	}

	hasLoadStarted() {
		return this.isloading;
	}

	// optional  module functions
	registerHooks() {
		console.log('module registerHooks called for ' + this.name);
		
		var global = this.global;
		
		global.registerHook('preFinalizeGlobalScopeInit_hook', this.name, this.preFinalizeGlobalScopeInit_hook);
		
		
		// authkey actions
		global.registerHook('isSessionAnonymous_hook', this.name, this.isSessionAnonymous_hook);

		global.registerHook('getSessionCryptoKeyObjects_hook', this.name, this.getSessionCryptoKeyObjects_hook);
		global.registerHook('getAccountObjects_hook', this.name, this.getAccountObjects_hook);
		
		
		// popup login box
		global.registerHook('handleShowLoginBox_hook', this.name, this.handleShowLoginBox_hook);
		
		// angular login page
		global.registerHook('alterLoginForm_hook', this.name, this.alterLoginForm_hook);
		global.registerHook('handleLoginSubmit_hook', this.name, this.handleLoginSubmit_hook);

		global.registerHook('alterLogoutForm_hook', this.name, this.alterLogoutForm_hook);
		global.registerHook('handleLogoutSubmit_hook', this.name, this.handleLogoutSubmit_hook);

	}
	
	postRegisterModule() {
		if (!this.isloading) {
			var global = this.global;
			var self = this;
			var rootscriptloader = global.getRootScriptLoader();
			
			this.loadModule(rootscriptloader, function() {
				if (self.registerHooks)
				self.registerHooks();
			});
		}
	}
	
	
	//
	// hooks
	//
	preFinalizeGlobalScopeInit_hook(result, params) {
		console.log('preFinalizeGlobalScopeInit_hook called for ' + this.name);
		
		var global = this.global;

		result.push({module: this.name, handled: true});
		
		return true;
	}
	
	_getAppObject() {
		var global = this.global;
		if (global.getAppObject)
			return global.getAppObject();
	}

	isSessionAnonymous_hook(result, params) {
		console.log('isSessionAnonymous_hook called for ' + this.name);
		
		if (this.isready === false)
			return false;
		
		var global = this.global;
		var app = this._getAppObject();
		
		var session = params[0];
		
		if (!session[this.name]) session[this.name] = {};
		var sessioncontext = session[this.name];
		
		var now = Date.now();
		
		if (sessioncontext.authenticatedupdate && ((now - sessioncontext.authenticatedupdate) < 5000)) {
			// update only every 5s
			result.push({module: this.name, handled: true});
			
			return true;
		}
		
		sessioncontext.authenticatedupdate = now;

		var authkeyinterface = this.getAuthKeyInterface();
		var currentanonymousflag = (session.user == null);
		
		console.log('checking session status on server for ' + session.getSessionUUID());
		console.log('currentanonymousflag is ' + currentanonymousflag);
		
		authkeyinterface.session_status(session, function(err, sessionstatus) {
			if (sessionstatus) {
				if (sessionstatus['isauthenticated'] == false) {
					console.log('session ' + session.getSessionUUID() + ' is not authenticated on the server');
					
					if (currentanonymousflag === false) {
						console.log('disconnecting user');
						
						session.disconnectUser();
						
						alert(global.t('your session has expired'));
		
						// go to login page
						var mvcmodule = global.getModuleObject('mvc');
						
						var mvccontroller = mvcmodule.getControllersObject();
						
						mvccontroller.gotoLoginPage();
					}
				}
				else {
					console.log('session ' + session.getSessionUUID() + ' is authenticated on the server');

					if (currentanonymousflag === true) {
						// session bootstrapped from external call
						console.log('connecting user');

						authkeyinterface.load_user_in_session(session, function(err, sessionstatus) {
							if (!err) {
								console.log('user loaded from server');
								
								// go to home page
								var mvcmodule = global.getModuleObject('mvc');
								
								var mvccontroller = mvcmodule.getControllersObject();
								
								mvccontroller.refreshPage();
							}
							else {
								console.log('error while loading user from server: ' + err);
							}
						})
						.then(function(res) {
							var authenticated = (res['status'] == '1' ? true : false);
							
							console.log("authentication is " + authenticated);
							
							if (authenticated) {
								
								// authenticated (and crypto-keys have been loaded)
								// we get list of accounts (that could be encrypted)
								var storagemodule = global.getModuleObject('storage-access');
								var storageaccess = storagemodule.getStorageAccessInstance(session);
								var user = session.getSessionUserObject();
								
								return storageaccess.account_session_keys( function(err, res) {
									
									if (res && res['keys']) {
										var keys = res['keys'];
										
										session.readSessionAccountFromKeys(keys);
									}
							
									if (app) app.refreshDisplay();
								});
								
							}
							else {
								alert("Could not authenticate you with these credentials!");
							}
							
						})
						.catch(function (err) {
							alert(err);
						});
					}
					
				}
				
			}

		});

		result.push({module: this.name, handled: true});
		
		return true;
	}
	
	getSessionCryptoKeyObjects_hook(result, params) {
		console.log('getSessionCryptoKeyObjects_hook called for ' + this.name);
		
		var global = this.global;
		var self = this;
		
		var authkeyinterface = this.getAuthKeyInterface();

		var session = params[0];
		
		var nextget = result.get;
		result.get = function(err, keyarray) {

			authkeyinterface.read_cryptokeys(session, function(err, mykeyarray) {
				var newkeyarray = (mykeyarray && (mykeyarray.length > 0) ? keyarray.concat(mykeyarray) : keyarray);
				
				if (!err) {
					if (nextget)
						nextget(null, newkeyarray);
				}
				else {
					if (nextget)
						nextget(err, null);
				}
			});
			
			
		}; // chaining of get function

		result.push({module: this.name, handled: true});
		
		return true;
	}
	
	getAccountObjects_hook(result, params) {
		console.log('getAccountObjects_hook called for ' + this.name);

		var global = this.global;
		var self = this;
		
		var session = params[0];
		
		var storagemodule = global.getModuleObject('storage-access');
		var storageaccess = storagemodule.getStorageAccessInstance(session);

		var nextget = result.get;
		result.get = function(err, keyarray) {

			storageaccess.account_session_keys(function(err, res) {
				var mykeyarray;
				
				if (res && res['keys']) {
					var keys = res['keys'];
					
					mykeyarray = session.readSessionAccountFromKeys(keys);
				}
				
				var newkeyarray = (mykeyarray && (mykeyarray.length > 0) ? keyarray.concat(mykeyarray) : keyarray);
				
				if (!err) {
					if (nextget)
						nextget(null, newkeyarray);
				}
				else {
					if (nextget)
						nextget(err, null);
				}
			})
			.catch(function (err) {
				console.log('error in getAccountObjects_hook: ' + err);
			});;
			
			
		}; // chaining of get function
		
		result.push({module: this.name, handled: true});
		
		return true;
	}
	
	// popup login
	handleShowLoginBox_hook(result, params) {
		console.log('handleShowLoginBox_hook called for ' + this.name);
		
		this.displayIdentificationBox();
		
		result.push({module: 'xtraconfig', handled: true});
		
		return true;
	}
	
	displayIdentificationBox() {

		var username = prompt("Enter username", "");
		var password = prompt("Enter password", "");

		this._authenticate(username, password);
	}
	
	_authenticate(username, password) {
		var global = this.global;
		
		var app = this._getAppObject();
		
		var commonmodule = global.getModuleObject('common');
		var session = commonmodule.getSessionObject();

		if (username != null) {
			var authkeymodule = global.getModuleObject('authkey');
			var authkeyinterface = authkeymodule.getAuthKeyInterface();
			
			authkeyinterface.authenticate(session, username, password)
			.then(function(res) {
				var authenticated = (res['status'] == '1' ? true : false);
				
				console.log("authentication is " + authenticated);
				
				if (authenticated) {
					
					// authenticated (and crypto-keys have been loaded)
					// we get list of accounts (that could be encrypted)
					var storagemodule = global.getModuleObject('storage-access');
					var storageaccess = storagemodule.getStorageAccessInstance(session);
					var user = session.getSessionUserObject();
					
					return storageaccess.account_session_keys( function(err, res) {
						
						if (res && res['keys']) {
							var keys = res['keys'];
							
							session.readSessionAccountFromKeys(keys);
						}
				
						if (app) app.refreshDisplay();
					});
					
				}
				else {
					alert("Could not authenticate you with these credentials!");
				}
				
			})
			.catch(function (err) {
				alert(err);
			});
			
			
		}	
		
	}
	
	_logout() {
		var global = this.global;
		
		var app = this._getAppObject();
		
		var commonmodule = global.getModuleObject('common');
		var session = commonmodule.getSessionObject();

		if (!session.isAnonymous()) {
			var authkeymodule = global.getModuleObject('authkey');
			var authkeyinterface = authkeymodule.getAuthKeyInterface();
			
			authkeyinterface.logout(session)
			.then(function(res) {
				var loggedout = (res['status'] == '1' ? true : false);
				
				if (loggedout) {
					
					if (app) app.refreshDisplay();
					
				}
				else {
					alert("Could not log out on authentication server!");
				}
				
			})
			.catch(function (err) {
				alert(err);
			});
			
			
		}	
		
	}
	
	// angular login page
	alterLoginForm_hook(result, params) {
		console.log('alterLoginForm_hook called for ' + this.name);
		
		var global = this.global;

		var $scope = params[0];
		var logoutform = params[1];

		// remove private key input
		var privkeyspan = document.getElementById('privkey-span');
		
		if ( privkeyspan ) {
			privkeyspan.parentNode.removeChild(privkeyspan);
		}
		
		// add our inputs
		var formdiv = document.createElement("div");
		logoutform.insertBefore(formdiv, logoutform.firstChild);

		var span;
		var label;
		var textbox;

		// name text box
		span = document.createElement("span");
		formdiv.appendChild(span);

		label = document.createElement("Label");
		label.innerHTML = global.t("User name:");
		label.setAttribute('for',"username");
		
		span.appendChild(label);
		
		textbox = document.createElement("input"); //input element, text
		textbox.setAttribute('type',"text");
		textbox.setAttribute('name',"username");
		textbox.classList.add('form-textbox');
		textbox.classList.add('form-username-input');
		
		span.appendChild(textbox);
		
		// password
		span = document.createElement("span");
		formdiv.appendChild(span);

		label = document.createElement("Label");
		label.innerHTML = global.t("Password:");
		label.setAttribute('for',"password");
		
		span.appendChild(label);
		
		textbox = document.createElement("input"); //input element, text
		textbox.setAttribute('type',"password");
		textbox.setAttribute('name',"password");
		textbox.classList.add('form-textbox');
		textbox.classList.add('form-password-input');
		
		span.appendChild(textbox);
		
		result.push({module: 'xtraconfig', handled: true});
		
		return true;
	}
	
	handleLoginSubmit_hook(result, params) {
		console.log('handleLoginSubmit_hook called for ' + this.name);

		var $scope = params[0];
		
		var username = this.getFormValue("username");
		var password = this.getFormValue("password");
		
		this._authenticate(username, password);

		result.push({module: this.name, handled: true});
		
		return true;
	}
	
	alterLogoutForm_hook(result, params) {
		console.log('alterLogoutForm_hook called for ' + this.name);
	}
	
	handleLogoutSubmit_hook(result, params) {
		console.log('handleLogoutSubmit_hook called for ' + this.name);
		
		this._logout();
		
		result.push({module: this.name, handled: true});
		
		return true;
	}

	getFormValue(formelementname) {
		var value = document.getElementsByName(formelementname)[0].value;
		
		return value;
	}
	

	
	//
	// API
	//
	getAuthKeyInterface() {
		var global = this.global;
		
		if (this.authkeyinterface)
			return this.authkeyinterface;
		
		var result = []; 
		var inputparams = [];
		
		inputparams.push(this);
		
		var ret = global.invokeHooks('getAuthKeyInterface_hook', result, inputparams);
		
		if (ret && result[0]) {
			this.authkeyinterface = result[0];
		}
		else {
			this.authkeyinterface = new this.AuthKeyInterface(this);
		}
		
		return this.authkeyinterface;
	}
	
	getAuthKeyServerAccessInstance(session) {
		if (session.authkey_server_access_instance)
			return session.authkey_server_access_instance;
		
		console.log('instantiating AuthKeyServerAccess');
		
		var global = this.global;

		var result = []; 
		var inputparams = [];
		
		inputparams.push(this);
		inputparams.push(session);
		
		result[0] = new AuthKeyServerAccess(session);
		
		// call hook to let modify or replace instance
		var ret = global.invokeHooks('getAuthKeyServerAccessInstance_hook', result, inputparams);
		
		if (ret && result[0]) {
			session.authkey_server_access_instance = result[0];
		}
		else {
			//this.authkey_server_access_instance = new this.AuthKeyServerAccess(session);
			// because load sequence of module and interface is not predictable
			session.authkey_server_access_instance = new AuthKeyServerAccess(session);
		}

		
		return session.authkey_server_access_instance;
		
	}
	

	//
	// control
	//
	
	getControllersObject() {
		if (this.controllers)
			return this.controllers;
		
		this.controllers = new this.Controllers(this);
		
		return this.controllers;
	}

	//
	// model
	//
	
	
}

GlobalClass.getGlobalObject().registerModuleObject(new Module());

// dependencies
GlobalClass.getGlobalObject().registerModuleDepency('authkey', 'common');