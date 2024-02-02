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
			this.persistor.updateGlobalParameter(key, type, value);
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
			await this.persistor.updateGlobalParameterAsync(key, type, value);
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
		
		this.persistor.putGlobalParameter(key, type, value);
	}

	async addGlobalParameterAsync(key, value) {
		if ((!key) || (!value))
			return;
		
		// turn to string
		var valuestring = value.toString();
		var type = 0;
		
		await this.persistor.putGlobalParameterAsync(key, type, value);
	}
}

module.exports = Server;