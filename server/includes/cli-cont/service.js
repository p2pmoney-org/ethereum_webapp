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
		this.global.log('loadService called for service ' + this.name);
		
	}
	
	_getClientContainerServer() {
		if (this.clientcontainerserver)
			return this.clientcontainerserver;
		
		var ClientContainerServer = require('./model/client-container-server.js');
		
		this.clientcontainerserver = new ClientContainerServer(this);
		
		return this.clientcontainerserver;
	}
	
	getClientContainer(serversession) {
		return this._getClientContainerServer().getClientContainer(serversession);
	}



}

module.exports = Service;