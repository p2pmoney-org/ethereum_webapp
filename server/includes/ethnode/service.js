/**
 * 
 */
'use strict';


class Service {
	
	constructor() {
		this.name = 'ethnode';
		this.global = null;
	}
	
	loadService() {
		this.global.log('loadService called for service ' + this.name);
		
		this.EthereumNode = require('./model/ethnode.js');
	}

	getEthereumNodeInstance(session) {
		return new this.EthereumNode(session);
	}

}

module.exports = Service;