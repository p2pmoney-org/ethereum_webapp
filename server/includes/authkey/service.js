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
	}
	
	loadService() {
		this.global.log('loadService called for service ' + this.name);
	}


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
		
		this.authenticationserverinstance = new AuthenticationServer(this.global);
		
		return this.authenticationserverinstance;
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