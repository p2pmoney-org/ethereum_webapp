'use strict';

var ethereum_erc20;

class Ethereum_erc20 {
	constructor() {
		this.load = null;
		
		this.initializing = false;
		this.initialized = false;
		
		this.initializationpromise = null;
	}
	
	init(callback) {
		console.log('ethereum_erc20 init called');
		
		var Ethereum_core = require('../ethereum_core');
		var ethereum_core = Ethereum_core.getObject();
		
		// load contracts
		var jsoncontent = require('./imports/build/contracts/TokenERC20.json');
		ethereum_core.putArtifact('./contracts/TokenERC20.json', jsoncontent);
		
		// create loader
		if (typeof window !== 'undefined') {
			// we are in react-native
			console.log('loading for react-native');
			
			var ReactNativeLoad = require( './js/react-native-load.js');

			this.load = new ReactNativeLoad();
		}
		else if (typeof global !== 'undefined') {
			console.log('loading for nodejs');
			
			// we are in nodejs
			var NodeLoad = require( './js/node-load.js');
			
			this.load = new NodeLoad();
		}

		var self = this;
		var promise;
		
		if (this.initializing === false) {
			this.initializing = true;
			
			this.initializationpromise = ethereum_core.init().then(function() {
				return new Promise(function (resolve, reject) {
					self.load.init(function() {
					console.log('ethereum_erc20 init finished');
					self.initialized = true;
					
					if (callback)
						callback(null, true);
					
					resolve(true);
					});
				});
			});
			
		}
		
		return this.initializationpromise;
	}
	
	getGlobalObject() {
		if (typeof window !== 'undefined') {
			// we are in react-native
			return window.simplestore.Global.getGlobalObject();
		}
		else if (typeof global !== 'undefined') {
			// we are in nodejs
			return global.simplestore.Global.getGlobalObject();
		}
		
	}
	

	// static methods
	static getObject() {
		if (ethereum_erc20)
			return ethereum_erc20;
		
		ethereum_erc20 = new Ethereum_erc20();
		
		return ethereum_erc20;
	}
}

module.exports = Ethereum_erc20;