/**
 * 
 */
'use strict';


class Service {
	
	constructor() {
		this.name = 'client-container';
		this.global = null;
		
		this.clientcontainerserver = null;
	}
	
	loadService() {
		var global = this.global;
		
		global.log('loadService called for service ' + this.name);
		
	}
	
	// optional  service functions
	registerHooks() {
		console.log('registerHooks called for ' + this.name);
		
		var global = this.global;
		
		global.registerHook('registerRoutes_hook', this.name, this.registerRoutes_hook);
	}
	
	//
	// hooks
	//
	registerRoutes_hook(result, params) {
		var global = this.global;

		global.log('registerRoutes_hook called for ' + this.name);
		
		var app = params[0];
		var global = params[1];
		
		//
		// ClientContainer routes
		//
		var ClientContainerRoutes = require( './routes/routes.js');
			
		var clientcontainerroutes = new ClientContainerRoutes(app, global);
		
		clientcontainerroutes.registerRoutes();
		
		result.push({service: this.name, handled: true});
	}
	

	
	// service functions
	_getClientContainerServer() {
		if (this.clientcontainerserver)
			return this.clientcontainerserver;
		
		var ClientContainerServer = require('./model/client-container-server.js');
		
		this.clientcontainerserver = new ClientContainerServer(this);
		
		// initialize container server
		var _global = this.global
		var finished = false;
		
		this.clientcontainerserver.init(function(err, res) {
			_global.log('container server is initialized');
			
			finished = true;
		});
		
		// wait to turn into synchronous call
		while(finished === false)
		{_global.deasync().runLoopOnce();}

		return this.clientcontainerserver;
	}
	
	getClientContainer(serversession) {
		return this._getClientContainerServer().getClientContainer(serversession);
	}



}

module.exports = Service;