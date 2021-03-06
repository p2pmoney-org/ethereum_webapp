/**
 * 
 */
'use strict';

class Web3Provider {
	constructor(session, web3providerurl, ethereumnodeaccessinstance) {
		this.session = session;
		this.web3providerurl = web3providerurl;
		
		this.config = {};
		
		this.uuid = session.guid();
		
		this.varmap = Object.create(null);
		
		this.ethereumnodeaccessinstance = ethereumnodeaccessinstance;
	}
	
	getConfig() {
		return this.config;
	}
	
	setConfig(config) {
		this.config = config;
	}
	
	setVariable(key, value) {
		this.varmap[key] = value;
	}
	
	getVariable(key) {
		if (key in this.varmap) {
			return this.varmap[key];
		}
	}
	
	getUUID() {
		return this.uuid;
	}
	
	getWeb3ProviderUrl() {
		return this.web3providerurl;
	}
	
	getEthereumNodeInstance() {
		if (this.ethereumnodeaccessinstance.web3providerurl != this.web3providerurl)
			throw 'ethereum node access instance is no longer set with the correct url';
		
		return this.ethereumnodeaccessinstance;
	}

}

module.exports = Web3Provider;
