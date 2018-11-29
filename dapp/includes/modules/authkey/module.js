'use strict';

var Module = class {
	
	constructor() {
		this.name = 'authkey';
		
		this.global = null; // put by global on registration
		this.isready = false;
		this.isloading = false;
		
		this.authkey_server_access_instance = null;
		
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
		
		var moduleroot = './includes/modules/authkey';

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
		
		global.registerHook('preFinalizeGlobalScopeInit_hook', 'authkey', this.preFinalizeGlobalScopeInit_hook);
		global.registerHook('isSessionAnonymous_hook', 'authkey', this.isSessionAnonymous_hook);
	}
	
	//
	// hooks
	//
	preFinalizeGlobalScopeInit_hook(result, params) {
		console.log('preFinalizeGlobalScopeInit_hook called for ' + this.name);
		
		var global = this.global;

		result.push({module: 'authkey', handled: true});
		
		return true;
	}
	
	isSessionAnonymous_hook(result, params) {
		console.log('isSessionAnonymous_hook called for ' + this.name);
		
		var global = this.global;
		
		var session = params[0];
		
		if (!session[this.name]) session[this.name] = {};
		var sessioncontext = session[this.name];
		
		var now = Date.now();
		
		if (sessioncontext.authenticatedupdate && ((now - sessioncontext.authenticatedupdate) < 5000)) {
			// update only every 5s
			result.push({module: 'authkey', handled: true});
			
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
						});
					}
					
				}
				
			}

		});

		result.push({module: 'authkey', handled: true});
		
		return true;
	}
	
	//
	// API
	//
	getAuthKeyInterface() {
		var global = this.global;
		
		var authkeyinterface = null;

		var result = []; 
		var inputparams = [];
		
		inputparams.push(this);
		
		var ret = global.invokeHooks('getAuthKeyInterface_hook', result, inputparams);
		
		if (ret && result[0]) {
			authkeyinterface = result[0];
		}
		else {
			authkeyinterface = new this.AuthKeyInterface(this);
		}
		
		return authkeyinterface;
	}
	
	getAuthKeyServerAccessInstance(session) {
		if (this.authkey_server_access_instance)
			return this.authkey_server_access_instance;
		
		console.log('instantiating AuthKeyServerAccess');
		
		var global = this.global;

		var result = []; 
		var inputparams = [];
		
		inputparams.push(this);
		
		var ret = global.invokeHooks('getAuthKeyServerAccessInstance_hook', result, inputparams);
		
		if (ret && result[0]) {
			this.authkey_server_access_instance = result[0];
		}
		else {
			this.authkey_server_access_instance = new this.Xtra_AuthKeyServerAccess(session);
		}

		
		return this.authkey_server_access_instance;
		
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