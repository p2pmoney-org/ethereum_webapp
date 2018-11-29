/**
 * 
 */
'use strict';

var cryptoservice;


class Service {
	
	constructor() {
		this.name = 'crypto';
		this.global = null;
		
		this.cryptoserverinstance = null;
	}
	
	loadService() {
		this.global.log('loadService called for service ' + this.name);
		
		var global = this.global;
		

	}

	// optional  service functions

	// API
	
	// objects
	getCryptoServerInstance() {
		if (this.cryptoserverinstance)
			return this.cryptoserverinstance;
			
		var CryptoServer = require('./model/crypto-server.js');
		
		this.cryptoserverinstance = new CryptoServer(this);
		
		return this.cryptoserverinstance;
	}
	
	
	// static
	static getService() {
		if (cryptoservice)
			return cryptoservice;
		
		throw 'CryptoService has not been instantiated';
	}
		
	static instantiateService(global) {
		if (cryptoservice)
			throw 'CrytpoService has already been instantiated';
		
		cryptoservice = new Service();
		
		return cryptoservice;
	}
	
	
}

module.exports = Service;