/**
 * 
 */
'use strict';


class Server {
	
	constructor(service) {
		this.service = service;
		this.global = service.global;
		
		var Persistor = require('./interface/database-persistor.js');
		
		this.persistor =  new Persistor(service);
	}
	
	// persistence
	getPersistor() {
		return this.persistor;
	}
	
	async getGlobalAllParametersAsync() {
		return this.persistor.getGlobalAllParametersAsync();
	}
	
	getGlobalParameters(key) {
		return this.persistor.getGlobalParameters(key);
	}
	
	async getGlobalParametersAsync(key) {
		return this.persistor.getGlobalParametersAsync(key);
	}
	
	saveGlobalParameter(key, value) {
		// turn to string
		var valuestring = value.toString();
		var type = 0;
		
		var parameters = this.persistor.getGlobalParameters(key);
		
		if (parameters.length) {
			this.persistor.updateGlobalParameters(key, type, value);
		}
		else {
			this.persistor.putGlobalParameter(key, type, value);
		}
	}
	
	async saveGlobalParameterAsync(key, value) {
		// turn to string
		var valuestring = value.toString();
		var type = 0;
		
		var parameters = await this.persistor.getGlobalParametersAsync(key);
		
		if (parameters.length) {
			await this.persistor.updateGlobalParametersAsync(key, type, value);
		}
		else {
			await this.persistor.putGlobalParameterAsync(key, type, value);
		}
	}
	
	addGlobalParameter(key, value) {
		if ((!key) || (!value))
			return;
		
		// turn to string
		var valuestring = value.toString();
		var type = 0;

		if (key.length > 25)
		key = key.substring(0, 25); // cut key name to fit in `Key` varchar(25) NOT NULL,
		
		this.persistor.putGlobalParameter(key, type, value);
	}

	async addGlobalParameterAsync(key, value) {
		if ((!key) || (!value))
			return;
		
		// turn to string
		var valuestring = value.toString();
		var type = 0;

		if (key.length > 25)
		key = key.substring(0, 25); // cut key name to fit in `Key` varchar(25) NOT NULL,
		
		
		await this.persistor.putGlobalParameterAsync(key, type, value);
	}
}

module.exports = Server;