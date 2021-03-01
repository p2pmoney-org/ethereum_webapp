/**
 * 
 */
'use strict';

class ArtifactProxy {
	constructor(ethnode, artifactuuid, artifact, artifactpath) {
		this.ethnode = ethnode;
		
		this.artifactuuid = artifactuuid;
		
		this.artifactpath = artifactpath;
		
		this.artifact = artifact;
		
		if (!artifact['abi'])
			throw 'error no abi defined';
		
	}
	
	getArtifactPath() {
		return this.artifactpath;
	}
	
	getContractName() {
		return this.artifact['contractName'];
	}
	
	getAbi() {
		return this.artifact['abi'];
	}
	
	getAbiUUID() {
		if (this.abiuuid)
			return this.abiuuid;
		
		var abi = this.getAbi();
		this.abiuuid = this.ethnode._getAbiUUID(abi);
		
		return this.abiuuid;
	}
	
	getByteCode() {
		return this.artifact['bytecode'];
	}
	
	getUUID() {
		return this.artifactuuid;
	}
}

class ContractProxy {
	constructor(artifact, artifactuuid) {
		this.contractuuid = null;
		
		this.artifact = artifact;
		this.artifactuuid = artifactuuid;
	}
	
	getUUID() {
		return this.contractuuid;
	}
	
	getAbi() {
		return this.artifact.getAbi();
	}
	
	getAbiUUID() {
		var abiuuid = this.artifact.getAbiUUID();
		
		return abiuuid;
	}

	getByteCode() {
		return this.artifact.getByteCode();
	}

	getContractName() {
		return this.artifact.getContractName();
	}
}

class ContractInstanceProxy{
	constructor(contractuuid, address, contract, instance) {
		this.contractuuid = contractuuid;
		this.address = address;
		
		this.contract = contract;
		
		this.contractinstanceuuid = null;
		this.web3contractinstance = instance;
	}
	
	getUUID() {
		return this.contractinstanceuuid;
	}
	
	getContractUUID() {
		return this.contractuuid;
	}
	
	getAddress() {
		return this.address;
	}
	
	getAbi() {
		return this.contract.getAbi();
	}
	
	getAbiUUID() {
		return this.contract.getAbiUUID();
	}
	
	getInstance() {
		return this.web3contractinstance;
	}
}


class EthereumNode {
	constructor(session, web3providerurl) {
		this.session = session;
		
		var Persistor = require('./interface/database-persistor.js');
		
		this.persistor =  new Persistor(session);
		
		this.web3_version = "1.0.x";
		//this.web3_version = "0.20.x";
		
		this.web3providerurl = web3providerurl;
		this.web3instance = null;
	}
	
	getEthereumJsClass() {
		var ethereumjs;
		
		ethereumjs = require('ethereum.js');
		ethereumjs.Util = require('ethereumjs-util');
		ethereumjs.Wallet = require('ethereumjs-wallet');
		
		ethereumjs.Tx = require('ethereumjs-tx');

		ethereumjs.Buffer = {};
		ethereumjs.Buffer.Buffer = Buffer.from;
		ethereumjs.Buffer.Buffer.from = Buffer.from;
		
		return ethereumjs;
	}
	
	createEthereumTransactionInstance() {
		var session = this.session
		var EthereumTransaction = require('./ethereumtransaction.js');
		
		return new EthereumTransaction(session);
	}
	
	signEthereumTransaction(ethtransaction) {
		var session = this.session
		var global = session.getGlobalInstance();

		var result;
		var finished = false;
		
		new Promise((resolve, reject) => {
			
			var web3 = this.getWeb3Instance();

			var fromaddress = ethtransaction.getFromAddress();
			var toaddress = ethtransaction.getToAddress();
			
			var amount = ethtransaction.getValue();
			var gas = ethtransaction.getGas();
			var gasPrice = ethtransaction.getGasPrice();
			
			var txdata = ethtransaction.getData();
			var nonce = ethtransaction.getNonce();

			
			var txjson = ethtransaction.getTxJson();
			
			
			if (ethtransaction.canSignTransaction()) {
				// signing the transaction
				var ethereumjs = this.getEthereumJsClass();
				
				var hexprivkey = ethtransaction.getFromPrivateKey();
				
				var privkey = hexprivkey.substring(2);
				var bufprivkey = ethereumjs.Buffer.Buffer.from(privkey, 'hex');

				
				// signing
				if (this.web3_version == "1.0.x") {
					// Web3 > 1.0

					// turn gas, gasprice and value to hex
					// not to receive "insufficient funds for gas * price + value"
					txjson.gas = web3.utils.toHex(gas.toString());
					txjson.gasPrice = web3.utils.toHex(gasPrice.toString());
					txjson.value = web3.utils.toHex((txjson.value ? txjson.value.toString() : 0));
					
				}
				else {
					// Web3 == 0.20.x

					// turn gas, gasprice and value to hex
					// not to receive "insufficient funds for gas * price + value"
					txjson.gas = web3.toHex(gas.toString());
					txjson.gasPrice = web3.toHex(gasPrice.toString());
					txjson.value = web3.toHex(txjson.value.toString());
					
				}
				
				var tx = new ethereumjs.Tx(txjson);
				
				
				web3.eth.getTransactionCount(fromaddress, (err, count) => {
					
					if (!err) {
						txjson.nonce = (nonce ? nonce : count);
						
						var tx = new ethereumjs.Tx(txjson);
						
						tx.sign(bufprivkey);

						var raw = '0x' + tx.serialize().toString('hex');
						
						ethtransaction.setRawData(raw);
						
						resolve(raw);
					}
					else {
						reject(err, null);
					}
				});
			}
			else {
				throw 'transaction can not be signed';
			}
		})
		.then((res) => {
			result = true;
			
			finished = true;
		})
		.catch(err => {
			global.log('error in EthereumNode.signEthereumTransaction: ' + err);
			
			result = false;
					
			finished = true;
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce();}

		return result;

	}

	async signEthereumTransactionAsync(ethtransaction) {
		var session = this.session
		var global = session.getGlobalInstance();

		var result;

		return new Promise((resolve, reject) => {
			
			var web3 = this.getWeb3Instance();

			var fromaddress = ethtransaction.getFromAddress();
			var toaddress = ethtransaction.getToAddress();
			
			var amount = ethtransaction.getValue();
			var gas = ethtransaction.getGas();
			var gasPrice = ethtransaction.getGasPrice();
			
			var txdata = ethtransaction.getData();
			var nonce = ethtransaction.getNonce();

			
			var txjson = ethtransaction.getTxJson();
			
			
			if (ethtransaction.canSignTransaction()) {
				// signing the transaction
				var ethereumjs = this.getEthereumJsClass();
				
				var hexprivkey = ethtransaction.getFromPrivateKey();
				
				var privkey = hexprivkey.substring(2);
				var bufprivkey = ethereumjs.Buffer.Buffer.from(privkey, 'hex');

				
				// signing
				if (this.web3_version == "1.0.x") {
					// Web3 > 1.0

					// turn gas, gasprice and value to hex
					// not to receive "insufficient funds for gas * price + value"
					txjson.gas = web3.utils.toHex(gas.toString());
					txjson.gasPrice = web3.utils.toHex(gasPrice.toString());
					txjson.value = web3.utils.toHex((txjson.value ? txjson.value.toString() : 0));
					
				}
				else {
					// Web3 == 0.20.x

					// turn gas, gasprice and value to hex
					// not to receive "insufficient funds for gas * price + value"
					txjson.gas = web3.toHex(gas.toString());
					txjson.gasPrice = web3.toHex(gasPrice.toString());
					txjson.value = web3.toHex(txjson.value.toString());
					
				}
				
				var tx = new ethereumjs.Tx(txjson);
				
				
				web3.eth.getTransactionCount(fromaddress, (err, count) => {
					
					if (!err) {
						txjson.nonce = (nonce ? nonce : count);
						
						var tx = new ethereumjs.Tx(txjson);
						
						tx.sign(bufprivkey);

						var raw = '0x' + tx.serialize().toString('hex');
						
						ethtransaction.setRawData(raw);
						
						resolve(raw);
					}
					else {
						reject(err, null);
					}
				});
			}
			else {
				throw 'transaction can not be signed';
			}
		})
		.then((res) => {
			result = true;
			
			return result;
		})
		.catch(err => {
			global.log('error in EthereumNode.signEthereumTransactionAsync: ' + err);
			
			result = false;
			
			return result;
		});
	}
	
	
	//
	// Web3
	//
	getWeb3ProviderFullUrl() {
		if (this.web3providerurl)
			return this.web3providerurl;
		
		var session = this.session;
		var global = this.session.getGlobalInstance();
		var ethnodeservice = global.getServiceInstance('ethnode');
		
		this.web3providerurl = ethnodeservice.getWeb3ProviderFullUrl(session);
		
		return this.web3providerurl;
	}
	
	setWeb3ProviderFullUrl(web3providerfullurl) {
		this.web3providerurl = web3providerfullurl;
		
		this.clearWeb3Instance();
	}
	
	getWeb3ProviderFromUrl(web3providerfullurl) {
		var session = this.session;
		var global = session.getGlobalInstance();
		var Web3 = global.require('web3');
		
		var options = {};
		
		options.headers = [];
		
		var ethnodeservice = global.getServiceInstance('ethnode');
		
		var _web3providerinstance = ethnodeservice.getWeb3ProviderInstance(session, web3providerfullurl);
		
		var auth_basic = (_web3providerinstance ? _web3providerinstance.getVariable('auth_basic') : null);
		if (auth_basic) {
			var username = auth_basic.username;
			var password = auth_basic.password;
			
			var auth_value = "Basic " + Buffer.from(username + ":" + password).toString('base64')
			
			options.headers.push({name: "Authorization", value: auth_value});
			
		}

		var web3Provider =  new Web3.providers.HttpProvider(web3providerfullurl, options);
		
		return web3Provider;
	}
	
	getWeb3Provider() {
		var web3providerfullurl = this.getWeb3ProviderFullUrl();
		
		return this.getWeb3ProviderFromUrl(web3providerfullurl);
	}
	
	getWeb3InstanceFromProvider(web3Provider) {
		var global = this.session.getGlobalInstance();

		var Web3 = global.require('web3');

		return new Web3(web3Provider);		
	}
	
	getWeb3Instance() {
		var session = this.session;
		var global = session.getGlobalInstance();
		
		//global.log("EthereumNode.getWeb3Instance called" + (this.web3instance ? ': instance already created' : ': no instance yet'));
		
		if (this.web3instance)
			return this.web3instance;
		
		global.log("EthereumNode.getWeb3Instance: creating web3 instance for session " + session.getSessionUUID());
		
		var web3Provider = this.getWeb3Provider();
		
		var web3instance = this.getWeb3InstanceFromProvider(web3Provider);
		
		this.setWeb3Instance(web3instance);
		
		global.log("EthereumNode.getWeb3Instance: web3 instance created for session " + session.getSessionUUID());
		
		// we check that this instance is not syncing
		var issyncing = this._getSyncingArray();

		if (issyncing !== false) {
			global.log("EthereumNode.getWeb3Instance: provider is syncing (or unreachable)");

			// we call a hook to give a chance to put instead
			// a web3instance to a non-syncing node
			var result = [];
			
			var params = [];
			
			params.push(this);
			params.push(web3instance);

			var ret = global.invokeHooks('createWeb3Instance_hook', result, params);
			
			if (ret && result && result.length) {
				global.log('createWeb3Instance_hook result is ' + JSON.stringify(result));
			}
			
		}
		
		return this.web3instance;
	}
	
	setWeb3Instance(web3instance) {
		var session = this.session;
		var global = session.getGlobalInstance();
		global.log("EthereumNode.setWeb3Instance called for session " + session.getSessionUUID() + " with provider " + (web3instance ? JSON.stringify(web3instance.currentProvider) : 'no instance'));

		this.web3instance = web3instance;
	}
	
	clearWeb3Instance() {
		var session = this.session;
		var global = session.getGlobalInstance();
		global.log("EthereumNode.clearWeb3Instance called for session " + session.getSessionUUID());
		this.web3instance = null;
	}
	
	// node
	async web3_isListeningAsync() {
		var global = this.session.getGlobalInstance();

		global.log("EthereumNode.web3_isListeningAsync called");
		
		var web3 = this.getWeb3Instance();

		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			var funcname = web3.eth.net.isListening;
		}
		else {
			// Web3 == 0.20.x
			var funcname = web3.net.getListening;
		}

		var islistening =  await funcname()		
		.catch(error => {
			global.log('Web3 error: ' + error);
		});
		
		return islistening;
	}

	web3_isListening() {
		var global = this.session.getGlobalInstance();
		var self = this;

		global.log("EthereumNode.web3_isListening called");
		
		var web3 = this.getWeb3Instance();

		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			var funcname = web3.eth.net.isListening;
		}
		else {
			// Web3 == 0.20.x
			var funcname = web3.net.getListening;
		}

		var listening = null;
		
		var finished = false;

		var promise =  funcname(function(error, result) {
			
			if (!error) {
				
				if(result !== false) {
					listening = result;
					 
				    global.log("node is listening");
				}
				else {
					listening = false;
					
				    global.log("node is NOT listening");
				}
				
				finished = true;
			  } else {
				  listening = null;
					
				  global.log('Web3 error: ' + error);
				  finished = true;
			  }
			});

		// wait to turn into synchronous call
		while(finished === false)
		{global.deasync().runLoopOnce();}
		
		return listening;
	}

	async _getSyncingArrayAsync() {
		var global = this.session.getGlobalInstance();

		var web3 = this.getWeb3Instance();
		
		// look if it is in cache
		var cachename = 'ethnode_syncingweb3provider';
		var web3syncingcache = global.getExecutionVariable(cachename);
		
		if (!web3syncingcache) {
			web3syncingcache = global.createCacheObject(cachename);
			web3syncingcache.setValidityLimit(30000); // 30s
			global.setExecutionVariable(cachename, web3syncingcache);
		}

		var key = JSON.stringify(web3.currentProvider);

		var syncing = web3syncingcache.getValue(key);
		
		if (syncing !== undefined)
			return syncing;
		
		// if not in cache request info from provider
		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			var funcname = web3.eth.isSyncing;
		}
		else {
			// Web3 == 0.20.x
			var funcname = web3.eth.getSyncing;
		}

		var result =  await funcname()
		.catch(error => {
			global.log('Web3 error: ' + error);
		});

		if (result !== false) {
			syncing = true;
				
			var arr = [];

			for(var key in result){
				arr[key] = result[key];
			}
			
			syncing = arr;
			
			global.log("node is syncing");
		}
		else {
			syncing = false;
			
			global.log("node is NOT syncing");
		}
	
		web3syncingcache.putValue(key, syncing);
		
		return syncing;
	}
	
	_getSyncingArray() {
		var global = this.session.getGlobalInstance();
		var self = this;

		var web3 = this.getWeb3Instance();
		
		// look if it is in cache
		var cachename = 'ethnode_syncingweb3provider';
		var web3syncingcache = global.getExecutionVariable(cachename);
		
		if (!web3syncingcache) {
			web3syncingcache = global.createCacheObject(cachename);
			web3syncingcache.setValidityLimit(30000); // 30s
			global.setExecutionVariable(cachename, web3syncingcache);
		}

		var key = JSON.stringify(web3.currentProvider);

		var syncing = web3syncingcache.getValue(key);
		
		if (syncing !== null)
			return syncing;
		
		// if not in cache request info from provider
		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			var funcname = web3.eth.isSyncing;
		}
		else {
			// Web3 == 0.20.x
			var funcname = web3.eth.getSyncing;
		}

		var finished = false;
		var promise =  funcname(function(error, result) {
			
			if (!error) {
				
				if(result !== false) {
					syncing = true;
					 
					var arr = [];

					for(var key in result){
					  arr[key] = result[key];
					}
					
					syncing = arr;
					
				    global.log("node is syncing");
				}
				else {
					syncing = false;
					
				    global.log("node is NOT syncing");
				}
				
				finished = true;
			  } else {
				  syncing = null;
					
				  global.log('Web3 error: ' + error);
				  finished = true;
			  }
			});

		// wait to turn into synchronous call
		while(finished === false)
		{global.deasync().runLoopOnce();}
		
		web3syncingcache.putValue(key, syncing);
		
		return syncing;
	}
	
	async web3_isSyncingAsync() {
		var global = this.session.getGlobalInstance();
		var self = this;

		global.log("EthereumNode.web3_isSyncingAsync called");
		
		var issyncing = await this._getSyncingArrayAsync()		
		.catch(error => {
			global.log('Web3 error: ' + error);
		});
		
		issyncing = (issyncing === false ? false : true);
		
		return issyncing;
	}
	
	web3_isSyncing() {
		var global = this.session.getGlobalInstance();
		var self = this;

		global.log("EthereumNode.web3_isSyncing called");
		
		var issyncing = this._getSyncingArray();
		
		issyncing = (issyncing === false ? false : true);
		
		return issyncing;
	}
	
	async web3_getNetworkIdAsync() {
		var global = this.session.getGlobalInstance();
		var self = this;

		global.log("EthereumNode.web3_getNetworkIdAsync called");
		
		var web3 = this.getWeb3Instance();

		if (self.web3_version == "1.0.x") {
			// Web3 > 1.0
			var funcname = web3.eth.net.getId;
		}
		else {
			// Web3 == 0.20.x
			var funcname = web3.version.getNetwork;
		}

		var networkid = await funcname()		
		.catch(error => {
			global.log('Web3 error: ' + error);
		});
		
		return networkid;
	}


	web3_getNetworkId() {
		var global = this.session.getGlobalInstance();
		var self = this;

		global.log("EthereumNode.web3_getNetworkId called");
		
		var web3 = this.getWeb3Instance();

		if (self.web3_version == "1.0.x") {
			// Web3 > 1.0
			var funcname = web3.eth.net.getId;
		}
		else {
			// Web3 == 0.20.x
			var funcname = web3.version.getNetwork;
		}

		var networkid = null;
		
		var finished = false;
		
		var promise =  funcname(function(error, netId){
			if (!error) {
				networkid = netId;
			}
			
			finished = true;
		});
		
		// wait to turn into synchronous call
		while(finished === false)
		{global.deasync().runLoopOnce();}
		
		return networkid;
	}

	async web3_getPeerCountAsync() {
		var global = this.session.getGlobalInstance();
		var self = this;

		global.log("EthereumNode.web3_getPeerCountAsync called");
		
		var web3 = this.getWeb3Instance();
		
		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			var funcname = web3.eth.net.getPeerCount;
		}
		else {
			// Web3 == 0.20.x
			var funcname = web3.net.getPeerCount;
		}

		var peercount = await funcname()		
		.catch(error => {
			global.log('Web3 error: ' + error);
		});
		
		return peercount;
	}
	
	web3_getPeerCount() {
		var global = this.session.getGlobalInstance();
		var self = this;

		global.log("EthereumNode.web3_getPeerCount called");
		
		var web3 = this.getWeb3Instance();
		
		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			var funcname = web3.eth.net.getPeerCount;
		}
		else {
			// Web3 == 0.20.x
			var funcname = web3.net.getPeerCount;
		}

		var peercount = null;
		
		var finished = false;
		var promise =  funcname(function(error, result) {
			
			if (!error) {
				
				peercount = result;
				
				finished = true;
			  } else {
				  peercount = null;
					
				  global.log('Web3 error: ' + error);
				  finished = true;
			  }
		});

		// wait to turn into synchronous call
		while(finished === false)
		{global.deasync().runLoopOnce();}
		
		return peercount;
	}
	
	async web3_getNodeInfoAsync() {
		var global = this.session.getGlobalInstance();
		var self = this;
		
		global.log("EthereumNode.web3_getNodeInfoAsync called");
		
		var islistening = await this.web3_isListeningAsync();
		var networkid = await this.web3_getNetworkIdAsync();
		var peercount = await this.web3_getPeerCountAsync();
		var issyncing = await this.web3_isSyncingAsync();
		var currentblock = await this.web3_getCurrentBlockNumberAsync();
		var highestblock = await this.web3_getHighestBlockNumberAsync();

		return {
				networkid: networkid,
				islistening: islistening,
				peercount: peercount,
				issyncing: issyncing,
				currentblock: currentblock,
				highestblock: highestblock
		};
		
	}

	web3_getNodeInfo() {
		var global = this.session.getGlobalInstance();
		var self = this;
		
		global.log("EthereumNode.web3_getNodeInfo called");
		
		var islistening = this.web3_isListening();
		var networkid = this.web3_getNetworkId();
		var peercount = this.web3_getPeerCount();
		var issyncing = this.web3_isSyncing();
		var currentblock = this.web3_getCurrentBlockNumber();
		var highestblock = this.web3_getHighestBlockNumber();
		
		global.log("EthereumNode.web3_getNodeInfo finished");

		return {
				networkid: networkid,
				islistening: islistening,
				peercount: peercount,
				issyncing: issyncing,
				currentblock: currentblock,
				highestblock: highestblock
		};
		
	}
	
	
	// accounts
	async web3_getAccountBalanceAsync(address) {
		var global = this.session.getGlobalInstance();
		
		global.log("EthereumNode.web3_getAccountBalanceAsync called for " + address);
		
		var web3 = this.getWeb3Instance();
		
		var balance;
		
		return web3.eth.getBalance(address, function(error, result) {
			
			if (!error) {
				balance = result;
			} else {
				balance = 'error: ' + error;
				
				global.log('Web3 error: ' + error);
			}
			
			return balance
		})
		.then(() => {
			return balance
		})
		.catch(err => {
			return balance
		});
	}
	
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
		{global.deasync().runLoopOnce();}

		
		return balance;
	}
	
	async web3_getAccountCodeAsync(address) {
		var global = this.session.getGlobalInstance();
		
		global.log("EthereumNode.web3_getAccountCodeAsync called for " + address);
		var web3 = this.getWeb3Instance();

		var code = await web3.eth.getCode(address)		
		.catch(error => {
			global.log('Web3 error: ' + error);
		});
		
		return code;
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
		{global.deasync().runLoopOnce();}

		
		return code;
	}
	
	web3_unlockAccount(address, password, duration) {
		var global = this.session.getGlobalInstance();
		var self = this;
		
		global.log('EthereumNode.web3_unlockAccount unlocking account ' + address + ' for ' + duration + ' seconds.');
		
		var web3 = this.getWeb3Instance();
		
		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			var funcname = web3.eth.personal.unlockAccount;
			
		}
		else {
			// Web3 == 0.20.x
			var funcname = web3.personal.unlockAccount;
		}
		
		var result;
		var finished = false;

		var promise = new Promise(function (resolve, reject) {
			try {
				
				return funcname(address, password, duration, function(err, res) {
					if (!err) {
						result = res;
						finished = true;
						
						return resolve(res);
					}
					else {
						result = null;
						finished = true;

						reject('web3 error: ' + err);
					}
				
				});
			}
			catch(e) {
				result = null;
				finished = true;
				
				reject('web3 exception: ' + e);
			}
			
		});
		
		
		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce();}

		return result;
	}
	
	web3_lockAccount(address) {
		var global = this.session.getGlobalInstance();
		
		global.log('EthereumNode.web3_lockAccount locking  account ' + address);
		
		var web3 = this.getWeb3Instance();

		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			var funcname = web3.eth.personal.lockAccount;
		}
		else {
			// Web3 == 0.20.x
			var funcname = web3.personal.lockAccount;
		}
		
		var result;
		var finished = false;

		var promise = new Promise(function (resolve, reject) {
			try {
				
				return funcname(address, function(err, res) {
					if (!err) {
						result = res;
						finished = true;
						
						return resolve(res);
					}
					else {
						global.log('EthereumNode.web3_lockAccount err is ' + err);
						result = null;
						finished = true;

						reject('web3 error: ' + err);
					}
				
				});
			}
			catch(e) {
				result = null;
				finished = true;
				
				global.log('EthereumNode.web3_lockAccount exception is ' + e);
				
				reject('web3 exception: ' + e);
			}
			
		});
		
		
		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce();}

		return result;
	}
	
	// blocks
	async web3_getBlockNumberAsync() {
		var global = this.session.getGlobalInstance();

	    global.log("EthereumNode.web3_getBlockNumberAsync called");
		var blocknumber;
		
		var web3 = this.getWeb3Instance();

		var blocknumber =  await web3.eth.getBlockNumber()		
		.catch(error => {
			global.log('Web3 error: ' + error);
		});

	    global.log("blocknumber is " + blocknumber);
		return blocknumber;
	}
	
	web3_getBlockNumber() {
		var global = this.session.getGlobalInstance();

	    global.log("EthereumNode.web3_getBlockNumber called");
		var blocknumber;
		
		var web3 = this.getWeb3Instance();

		var promise =  web3.eth.getBlockNumber(function(error, result) {
			
			if (!error) {
				blocknumber = result;
			  } else {
				  blocknumber = -1;
				  
				  global.log('Web3 error: ' + error);
			  }
		});

		// wait to turn into synchronous call
		while(blocknumber === undefined)
		{global.deasync().runLoopOnce();}
		
	    global.log("blocknumber is " + blocknumber);
		return blocknumber;
	}
	
	async web3_getCurrentBlockNumberAsync() {
		var global = this.session.getGlobalInstance();

	    global.log("EthereumNode.web3_getCurrentBlockNumberAsync called");
		var blocknumber;
		
		var syncingobj = await this._getSyncingArrayAsync();
		
		blocknumber = ((syncingobj !== false) && (syncingobj) && (syncingobj['currentBlock']) ? syncingobj['currentBlock'] : false);
		
		if (blocknumber === false)
			blocknumber = await this.web3_getBlockNumberAsync();
		
	    global.log("currentblocknumber is " + blocknumber);
		return blocknumber;
	}
	
	web3_getCurrentBlockNumber() {
		var global = this.session.getGlobalInstance();

	    global.log("EthereumNode.web3_getCurrentBlockNumber called");
		var blocknumber;
		
		var syncingobj = this._getSyncingArray();
		
		blocknumber = ((syncingobj !== false) && (syncingobj) && (syncingobj['currentBlock']) ? syncingobj['currentBlock'] : false);
		
		if (blocknumber === false)
			blocknumber = this.web3_getBlockNumber();
		
	    global.log("currentblocknumber is " + blocknumber);
		return blocknumber;
	}
	
	async web3_getHighestBlockNumberAsync() {
		var global = this.session.getGlobalInstance();

	    global.log("EthereumNode.web3_getHighestBlockNumber called");
		var blocknumber;
		
		var syncingobj = await this._getSyncingArrayAsync();
		
		blocknumber = ((syncingobj !== false) && (syncingobj) && (syncingobj['highestBlock']) ? syncingobj['highestBlock'] : false);
		
		if (blocknumber === false)
			blocknumber = await this.web3_getBlockNumberAsync();
		
	    global.log("highestblocknumber is " + blocknumber);
		return blocknumber;
	}
	
	web3_getHighestBlockNumber() {
		var global = this.session.getGlobalInstance();

	    global.log("EthereumNode.web3_getHighestBlockNumber called");
		var blocknumber;
		
		var syncingobj = this._getSyncingArray();
		
		blocknumber = ((syncingobj !== false) && (syncingobj) && (syncingobj['highestBlock']) ? syncingobj['highestBlock'] : false);
		
		if (blocknumber === false)
			blocknumber = this.web3_getBlockNumber();
		
	    global.log("highestblocknumber is " + blocknumber);
		return blocknumber;
	}
	
	/*web3_getHighestBlockNumber() {
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
				finished = true;

				reject('web3 exception: ' + e);
			}
			
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce();}
		
		return blocknumber;
	}*/
	
	
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
				finished = true;
				
				reject('web3 exception: ' + e);
			}
			
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce();}
		
		return blockjson;
	}

	web3_findTransaction(transactionuuid) {
		var self = this
		var session = this.session;
		var global = this.session.getGlobalInstance();
		
		var transactionhash = this.persistor.getTansactionHash(transactionuuid);
		
		if (transactionhash)
			return this.web3_getTransaction(transactionhash);
	}
	
	web3_getUserTransactions(useruuid) {
		var self = this
		var session = this.session;
		var global = this.session.getGlobalInstance();
		
		var transactionlogarray = this.persistor.getUserTansactionLogs(useruuid);
		
		var txarray = [];
		
		var txmap = Object.create(null); // create a map to keep transactionuuid
		
		for (var i = 0; i < transactionlogarray.length; i++) {
			var transactionlog = transactionlogarray[i];
			
			var transactionuuid = transactionlog['transactionuuid'];
			var action = transactionlog['action'];
			
			if (transactionuuid in txmap) {
				var tx = txmap[transactionuuid]
			}
			else {
				// first time for this transactionuuid
				// create array for transaction and put it in map
				//var tx = [];
				var tx = this.createEthereumTransactionInstance();
				
				tx['transactionuuid'] = transactionuuid;
				
				txmap[transactionuuid] = tx;
			}
			
			// fill tx from the different logs
			if (action == 1) {
				tx['transactionuuid'] = transactionlog['transactionuuid'];
				tx['creationdate'] = transactionlog['creationdate'];
				
				if ((typeof tx['status'] !== 'undefined') && (tx['status'] !== 'completed'))
					tx['status'] = 'started';
				
				// parse log
				try {
					var txjsonstring = transactionlog['log'].toString('utf8');
					var txjson =  JSON.parse(txjsonstring);
					
					if (txjson['web3providerurl'])
						tx['web3providerurl'] = txjson['web3providerurl'];
				}
				catch(e) {
				}
			}
			else if (action == 500) {
				try {
					var txjsonstring = transactionlog['log'].toString('utf8');
					var txjson =  JSON.parse(txjsonstring);
					
					tx['from'] = txjson['from'];
					tx['to'] = txjson['to'];
					tx['value'] = txjson['value'];
				}
				catch(e) {
				}
				
			}
			else if (action == 1000) {
				tx['transactionhash'] = transactionlog['transactionhash'];

				tx['status'] = 'completed';
			}
		}
		
		// fill txarray for completed transaction
		for (var key in txmap) {
			var tx = txmap[key];
			
			if (!tx) continue;
			
			txarray.push(tx);
		}

		
		return txarray;
	}
	
	web3_getTransactionCountAsync(address, defaultBlock) {
		var global = this.session.getGlobalInstance();
		
		global.log("EthereumNode.web3_getTransactionCountAsync called for " + address);
		var web3 = this.getWeb3Instance();

		if (defaultBlock)
			return web3.eth.getTransactionCount(address, defaultBlock);
		else
			return web3.eth.getTransactionCount(address);
	}

	web3_getTransactionCount(address) {
		var global = this.session.getGlobalInstance();
		
		global.log("EthereumNode.web3_getTransactionCount called for " + address);
		var web3 = this.getWeb3Instance();

		var count;
		
		var finished = false;
		var promise = web3.eth.getTransactionCount(address, function(error, result) {
			
			if (!error) {
				count = result;
				
				finished = true;
			} else {
				count = null;
				
				global.log('Web3 error: ' + error);
				finished = true;

			}
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce();}

		
		return count;
	}

	async web3_getTransactionAsync(hash) {
		var promise = new Promise((resolve, reject) => {
			try {
				var web3 = this.getWeb3Instance();
				
				return web3.eth.getTransaction(hash, function(err, res) {
					if (err) reject('web3 error: ' + err); else return resolve(res);
				});
			}
			catch(e) {
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise;
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
				finished = true;
				
				reject('web3 exception: ' + e);
			}
			
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce();}
		
		return txjson;
	}
	
	async web3_getTransactionReceiptAsync(hash) {
		var promise = new Promise((resolve, reject) => {
			try {
				var web3 = this.getWeb3Instance();
				
				return web3.eth.getTransactionReceipt(hash, function(err, res) {
					if (err) reject('web3 error: ' + err); else return resolve(res);
				});
			}
			catch(e) {
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise;
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
				finished = true;
				
				reject('web3 exception: ' + e);
			}
			
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce();}
		
		return txjson;
	}
	
	web3_sendRawTransaction(ethtransaction) {
		var global = this.session.getGlobalInstance();

		global.log('EthereumNode.web3_sendRawTransaction called');
		
		var self = this
		var session = this.session;
		
		var finished = false;
		var result;
		
		var raw = ethtransaction.getRawData();
		var ethereum_transaction_uuid = ((ethtransaction.getTransactionUUID() !== null) ? ethtransaction.getTransactionUUID() : session.guid());
		
		// log start of transaction
		var web3providerurl = this.getWeb3ProviderFullUrl();
		var logString = JSON.stringify({web3providerurl: web3providerurl, raw: raw});
		
		this._saveTransactionLog(ethereum_transaction_uuid, 'sendRawTransaction', 1, logString);

		var promise = new Promise( function(resolve, reject) {
			var web3 = self.getWeb3Instance();

			var __transactioncallback = function(err, res) {
				var transactionHash = res;
				global.log('EthereumNode.web3_sendRawTransaction transactionHash is ' + transactionHash);
				
				if (!err) {
					finished = true;
					result = transactionHash;
					
					ethtransaction.setTransactionHash(transactionHash);
					
					// log success of transaction
					self._saveTransactionLog(ethereum_transaction_uuid, 'sendRawTransaction', 1000, JSON.stringify(transactionHash), transactionHash);
					
					return resolve(transactionHash);
				}
				else {
					finished = true;
					result = null;
					
					// log error of transaction
					self._saveTransactionLog(ethereum_transaction_uuid, 'sendRawTransaction', -500, err);
	
					var error = 'web3 error: ' + err;
					global.log('error: ' + error);
					
					reject('web3 error: ' + err);
				}
			};
			
			if (self.web3_version == "1.0.x") {
				// Web3 > 1.0
				web3.eth.sendSignedTransaction(raw, __transactioncallback);
			}
			else {
				// Web3 < 1.0
				web3.eth.sendRawTransaction(raw, __transactioncallback);
			}
		
		})
		.catch(function (err) {
			global.log("EthereumNode.web3_sendRawTransaction promise rejected: " + err);
			
			// log exception of transaction
			self._saveTransactionLog(ethereum_transaction_uuid, 'sendRawTransaction', -100, err);

			finished = true;
			result = null;
		});
		
		
		// log transaction pending
		var jsonstring = JSON.stringify(ethtransaction.getTxJson());
		this._saveTransactionLog(ethereum_transaction_uuid, 'sendRawTransaction', 500, jsonstring);
		
		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce();}
		
		return result;
	}
	
	async web3_sendRawTransactionAsync(ethtransaction) {
		var global = this.session.getGlobalInstance();

		global.log('EthereumNode.web3_sendRawTransactionAsync called');
		
		var self = this
		var session = this.session;
		
		var result;
		
		var raw = ethtransaction.getRawData();
		var ethereum_transaction_uuid = ((ethtransaction.getTransactionUUID() !== null) ? ethtransaction.getTransactionUUID() : session.guid());
		
		// log start of transaction
		var web3providerurl = this.getWeb3ProviderFullUrl();
		var logString = JSON.stringify({web3providerurl: web3providerurl, raw: raw});
		
		this._saveTransactionLog(ethereum_transaction_uuid, 'sendRawTransaction', 1, logString);

		return new Promise( function(resolve, reject) {
			var web3 = self.getWeb3Instance();

			var __transactioncallback = function(err, res) {
				var transactionHash = res;
				global.log('EthereumNode.web3_sendRawTransactionAsync transactionHash is ' + transactionHash);
		
				if (!err) {
					result = transactionHash;
					
					ethtransaction.setTransactionHash(transactionHash);
					
					// log success of transaction
					self._saveTransactionLog(ethereum_transaction_uuid, 'sendRawTransaction', 1000, JSON.stringify(transactionHash), transactionHash);
					
					return resolve(transactionHash);
				}
				else {
					result = null;
					
					// log error of transaction
					self._saveTransactionLog(ethereum_transaction_uuid, 'sendRawTransaction', -500, err);
	
					var error = 'web3 error: ' + err;
					global.log('error: ' + error);
					
					reject('web3 error: ' + err);
				}
			};
			
			if (self.web3_version == "1.0.x") {
				// Web3 > 1.0
				web3.eth.sendSignedTransaction(raw, __transactioncallback);
			}
			else {
				// Web3 < 1.0
				web3.eth.sendRawTransaction(raw, __transactioncallback);
			}
		
		})
		.then(() => {
			return result;
		})
		.catch(function (err) {
			global.log("EthereumNode.web3_sendRawTransactionAsync promise rejected: " + err);
			
			// log exception of transaction
			self._saveTransactionLog(ethereum_transaction_uuid, 'sendRawTransaction', -100, err);

			result = null;
			
			return result;
		});
		
		
		// log transaction pending
		var jsonstring = JSON.stringify(ethtransaction.getTxJson());
		this._saveTransactionLog(ethereum_transaction_uuid, 'sendRawTransaction', 500, jsonstring);
		
	}
	
	web3_sendTransaction(ethtransaction) {
		var global = this.session.getGlobalInstance();
		
		global.log('EthereumNode.web3_sendTransaction called');
		
		var self = this
		var session = this.session;
		
		var finished = false;
		var result;
		
		var fromaddress = ethtransaction.getFromAddress();
		var toaddress = ethtransaction.getToAddress();
		var amount = ethtransaction.getValue();
		var gas = ethtransaction.getGas();
		var gasPrice = ethtransaction.getGasPrice();
		var txdata = ethtransaction.getData();
		var nonce = ethtransaction.getNonce();
		
		var web3providerurl = this.getWeb3ProviderFullUrl();
		var params = {from: fromaddress, to: toaddress, value: amount, gas: gas, gasPrice: gasPrice, data: txdata, nonce: nonce, web3providerurl: web3providerurl};
		var ethereum_transaction_uuid = ((ethtransaction.getTransactionUUID() !== null) ? ethtransaction.getTransactionUUID() : session.guid());
		
		// log start of transaction
		var ethereum_transaction_uuid = session.guid();
		var logString = JSON.stringify(params);

		this._saveTransactionLog(ethereum_transaction_uuid, 'sendTransaction', 1, logString);

		var promise = new Promise( function(resolve, reject) {
			var web3 = self.getWeb3Instance();

			var __transactioncallback = function(err, res) {
				var transactionHash = res;
				global.log('EthereumNode.web3_sendTransaction transactionHash is ' + transactionHash);
		         
				if (!err) {
					finished = true;
					result = transactionHash;
					
					ethtransaction.setTransactionHash(transactionHash);
					
					// log success of transaction
					self._saveTransactionLog(ethereum_transaction_uuid, 'sendTransaction', 1000, JSON.stringify(transactionHash), transactionHash);

					return resolve(transactionHash);
				}
				else {
					finished = true;
					result = null;
	
					// log error of transaction
					self._saveTransactionLog(ethereum_transaction_uuid, 'sendTransaction', -500, err);
					
					var error = 'web3 error: ' + err;
					global.log('error: ' + error);
					
					reject('web3 error: ' + err);
				}
			};
			
			var txjson = {from: fromaddress,
					to: toaddress,
					gas: gas, 
					gasPrice: gasPrice,
				};
			
			if (nonce)
				txjson.nonce = nonce;
			
			if (txdata)
				txjson.data = txdata;
	
			// amount conversion to Wei
			if (self.web3_version == "1.0.x") {
				// Web3 > 1.0
				if (amount)
					txjson.value = web3.utils.toWei(amount, 'ether');
			}
			else {
				// Web3 == 0.20.x
				if (amount)
					txjson.value = web3.toWei(amount, 'ether');
			}
	
			// unsigned send (node will sign thanks to the unlocking of account)
			web3.eth.sendTransaction(txjson, __transactioncallback);
		})
		.catch(function (err) {
		     global.log("EthereumNode.web3_sendTransaction promise rejected: " + err);
		     
			// log exception of transaction
			self._saveTransactionLog(ethereum_transaction_uuid, 'sendTransaction', -100, err);

			finished = true;
			result = null;
		});
		
		
		// log transaction pending
		var jsonstring = JSON.stringify(ethtransaction.getTxJson());
		this._saveTransactionLog(ethereum_transaction_uuid, 'sendTransaction', 500, jsonstring);

		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce();}
		
		return result;
	}
	

	//
	// contracts
	//
	
	_getContractInstance(abi, address) {
		var global = this.session.getGlobalInstance();
		var web3 = this.getWeb3Instance();
		
		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			var instance = new web3.eth.Contract(abi, address);
			
		}
		else {
			// Web3 < 1.0
			var instance = web3.eth.contract(abi).at(address);
		}
		
		return instance;
	}
	
	// from abi
	web3_abi_load_at(abi, address) {
		var global = this.session.getGlobalInstance();

		var instance = this._getContractInstance(abi, address);
		
		if (!instance)
			throw 'could not get web3 instance in web3_abi_load_at';
		
		
		// build contract artifact
		var data = [];
		var artifactuuid = session.guid();
		
		data.abi = abi;
		data.bytecode = null;
		data.contractName = abi.contracName;
		
		var artifact = new ArtifactProxy(this, artifactuuid, data, null);
		artifact.abiuuid = this._getAbiUUID(abi);
		
		this.putWeb3ContractArtifact(artifactuuidinstance, artifact);
		
		// build contract proxy
		var contract = new ContractProxy(artifact, artifactuuid);
		var contractuuid = session.guid();
		
		this.putWeb3Contract(contractuuid, contract);
		
		// finally build contract instance proxy
		var constractinstanceproxy = new ContractInstanceProxy(contractuuid, address, contract, instance);

		return constractinstanceproxy;
	}
	
	_getAbiUUID(abi) {
		var global = this.session.getGlobalInstance();
		var session = this.session;
		
		if (!abi)
			throw 'abi is undefined';

		var array = session.getSessionVariables();
		var abisignature = abi.toString();
		
		for (var i = 0; i < array.length; i++) {
			var entry = array[i];
			if (abisignature == entry.value.toString()) {
				global.log('found abi saved with uuid ' + entry.key);
				return entry.key;
			}
		}
		
		// else put abi in session variables
		var abiuuid = session.guid();
		
		global.log('inserting abi with uuid ' + abiuuid);
		
		session.setSessionVariable(abiuuid, abi);
		
		return abiuuid;
	}
	
	_getAbiFromUUID(abiuuid) {
		var global = this.session.getGlobalInstance();
		var session = this.session;

		return session.getSessionVariable(abiuuid);
	}

	// from artifact
	_loadArtifactFile(artifactpath) {
		var global = this.session.getGlobalInstance();
		var webappservice = global.getServiceInstance('ethereum_webapp');
		
		return webappservice.getContractArtifactContent(artifactpath);
	}
	
	web3_loadArtifact(artifactpath) {
		var global = this.session.getGlobalInstance();
		var session = this.session;
		
		global.log("EthereumNode.web3_loadArtifact called for " + artifactpath);
		
		var cachename = 'ethnode_artifactcache';
		var artifactcache = global.getExecutionVariable(cachename);
		
		if (!artifactcache) {
			artifactcache = global.createCacheObject(cachename);
			artifactcache.setValidityLimit(1800000); // 30 mn
			global.setExecutionVariable(cachename, artifactcache);
		}
		
		var data = artifactcache.getValue(artifactpath);
		
		if (!data)  {
			var jsonFile = this._loadArtifactFile(artifactpath);
			
			if (!jsonFile)
				throw 'could not find artifact: ' + artifactpath;
			
			var data = (jsonFile ? JSON.parse(jsonFile) : {});
			
			// put in cache
			artifactcache.putValue(artifactpath, data);
		}
		
		var artifactuuid = session.guid();
		
		var web3_contract_artifact = new ArtifactProxy(this, artifactuuid, data, artifactpath);
		
		return web3_contract_artifact;
	}
	
	putWeb3ContractArtifact(contractartifactuuid, contractartifact) {
		var global = this.session.getGlobalInstance();
		var session = this.session;

		global.log("EthereumNode.putWeb3ContractArtifact pushing artifact for " + contractartifactuuid + " session " + session.session_uuid);

		if (!contractartifact)
			throw 'EthereumNode::putWeb3ContractArtifact passed a null value for contractartifactuuid ' + contractartifactuuid;
		
		try {
			contractartifact.artifactuuid = contractartifactuuid;
			session.pushObject(contractartifactuuid, contractartifact);
			
			if (false && session.isSticky()) { // section to delete
				global.log("EthereumNode.putWeb3ContractArtifact saving artifact in session variables for " + contractartifactuuid);
				
				var artifactpath = contractartifact.artifactpath;
				global.log("EthereumNode.putWeb3ContractArtifact artifact path is: " + artifactpath);
				
				var value = {artifactpath: artifactpath};
				session.setSessionVariable(contractartifactuuid, value);
			}
		}
		catch(e) {
			global.log("exception in EthereumNode.putWeb3ContractArtifact: " + e);
		}
		
	}
	
	_restoreWeb3ContractArtifact(artifactuuid) {
		var global = this.session.getGlobalInstance();
		var session = this.session;
		
		var value = session.getSessionVariable(artifactuuid);
		
		if (value) {
			var artifactpath = value.artifactpath;
			
			var artifact = this.web3_loadArtifact(artifactpath);
			
			return artifact;
		}
		else {
			global.log('_restoreWeb3ContractArtifact no artifactpath for  artifactuuid ' + artifactuuid);
		}
	}
	
	getWeb3ContractArtifact(artifactuuid, artifactpath) {
		var global = this.session.getGlobalInstance();
		var session = this.session;
		
		// look in memory from artifactuuid or reconstruct from session's variables
		var contractartifact = session.getObject(artifactuuid);
		
		if (!contractartifact) {
			if (false && session.isSticky()) { // section to delete
				global.log("EthereumNode.getWeb3ContractArtifact looking for artifact in session variables for " + artifactuuid);
				
				var value = session.getSessionVariable(artifactuuid);
				
				if (value) {
					contractartifact = this._restoreWeb3ContractArtifact(artifactuuid);
					
					if (contractartifact)
					this.putWeb3ContractArtifact(artifactuuid, contractartifact);
				}
				else{
					global.log("EthereumNode.getWeb3ContractArtifact could not find artifact in session variables for " + artifactuuid);
				}
			}
			else {
				// create on the fly instance with parameters passed
				var contractartifact = this.web3_loadArtifact(artifactpath);
				
				if (contractartifact)
				this.putWeb3ContractArtifact(artifactuuid, contractartifact);
			}
		}
		else {
			global.log("EthereumNode.getWeb3ContractArtifact artifact in session.getObject for " + artifactuuid);
		}
		
		return contractartifact;
	}
	
	web3_contract_load(contractartifact) {
		var global = this.session.getGlobalInstance();
		var session = this.session;
		
		global.log("EthereumNode.web3_contract_load called");
		//global.log('artifact is ' + JSON.stringify(artifact));
		
		var artifact = contractartifact;
		var artifactuuid = contractartifact.artifactuuid;
		
		var web3contract = new ContractProxy(artifact, artifactuuid);
		
		return web3contract;
	}
	
	putWeb3Contract(contractuuid, web3contract) {
		var global = this.session.getGlobalInstance();
		var session = this.session;

		global.log("EthereumNode.putWeb3Contract pushing contract for " + contractuuid + " session " + this.session.session_uuid);

		if (!web3contract)
			throw 'EthereumNode::putWeb3Contract passed a null value for contractuuid ' + contractuuid;
		
		try {
			web3contract.contractuuid = contractuuid;
			session.pushObject(contractuuid, web3contract);
			
			if (false && session.isSticky()) { // section to delete
				global.log("EthereumNode.putWeb3Contract saving contract in session variables for " + contractuuid);
				
				var artifactuuid = web3contract.artifactuuid;
				global.log("artifactuuid is " + artifactuuid);
				
				var value = {artifactuuid: artifactuuid};
				session.setSessionVariable(contractuuid, value);
			}

		}
		catch(e) {
			global.log("exception in EthereumNode.putWeb3Contract: " + e);
		}
	}
	
	_restoreWeb3Contract(contractuuid) {
		var global = this.session.getGlobalInstance();
		var session = this.session;
		
		global.log("EthereumNode._restoreWeb3Contract called for contractuuid: " + contractuuid);

		var value = session.getSessionVariable(contractuuid);
		
		if (value) {
			var artifactuuid = value.artifactuuid;
			
			if (artifactuuid) {
				var contractartifact = this.getWeb3ContractArtifact(artifactuuid);
				
				if (contractartifact) {
					var web3contract = this.web3_contract_load(contractartifact);
					
					return web3contract;
				}
				else {
					global.log('_restoreWeb3Contract could not find artifact for artifactuuid ' + artifactuuid);
				}
				
			}
			else {
				global.log('_restoreWeb3Contract no artifactuuid');
			}
		}
	}
	
	getWeb3Contract(contractuuid, artifactpath) {
		var global = this.session.getGlobalInstance();
		var session = this.session;
		
		// look in memory from contractuuid or reconstruct from session's variables
		var web3contract = this.session.getObject(contractuuid);
		
		if (!web3contract) {
			if (false && session.isSticky()) { // section to delete
				global.log("EthereumNode.getWeb3Contract looking for contract in session variables for " + contractuuid);
				
				var value = session.getSessionVariable(contractuuid);

				if (value) {
					web3contract = this._restoreWeb3Contract(contractuuid);
					
					if (web3contract)
					this.putWeb3Contract(contractuuid, web3contract);
				}
				else{
					global.log("EthereumNode.getWeb3Contract could not find contract in session variables for " + contractuuid);
				}
			}
			else {
				// create on the fly instance with parameters passed
				var contractartifact = this.web3_loadArtifact(artifactpath);
				var web3contract = this.web3_contract_load(contractartifact);
				
				if (web3contract)
				this.putWeb3Contract(contractuuid, web3contract);
			}
		}
		else {
			global.log("EthereumNode.getWeb3Contract contract found session.getObject for " + contractuuid);
		}
		
		return web3contract;
	}

	
	web3_contract_new(web3contract, params) {
		var session = this.session;
		var global = this.session.getGlobalInstance();
		var web3 = this.getWeb3Instance();
		
		global.log("EthereumNode.web3_contract_new called for contract " + web3contract.getContractName());
		
		var finished = false;
		var contractinstance = null;
		var address = null;

		var self = this;
		
		// log start of transaction
		var methodname = 'new';
		
		let ethereumtransaction = params[params.length - 1];
		let args = params.slice(0,-1);
		let txjson = ethereumtransaction.getTxJson();

		var ethereum_transaction_uuid = (ethereumtransaction.getTransactionUUID() !== null ? ethereumtransaction.getTransactionUUID()  : session.guid());
		
		var transactionHash;
		
		var logcall = args.slice();
		logcall.push(txjson);
		
		var web3providerurl = this.getWeb3ProviderFullUrl();
		var logString = JSON.stringify({web3providerurl: web3providerurl, call: logcall});
		
		this._saveTransactionLog(ethereum_transaction_uuid, methodname, 1, logString);
		
		var web3_contract_instance = new ContractInstanceProxy(web3contract.contractuuid, null, web3contract, null);
		
		var abi = web3contract.getAbi();
		var bytecode = web3contract.getByteCode();
		
		if (!bytecode)
			throw 'no byte code, can not deploy contract';

		try {
			if (this.web3_version == "1.0.x") {
				// Web3 > 1.0
				
				var promise = new web3.eth.Contract(abi).deploy({
		              data: bytecode,
		              arguments: args
				})
				.send(txjson)
				.on('error', function(error){ 
					global.log('notification of error while deploying contract: ' + error);
					
					// log error of transaction
					self._saveTransactionLog(ethereum_transaction_uuid, methodname, -500, error);

					web3_contract_instance = null;
					finished = true;
				})
				.on('transactionHash', function(txhash){
					transactionHash = txhash;
					global.log('transaction hash of contract deployment is: ' + transactionHash);
				})
				.on('receipt', function(receipt){
				   global.log('transaction receipt says contract deployed at: ' + receipt.contractAddress);
				})
				.on('confirmation', function(confirmationNumber, receipt){
					//global.log('confirmation number for contract deployed at ' + receipt.contractAddress + ' is: ' + confirmationNumber);
				})
				.then(function(instance){
				    var address = instance.options.address;
				    
					global.log('EthereumNode.web3_contract_new contract deployed at address: ' + address);
					
					web3_contract_instance['address'] = address;
					web3_contract_instance['web3contractinstance'] = instance;
					
					var logjson = {address: address, contractname: web3contract.getContractName(), contractuuid: web3contract.contractuuid, transactionHash: transactionHash};
					
					// log success of transaction
					self._saveTransactionLog(ethereum_transaction_uuid, methodname, 1000, JSON.stringify(logjson), transactionHash);
					
					finished = true;

					return web3_contract_instance;
				})				
				.catch(err => {
				    global.log('catched error in EthereumNode.web3_contract_new ' + err);
					
					// log exception of transaction
					self._saveTransactionLog(ethereum_transaction_uuid, methodname, -100, err);

					web3_contract_instance = null;
					finished = true;
				});
				
			}
			else {
				// Web3 == 0.20.x
				var promise = web3.eth.contract.new(abi, params, function(err, instance) {
					if (!err) {
						global.log('contract deployed at ' + res);
						var address = res;
						
						web3_contract_instance['address'] = address;
						web3_contract_instance['web3contractinstance'] = self.web3_contract_load_at(abi, address);
						
						contractinstance = web3_contract_instance;
						
						return web3_contract_instance;
					}
					else {
						global.log('error deploying contract: ' + err);
					}
					
				})
				.then(instance=> {
					
					if (instance) {
						address = instance.address;
						
						// log success of transaction
						var logjson = {address: address, contractname: web3contract.getContractName(), contractuuid: web3contract.contractuuid, transactionHash: transactionHash};
						self._saveTransactionLog(ethereum_transaction_uuid, methodname, 1000, JSON.stringify(logjson), transactionHash);
						
						global.log('EthereumNode.web3_contract_new contract deployed at address: ' + address);
					}
					else {
						// log error of transaction
						self._saveTransactionLog(ethereum_transaction_uuid, methodname, -500, 'transaction failed');

						global.log('EthereumNode.web3_contract_new failed')
					}

					finished = true;
				})				
				.catch(err => {
				    global.log('catched error in EthereumNode.web3_contract_new ' + err);
					
					// log exception of transaction
					self._saveTransactionLog(ethereum_transaction_uuid, methodname, -100, err);

					web3_contract_instance = null;
					finished = true;
				});
			}

		}
		catch(e) {
			// log exception of transaction
			self._saveTransactionLog(ethereum_transaction_uuid, methodname, -101, e);

			global.log('error in EthereumNode.web3_contract_new(): ' + e);
		}
		
		// log transaction pending
		var jsonstring = JSON.stringify(ethereumtransaction.getTxJson());
		this._saveTransactionLog(ethereum_transaction_uuid, methodname, 500, jsonstring);

		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce();}
		
		return web3_contract_instance;
	}

	web3_contract_at(web3contract, address) {
		var global = this.session.getGlobalInstance();
		
		if (!web3contract)
			throw 'web3contract instance is not defined';
		
		global.log("EthereumNode.web3_contract_at called for contract " + web3contract.getContractName() + " at address " + address);
		
		var abi = web3contract.getAbi();
		
		var instance = this._getContractInstance(abi, address);
		
		if (!instance)
			throw 'could not get web3 instance in web3_contract_at';
		
		var web3_contract_instance = new ContractInstanceProxy(web3contract.contractuuid, address, web3contract, instance);
		
		return web3_contract_instance;
	}
	
	putWeb3ContractInstance(contractinstanceuuid, contractinstance) {
		var global = this.session.getGlobalInstance();
		var session = this.session;

		global.log("EthereumNode.putWeb3ContractInstance pushing contract instance for " + contractinstanceuuid + " session " + this.session.session_uuid);

		if (!contractinstance)
			throw 'EthereumNode::putWeb3ContractInstance passed a null value for contractinstanceuuid ' + contractinstanceuuid;
		
		try {
			contractinstance.contractinstanceuuid = contractinstanceuuid;
			session.pushObject(contractinstanceuuid, contractinstance);
			
			if (false && session.isSticky()) { // section to delete
				global.log("EthereumNode.putWeb3ContractInstance saving instance in session variables for " + contractinstanceuuid);
				
				var contractuuid = contractinstance.getContractUUID();
				var abiuuid = contractinstance.getAbiUUID();
				var address = contractinstance.getAddress();
				
				global.log("contractuuid is " + contractuuid);
				global.log("abiuuid is " + abiuuid);
				global.log("address is " + address);
				
				var value = {contractuuid: contractuuid, abiuuid: abiuuid, address: address};
				
				global.log("EthereumNode.putWeb3ContractInstance value is " + JSON.stringify(value));

				session.setSessionVariable(contractinstanceuuid, value);
			}
		}
		catch(e) {
			global.log("exception in EthereumNode.putWeb3ContractInstance: " + e);
		}
	}
	
	_restoreWeb3ContractInstance(contractinstanceuuid) {
		var global = this.session.getGlobalInstance();
		var session = this.session;
		
		global.log("EthereumNode._restoreWeb3ContractInstance called for contractinstanceuuid: " + contractinstanceuuid);

		var value = session.getSessionVariable(contractinstanceuuid);
		
		global.log('value is ' + JSON.stringify(value));
		
		if (value) {
			var contractuuid = value.contractuuid;
			var address = value.address;
			
			if (contractuuid) {
				var web3contract = this.getWeb3Contract(contractuuid);
				
				if (web3contract) {
					var contractintance = this.web3_contract_at(web3contract, address);
					
					return contractintance;
				}
			}
			else {
				var abiuuid = value.abiuuid;
				var abi = this._getAbiFromUUID(abiuuid);

				if ((abi) && (address)) {
					var contractintance = this.web3_contract_load_at(abi, address);
					
					return contractintance;
				}
				else {
					global.log("EthereumNode._restoreWeb3ContractInstance could not find abi with abiuuid " + abiuuid);
				}
			}
			
		}
	}
	
	getWeb3ContractInstance(contractinstanceuuid, artifactpath, address) {
		var global = this.session.getGlobalInstance();
		var session = this.session;
		
		// look in memory from contractinstanceuuid or reconstruct from session's variables
		var contractinstance = this.session.getObject(contractinstanceuuid);
		
		if (!contractinstance)  {
			if (false && session.isSticky()) { // section to delete
				global.log("EthereumNode.getWeb3ContractInstance looking instance in session variables for " + contractinstanceuuid);
				
				var value = session.getSessionVariable(contractinstanceuuid);

				if (value) {
					var contractinstance = this._restoreWeb3ContractInstance(contractinstanceuuid);
					
					if (contractinstance)
						this.putWeb3ContractInstance(contractinstanceuuid, contractinstance);

				}
				else {
					global.log("EthereumNode.getWeb3ContractInstance could not find instance in session variables for " + contractinstanceuuid);
				}
			}
			else {
				// create on the fly instance with parameters passed
				var contractartifact = this.web3_loadArtifact(artifactpath);
				var web3contract = this.web3_contract_load(contractartifact);
				var contractinstance = this.web3_contract_at(web3contract, address);
				
				if (contractinstance)
					this.putWeb3ContractInstance(contractinstanceuuid, contractinstance);
			}
		}
		else {
			global.log("EthereumNode.getWeb3ContractInstance instance found in session.getObject for " + contractinstanceuuid);
		}

		return contractinstance;
	}
	
	// methods
	web3_contract_dynamicMethodCall(web3_contract_instance, abidef, params) {
		var session = this.session;
		var global = this.session.getGlobalInstance();
		
		var instance = web3_contract_instance.getInstance();

		var contractuid = web3_contract_instance.getContractUUID();
		var contractaddress = web3_contract_instance.getAddress();
		
		var methodname = abidef.name;
		var signature = abidef.signature;
		
		var result = null;
		
		global.log('EthereumNode.web3_contract_dynamicMethodCall for method ' + methodname  + ' contractuuid ' + contractuid + ' at address ' + contractaddress);
		
		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			var funcname = instance.methods[signature];
		}
		else {
			// Web3 < 1.0
			var funcname = instance[methodname];
		}
			
		if (!funcname)
			return result;
		
		var finished = false;
		var promise = new Promise( function(resolve, reject) {
			
			var funcback = function (err, res) {
					
					if (res) {
						finished = true;
						result = res;
						
						return resolve(res);
					}
					else {
						finished = true;
						result = null;
						
						var error = 'web3_contract_dynamicMethodCall did not retrieve any result';
						global.log('error: ' + error);

						return reject('error: ' + error);
					}
					
					
			};
			
			if (this.web3_version == "1.0.x") {
				// Web3 > 1.0
				var ret = funcname(...params).call(funcback)
				.catch(err => {
					finished = true;
				    global.log('catched error in EthereumNode.web3_contract_dynamicMethodCall ' + err);
				});
				
			}
			else {
				// Web3 < 1.0
				var ret = funcname.call(...params, funcback)
				.catch(err => {
					finished = true;
				    global.log('catched error in EthereumNode.web3_contract_dynamicMethodCall ' + err);
				});
				
			}

	
		});
		
		
		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce();}
		
		return result;
	}
	
	_getMethodAbiDefinition(abi, methodname) {
		var abidef = null;
		
		if (!abi)
			return abidef;
		
		for (var i = 0; i < abi.length; i++) {
			var item = abi[i];
			var name = item.name;
			
			if (name == methodname) {
				abidef = item;
				
				break;
			}
		}
		
		return abidef;
	}
	
	
	web3_method_call(web3_contract_instance, methodname, params) {
		var session = this.session;
		var global = this.session.getGlobalInstance();
		
		if (!web3_contract_instance)
			throw 'web3_contract_instance is not defined';

		var contractuid = web3_contract_instance.getContractUUID();
		var contractaddress = web3_contract_instance.getAddress();
		
		var instance = web3_contract_instance.getInstance();
		
		if (!instance) {
			global.log('error: EthereumNode.web3_method_call instance is null for contractuuid ' + contractuid + " at address " + contractaddress);
			throw 'the web3 instance object of  web3_contract_instance is not defined';
		}

		
		global.log('EthereumNode.web3_method_call for method ' + methodname + ' contractuuid ' + contractuid + ' at address ' + contractaddress + ' with params ' + JSON.stringify(params));
		
		var abi = web3_contract_instance.getAbi();
		var abidef = this._getMethodAbiDefinition(abi, methodname);
		var signature = abidef.signature;
		
		var funcname;

		if (this.web3_version == "1.0.x") {
			// Web3 > 1.0
			funcname = instance.methods[signature];
		}
		else {
			// Web3 == 0.20.x
			funcname = instance[methodname];
		}
		
		global.log('funcname is ' + JSON.stringify(funcname));
		
		var finished = false;
		var result = null;		
		
		try {
			
			if (funcname) {
				
				var __funcback = function (err, res) {
					
					if (res) {
						result = res;
						global.log('EthereumNode.web3_method_call result  for ' + methodname +' is ' + res);
						
						finished = true;
					}
					else {
						result = null;
						
						var error = 'EthereumNode.web3_method_call did not retrieve any result';
						global.log('error: ' + error);
						
						finished = true;
					}
					
					
				};

				
				if (this.web3_version == "1.0.x") {
					// Web3 > 1.0
					var ret = funcname(...params).call(__funcback)
					.catch(err => {
					    global.log('catched error in EthereumNodeAccess.web3_method_call ' + err);
						
						result = null;
						finished = true;
					});
					
				}
				else {
					// Web3 == 0.20.x
					// using spread operator
					var ret = funcname.call(...params, __funcback)
					/*.catch(err => {
					    global.log('catched error in EthereumNodeAccess.web3_method_call ' + err);
						
						result = null;
						finished = true;
					})*/;
					
				}
			}
			else {
				global.log('error: EthereumNode.web3_method_call funcname is null for contractuuid ' + contractuid);
			}
		}
		catch(e) {
			result = null;
			finished = true;

			global.log('exception in EthereumNode.web3_method_call: ' + e);
			global.log(e.stack);
		}

		
		
		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce();}
		

		return result;
	}
	
	_saveTransactionLog(ethereum_transaction_uuid, methodname, action, log, transactionHash) {
		// action values
		// 1 start of call
		// 500 transaction pending
		// 1000 transaction completed
		// -100 transaction error
		// -101 transaction exception
		// -500 transaction failed
		
		this.persistor.putTransactionLog(ethereum_transaction_uuid, methodname, action, log, transactionHash);
	}
	
	web3_method_sendTransaction(web3_contract_instance, methodname, params) {
		var session = this.session;
		var global = this.session.getGlobalInstance();
		
		if (!web3_contract_instance)
			throw 'web3_contract_instance is not defined';

		var instance = web3_contract_instance.getInstance();
		
		if (!instance) {
			global.log('error: EthereumNode.web3_method_sendTransaction instance is null for contractuuid ' + contractuid);
			throw 'web3_contract_instance instance is not defined';
			
		}
		var contractuid = web3_contract_instance.getContractUUID();
		var contractaddress = web3_contract_instance.getAddress();
		
		let ethereumtransaction = params[params.length - 1];
		let args = params.slice(0,-1);
		let txjson = ethereumtransaction.getTxJson();

		var ethereum_transaction_uuid = (ethereumtransaction.getTransactionUUID() !== null ? ethereumtransaction.getTransactionUUID()  : session.guid());

		var paramstring = JSON.stringify(args);
		
		global.log('EthereumNode.web3_method_sendTransaction for method ' + methodname + ' contractuuid ' + contractuid + ' at address ' + contractaddress + ' with params ' + paramstring);
		
		var finished = false;
		var transactionHash;

		var self = this;
		
		// log start of transaction
		var web3providerurl = this.getWeb3ProviderFullUrl();
		var logString = JSON.stringify({web3providerurl: web3providerurl, args: args});

		this._saveTransactionLog(ethereum_transaction_uuid, methodname, 1, logString);
		
		try {
			var abi = web3_contract_instance.getAbi();
			var abidef = this._getMethodAbiDefinition(abi, methodname);
			
			
			var methodname = abidef.name;
			var signature = abidef.signature;
			

			if (this.web3_version == "1.0.x") {
				// Web3 > 1.0
				var funcname = instance.methods[signature];
			}
			else {
				// Web3 == 0.20.x
				var funcname = instance[methodname];
			}
			
			if (funcname) {
				if (this.web3_version == "1.0.x") {
					// Web3 > 1.0
					
					var promise = funcname(...args)
					.send(txjson)
					.on('error', function(error){ 
						global.log('notification of error while sending transaction: ' + error);
						
						// log error of transaction
						self._saveTransactionLog(ethereum_transaction_uuid, methodname, -500, error);

						transactionHash = null;
						finished = true;
					})
					.on('transactionHash', function(txHash){
						 global.log('transaction hash of web3_method_sendTransaction is: ' + txHash);
					})
					.on('receipt', function(receipt){
					   global.log('transaction receipt for web3_method_sendTransaction received');
					})
					.on('confirmation', function(confirmationNumber, receipt){
						//global.log('confirmation number for contract deployed at ' + receipt.contractAddress + ' is: ' + confirmationNumber);
					})
					.then(function(res){
						transactionHash = res.transactionHash;
						
						global.log('EthereumNode.web3_method_sendTransaction result is: ' + JSON.stringify(res));
						
						// log success of transaction
						self._saveTransactionLog(ethereum_transaction_uuid, methodname, 1000, JSON.stringify(res), transactionHash);
						
						finished = true;

						return transactionHash;
					})				
					.catch(err => {
					    global.log('catched error in EthereumNode.web3_method_sendTransaction ' + err);
						
						// log exception of transaction
						self._saveTransactionLog(ethereum_transaction_uuid, methodname, -100, err);

						transactionHash = null;
						finished = true;
					});
					
				}
				else {
					// Web3 == 0.20.x
					var promise = funcname.send(...args, txjson, function(err, instance) {
						if (!err) {
							global.log('transaction hash of web3_method_sendTransaction is: ' + res);
							
							return res;
						}
						else {
							global.log('error in web3_method_sendTransaction: ' + err);
						}
						
					})
					.then(res => {
						
						if (res) {
							transactionHash = res;
							
							// log success of transaction
							self._saveTransactionLog(ethereum_transaction_uuid, methodname, 1000, JSON.stringify(transactionHash), transactionHash);
							
							global.log('EthereumNode.web3_contract_new result is: ' + res);
						}
						else {
							// log error of transaction
							self._saveTransactionLog(ethereum_transaction_uuid, methodname, -500, 'transaction failed');

							global.log('EthereumNode.web3_method_sendTransaction failed')
						}

						finished = true;
					})				
					.catch(err => {
					    global.log('catched error in EthereumNode.web3_method_sendTransaction ' + err);
						
						// log exception of transaction
						self._saveTransactionLog(ethereum_transaction_uuid, methodname, -100, err);

						transactionHash = null;
						finished = true;
					});
				}			
			}
			else {
				global.log('error: EthereumNode.web3_method_sendTransaction funcname is null for contractuuid ' + contractuid);
			}
		


		}
		catch(e) {
			// log exception of transaction
			self._saveTransactionLog(ethereum_transaction_uuid, methodname, -101, e);
			
			transactionHash = null;
			finished = true;

			global.log('exception in EthereumNode.web3_method_sendTransaction: ' + e);
		}
		
		// log transaction pending
		var jsonstring = JSON.stringify(ethereumtransaction.getTxJson());
		this._saveTransactionLog(ethereum_transaction_uuid, methodname, 500, jsonstring);

		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce();}

		return transactionHash;
	}


}

module.exports = EthereumNode;