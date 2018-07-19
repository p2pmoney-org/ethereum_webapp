/**
 * 
 */
'use strict';


class EthereumNode {
	constructor(session) {
		this.session = session;
	}
	
	//
	// Web3
	//
	getWeb3Instance() {
		var global = this.session.getGlobalInstance();
		return global.getWeb3Instance();
	}
	
	getWeb3Provider() {
		var global = this.session.getGlobalInstance();
		return global.getWeb3Provider();
	}
	
	// node
	web3_getNodeInfo() {
		var global = this.session.getGlobalInstance();
		
		global.log("EthereumNode.web3_getNodeInfo called");
		var web3 = this.getWeb3Instance();

		var islistening;
		var peercount;
		var issyncing;

		var promises = [];
		var promise;
		
		// islistening
		promise = web3.eth.net.isListening(function(error, result) {
			if (!error) {
				if(result !== false) {
					islistening = true;
				}
				else {
					islistening = false;
				}
			}
			else {
				islistening = null;
			}
			return result;
		});
		promises.push(promise);
		
		// peercount
		var promise =  web3.eth.net.getPeerCount(function(error, result) {
			if (!error) {
				peercount = result
			}
			else {
				peercount = -1;
			}
		});
		promises.push(promise);

		// issyncing
		promise = web3.eth.isSyncing(function(error, result) {
			if (!error) {
				if(result !== false) {
					issyncing = true;
				}
				else {
					issyncing = false;
				}
			}
			else {
				issyncing = null;
			}
			return result;
		});
		promises.push(promise);
		
		
		// all promises
		var finished = false;
		
		Promise.all(promises, function(res) {
			finished = true;
		});
		
		
		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}
		
		return {islistening: islistening, peercount: peercount, issyncing: issyncing};
	}
	
	
	// accounts
	web3_getAccountBalance(address) {
		var global = this.session.getGlobalInstance();
		
		global.log("EthereumNode.web3_getAccountBalance called for " + address);
		var web3 = this.getWeb3Instance();

		var balance;
		
		var finished = false;
		var promise = web3.eth.getBalance(address, function(error, result) {
			
			if (!error) {
				balance = result;
				
				finished = true;
			} else {
				balance = 'error: ' + error;
				
				global.log('Web3 error: ' + error);
				finished = true;

			}
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}

		
		return balance;
	}
	
	web3_getAccountCode(address) {
		var global = this.session.getGlobalInstance();
		
		global.log("EthereumNode.web3_getAccountCode called for " + address);
		var web3 = this.getWeb3Instance();

		var code;
		
		var finished = false;
		var promise = web3.eth.getCode(address, function(error, result) {
			
			if (!error) {
				code = result;
				
				finished = true;
			} else {
				code = 'error: ' + error;
				
				global.log('Web3 error: ' + error);
				finished = true;

			}
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}

		
		return code;
	}
	
	web3_unlockAccount(address, password, duration) {
		var global = this.session.getGlobalInstance();
		
		var web3 = this.getWeb3Instance();
		var res = web3.personal.unlockAccount(address, password, duration);
		
		return res;
	}
	
	web3_lockAccount(address) {
		var global = this.session.getGlobalInstance();
		
		var web3 = this.getWeb3Instance();
		web3.personal.lockAccount(address);
	}
	
	// blocks
	web3_getHighestBlockNumber() {
		var self = this;
		var session = this.session;
		var global = this.session.getGlobalInstance();

		var blocknumber = -1;
		
		var finished = false;
		var promise = new Promise(function (resolve, reject) {
			try {
				var web3 = self.getWeb3Instance();
				
				return web3.eth.getBlockNumber( function(err, res) {
					if (!err) {
						blocknumber = res;
						finished = true;
						
						return resolve(res);
					}
					else {
						finished = true;

						reject('web3 error: ' + err);
					}
				
				});
			}
			catch(e) {
				reject('web3 exception: ' + e);
			}
			
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}
		
		return blocknumber;
	}
	
	
	web3_getBlock(blockid, bWithTransactions) {
		var self = this;
		var session = this.session;
		var global = this.session.getGlobalInstance();

		var blockjson;
		
		var finished = false;
		var promise = new Promise(function (resolve, reject) {
			try {
				var web3 = self.getWeb3Instance();
				
				return web3.eth.getBlock(blockid, bWithTransactions, function(err, res) {
					if (!err) {
						blockjson = res;
						finished = true;
						return resolve(res);
					}
					else {
						finished = true;
						reject('web3 error: ' + err);
					}
				
				});
			}
			catch(e) {
				reject('web3 exception: ' + e);
			}
			
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}
		
		return blockjson;
	}

	web3_getTransaction(hash) {
		var self = this
		var session = this.session;
		var global = this.session.getGlobalInstance();

		var txjson;

		var finished = false;
		var promise = new Promise(function (resolve, reject) {
			try {
				var web3 = self.getWeb3Instance();
				
				return web3.eth.getTransaction(hash, function(err, res) {
					if (!err) {
						txjson = res;
						finished = true;
						return resolve(res);
					}
					else {
						finished = true;
						reject('web3 error: ' + err);
					}
				
				});
			}
			catch(e) {
				reject('web3 exception: ' + e);
			}
			
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}
		
		return txjson;
	}
	
	web3_getTransactionReceipt(hash) {
		var self = this
		var session = this.session;
		var global = this.session.getGlobalInstance();

		var txjson;

		var finished = false;
		var promise = new Promise(function (resolve, reject) {
			try {
				var web3 = self.getWeb3Instance();
				
				return web3.eth.getTransactionReceipt(hash, function(err, res) {
					if (!err) {
						txjson = res;
						finished = true;
						return resolve(res);
					}
					else {
						finished = true;
						reject('web3 error: ' + err);
					}
				
				});
			}
			catch(e) {
				reject('web3 exception: ' + e);
			}
			
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}
		
		return txjson;
	}
	
	// contracts
	web3_contract_load_at(abi, address) {
		var global = this.session.getGlobalInstance();
		var web3 = this.getWeb3Instance();

		// Web3 < 1.0
		var web3_contract_instance = web3.eth.contract(abi).at(address);
		// Web3 > 1.0
		//var web3_contract_instance = new web3.eth.Contract(abi, address);
		
		return web3_contract_instance;
	}
	
	web3_contract_dynamicMethodCall(instance, abidef, params) {
		var methodname = abidef.name;
		var signature = abidef.signature;
		
		var result = null;
		
		// Web3 < 1.0
		if (instance[methodname])
		// Web3 > 1.0
		//if (!instance.methods[signature])
			return result;
		
		var finished = false;
		var promise = new Promise( function(resolve, reject) {
	
			// Web3 < 1.0
			var ret = instance[methodname].call(...params, function (err, res) {
			// Web3 > 1.0
			//var ret = instance.methods[signature](...params).call(function(err, res) {
				if (!res) {
					finished = true;
					result = null;
					
					return reject(null);
				}
				
				finished = true;
				result = res;
				
				return resolve(res);
				
			});
		});
		
		
		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}
		
		return result;
	}
	
	
	
	//
	// Truffle
	//
	getTruffleContractClass() {
		var TruffleContract = require('truffle-contract');

		return TruffleContract;
	}
	
	truffle_loadArtifact(artifactpath) {
		var global = this.session.getGlobalInstance() ;
		
		global.log("EthereumNode.truffle_loadArtifact called for " + artifactpath);
		
		var process = require('process');
		var fs = require('fs');
		var path = require('path');
		
		var dapp_root_dir = global.dapp_root_dir;
		
		var truffle_relative_build_dir = './build';
		
		var build_dir = path.join(dapp_root_dir, truffle_relative_build_dir);
		
		var jsonPath;
		var jsonFile;

		var data;
		
		try {
			jsonPath = path.join(build_dir, artifactpath);

			global.log("reading artifact " + jsonPath);
			
			//jsonFile = fs.readFileSync(jsonPath, 'utf8');
			jsonFile = fs.readFileSync(jsonPath);
			
			data = JSON.parse(jsonFile);
			
		}
		catch(e) {
			console.log('exception reading json file: ' + e.message); 
		}
		
		return data;
	}
	
	truffle_loadContract(artifact) {
		var global = this.session.getGlobalInstance() ;
		
		global.log("EthereumNode.truffle_loadContract called");
		//global.log('artifact is ' + JSON.stringify(artifact));
		
		var TruffleContract = this.getTruffleContractClass();
		var trufflecontract = TruffleContract(artifact);
		  
		var web3provider = this.getWeb3Provider();

		trufflecontract.setProvider(web3provider);
		
		return trufflecontract;
	}
	
	truffle_contract_at(trufflecontract, address) {
		var global = this.session.getGlobalInstance() ;
		
		global.log("EthereumNode.truffle_contract_at called for address " + address);
		
		var finished = false;
		var contractinstance = null;

		try {
			trufflecontract.at(address)
				.then(instance=> {
					contractinstance = instance;
					finished = true;
				})				
				.catch(err => {
					finished = true;
				    global.log('catched error in EthereumNode.truffle_contract_at ' + err);
				});
		}
		catch(e) {
			global.log('error in truffle_contract_at(): ' + e);
		}
		
		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}
		
		return contractinstance;
	}

	truffle_contract_new(trufflecontract, params) {
		var global = this.session.getGlobalInstance() ;
		
		var finished = false;
		var contractinstance = null;

		try {
			trufflecontract.new(...params)
			.then(instance=> {
				contractinstance = instance;
				finished = true;
			})				
			.catch(err => {
				finished = true;
			    global.log('catched error in EthereumNode.truffle_contract_new ' + err);
			});

		}
		catch(e) {
			global.log('error in truffle_contract_new(): ' + e);
		}
		
		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}
		
		return contractinstance;
	}

	truffle_method_call(constractinstance, methodname, params) {
		var global = this.session.getGlobalInstance() ;
		
		var funcname = constractinstance[methodname];
		
		var finished = false;
		var result = null;
		
		var promise = funcname.call(...params).then(function(res){
			
			if (res) {
				result = res;
				
				finished = true;
			} else {
				result = null;
				
				global.log('error: ' + err);
				finished = true;

			}
		}).catch(err => {
			finished = true;
		    global.log('catched error in EthereumNode.truffle_method_call ' + err);
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}

		return result;
	}
	
	truffle_method_sendTransaction(constractinstance, methodname, params) {
		var global = this.session.getGlobalInstance() ;
		
		var funcname = constractinstance[methodname];
		
		var finished = false;
		var result = null;
		
		var promise = funcname.sendTransaction(...params).then(function(res){
			
			if (res) {
				result = res;
				
				finished = true;
			} else {
				result = null;
				
				global.log('error: ' + err);
				finished = true;

			}
		}).catch(err => {
			finished = true;
		    global.log('catched error in EthereumNode.truffle_method_sendTransaction ' + err);
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}

		return result;
	}
}

module.exports = EthereumNode;