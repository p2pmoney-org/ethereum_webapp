/**
 * 
 */
'use strict';

var authkeyservice;


class AuthKeyService {
	
	constructor(global) {
		this.global = global;
	}
	
	getVersion() {
		var global = this.global;
		
		var mysqlcon = global.getMySqlConnection();
		
		var query = 'SHOW TABLES;';
		
		var result = mysqlcon.execute(query);
		
        return JSON.stringify(result.rows);
	}
	
	static getService() {
		if (authkeyservice)
			return authkeyservice;
		
		throw 'AuthKeyService has not been instantiated';
	}
		
	static instantiateService(global) {
		if (authkeyservice)
			throw 'AuthKeyService has already been instantiated';
		
		authkeyservice = new AuthKeyService(global);
		
		return authkeyservice;
	}
	
	
}

module.exports = AuthKeyService;