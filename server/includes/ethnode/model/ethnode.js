/**
 * 
 */
'use strict';


class EthereumNode {
	constructor(session) {
		this.session = session;
		
		var Persistor = require('./interface/database-persistor.js');
		
		this.persistor =  new Persistor(session);
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
		
		var abiuuid = this._getAbiUUID(abi);
		
		return {contractinstance: web3_contract_instance, abiuuid: abiuuid, address: address};
	}
	
	_getAbiUUID(abi) {
		var global = this.session.getGlobalInstance();
		var session = this.session;

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
		
		global.log('inserting abi with uuid ' + entry.key);
		
		session.setSessionVariable(abiuuid, abi);
		
		return abiuuid;
	}
	
	_getAbiFromUUID(abiuuid) {
		var global = this.session.getGlobalInstance();
		var session = this.session;

		return session.getSessionVariable(abiuuid);
	}

	putWeb3ContractInstance(contractinstanceuuid, contractinstance) {
		var global = this.session.getGlobalInstance();
		var session = this.session;

		global.log("EthereumNode.putWeb3ContractInstance pushing contract for " + contractinstanceuuid + " session " + this.session.session_uuid);

		try {
			contractinstance.contractinstanceuuid = contractinstanceuuid;
			session.pushObject(contractinstanceuuid, contractinstance);
			
			if (contractinstance) {
				global.log("EthereumNode.putWeb3ContractInstance saving instance in session variables for " + contractinstanceuuid);
				
				var abiuuid = contractinstance.abiuuid;
				var address = contractinstance.address;
				
				//global.log("abiuuid is " + abiuuid);
				//global.log("address is " + address);
				
				var value = {abiuuid: abiuuid, address: address};

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
		
		var value = session.getSessionVariable(contractinstanceuuid);
		
		if (value) {
			var abi = this._getAbiFromUUID(abiuuid);
			var address = value.address;
			
			if ((abi) && (address)) {
				var contractintance = this.web3_contract_load_at(abi, address);
				
				return contractintance;
			}
		}
	}
	
	getWeb3ContractInstance(contractinstanceuuid) {
		var global = this.session.getGlobalInstance();
		var session = this.session;

		var contractinstance = this.session.getObject(contractinstanceuuid);
		
		if (!contractinstance)  {
			global.log("EthereumNode.putTruffleContractInstance looking instance in session variables for " + contractinstanceuuid);
			
			var value = session.getSessionVariable(contractinstanceuuid);

			if (value) {
				var contractinstance = this._restoreWeb3ContractInstance(contractinstanceuuid);
				
				if (contractinstance)
					this.putTruffleContractInstance(contractinstanceuuid, contractinstance);
			}
		}
		
		return contractinstance;
	}
	
	web3_contract_dynamicMethodCall(instance, abidef, params) {
		var session = this.session;
		var global = this.session.getGlobalInstance();

		var methodname = abidef.name;
		var signature = abidef.signature;
		
		var result = null;
		
		// Web3 < 1.0
		var funcname = instance[methodname];
		// Web3 > 1.0
		//var funcname = instance.methods[signature];
			
		if (!funcname)
			return result;
		
		var finished = false;
		var promise = new Promise( function(resolve, reject) {
	
			// Web3 < 1.0
			var ret = funcname.call(...params, function (err, res) {
			// Web3 > 1.0
			//var ret = funcname(...params).call(function(err, res) {
				
				
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

					return reject(null);
				}
				
				
			})
			.catch(err => {
				finished = true;
			    global.log('catched error in EthereumNode.web3_contract_dynamicMethodCall ' + err);
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
	
	_loadArtifactFile(artifactpath) {
		var global = this.session.getGlobalInstance();
		var webappservice = global.getServiceInstance('ethereum_webapp');
		
		return webappservice.getContractArtifactContent(artifactpath);
	}
	
	truffle_loadArtifact(artifactpath) {
		var global = this.session.getGlobalInstance();
		
		global.log("EthereumNode.truffle_loadArtifact called for " + artifactpath);
		
		var jsonFile = this._loadArtifactFile(artifactpath);
		
		var data = (jsonFile ? JSON.parse(jsonFile) : {});
		
		return {truffleartifact: data, artifactpath: artifactpath};
	}
	
	putTruffleContractArtifact(contractartifactuuid, contractartifact) {
		var global = this.session.getGlobalInstance();
		var session = this.session;

		global.log("EthereumNode.putTruffleContractArtifact pushing artifact for " + contractartifactuuid + " session " + session.session_uuid);

		try {
			contractartifact.contractartifactuuid = contractartifactuuid;
			session.pushObject(contractartifactuuid, contractartifact);
			
			if (contractartifact) {
				global.log("EthereumNode.putTruffleContractArtifact saving artifact in session variables for " + contractartifactuuid);
				
				var artifactpath = contractartifact.artifactpath;
				global.log("EthereumNode.putTruffleContractArtifact artifact path is: " + artifactpath);
				
				var value = {artifactpath: artifactpath};
				session.setSessionVariable(contractartifactuuid, value);
			}
		}
		catch(e) {
			global.log("exception in EthereumNode.putTruffleContractArtifact: " + e);
		}
		
	}
	
	_restoreTruffleContractArtifact(artifactuuid) {
		var global = this.session.getGlobalInstance();
		var session = this.session;
		
		var value = session.getSessionVariable(artifactuuid);
		
		if (value) {
			var artifactpath = value.artifactpath;
			
			var artifact = this.truffle_loadArtifact(artifactpath);
			
			return artifact;
		}
	}
	
	getTruffleContractArtifact(artifactuuid) {
		var global = this.session.getGlobalInstance();
		var session = this.session;

		var contractartifact = session.getObject(artifactuuid);
		
		if (!contractartifact) {
			global.log("EthereumNode.getTruffleContractArtifact looking for artifact in session variables for " + artifactuuid);
			
			var value = session.getSessionVariable(artifactuuid);
			
			if (value) {
				contractartifact = this._restoreTruffleContractArtifact(artifactuuid);
				
				if (contractartifact)
				this.putTruffleContractArtifact(artifactuuid, contractartifact);
			}
		}
		
		return contractartifact;
	}
	
	truffle_loadContract(contractartifact) {
		var global = this.session.getGlobalInstance();
		
		global.log("EthereumNode.truffle_loadContract called");
		//global.log('artifact is ' + JSON.stringify(artifact));
		
		var truffleartifact = contractartifact.truffleartifact;
		
		var TruffleContract = this.getTruffleContractClass();
		var trufflecontract = TruffleContract(truffleartifact);
		  
		var web3provider = this.getWeb3Provider();

		trufflecontract.setProvider(web3provider);
		
		return {trufflecontract: trufflecontract, artifactuuid: (contractartifact.contractartifactuuid ? contractartifact.contractartifactuuid : null)};
	}
	
	putTruffleContract(contractuuid, trufflecontract) {
		var global = this.session.getGlobalInstance();
		var session = this.session;

		global.log("EthereumNode.putTruffleContract pushing contract for " + contractuuid + " session " + this.session.session_uuid);

		try {
			trufflecontract.contractuuid = contractuuid;
			session.pushObject(contractuuid, trufflecontract);

			if (trufflecontract) {
				global.log("EthereumNode.putTruffleContract saving contract in session variables for " + contractuuid);
				
				var artifactuuid = trufflecontract.artifactuuid;
				global.log("artifactuuid is" + artifactuuid);
				
				var value = {artifactuuid: artifactuuid};
				session.setSessionVariable(contractuuid, value);
			}
		}
		catch(e) {
			global.log("exception in EthereumNode.putTruffleContract: " + e);
		}
	}
	
	_restoreTruffleContract(contractuuid) {
		var global = this.session.getGlobalInstance();
		var session = this.session;
		
		var value = session.getSessionVariable(contractuuid);
		
		if (value) {
			var artifactuuid = value.artifactuuid;
			
			if (artifactuuid) {
				var contractartifact = this.getTruffleContractArtifact(artifactuuid);
				
				if (contractartifact) {
					var contract = this.truffle_loadContract(contractartifact);
					
					return contract;
				}
			}
		}
	}
	
	getTruffleContract(contractuuid) {
		var global = this.session.getGlobalInstance();
		var session = this.session;

		var trufflecontract = this.session.getObject(contractuuid);
		
		if (!trufflecontract) {
			global.log("EthereumNode.getTruffleContract looking for contract in session variables for " + contractuuid);
			
			var value = session.getSessionVariable(contractuuid);

			if (value) {
				trufflecontract = this._restoreTruffleContract(contractuuid);
				
				if (trufflecontract)
				this.putTruffleContract(contractuuid, trufflecontract);
			}
		}
		
		return trufflecontract;
	}
	
	truffle_contract_at(contract, address) {
		var global = this.session.getGlobalInstance() ;
		
		global.log("EthereumNode.truffle_contract_at called for contract " + contract.trufflecontract.contract_name + " at address " + address);
		
		var trufflecontract = contract.trufflecontract;
		
		if (!trufflecontract)
			throw 'trufflecontract instance is not defined';
		
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
			global.log('error in EthereumNode.truffle_contract_at(): ' + e);
		}
		
		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}
		
		return {trufflecontractinstance: contractinstance, contractuuid: (contract.contractuuid ? contract.contractuuid : null), address: address};
	}

	truffle_contract_new(contract, params) {
		var session = this.session;
		var global = this.session.getGlobalInstance();
		
		var trufflecontract = contract.trufflecontract;

		global.log("EthereumNode.truffle_contract_new called for contract " + trufflecontract.contract_name);
		
		var finished = false;
		var contractinstance = null;
		var address = null;

		var self = this;
		
		// log start of transaction
		var methodname = 'new';
		var ethereum_transaction_uuid = session.guid();
		this._saveTransactionLog(ethereum_transaction_uuid, methodname, 1, JSON.stringify(params));
		
		try {
			trufflecontract.new(...params)
			.then(instance=> {
				contractinstance = instance;
				
				if (contractinstance) {
					address = contractinstance.address;
					
					// log success of transaction
					self._saveTransactionLog(ethereum_transaction_uuid, methodname, 1000, JSON.stringify(contractinstance));
					
					global.log('EthereumNode.truffle_contract_new contract deployed at address: ' + address);
				}
				else {
					// log error of transaction
					self._saveTransactionLog(ethereum_transaction_uuid, methodname, -500, 'transaction failed');

					global.log('EthereumNode.truffle_contract_new failed')
				}

				finished = true;
			})				
			.catch(err => {
			    global.log('catched error in EthereumNode.truffle_contract_new ' + err);
				
				// log exception of transaction
				self._saveTransactionLog(ethereum_transaction_uuid, methodname, -100, err);

			    finished = true;
			});

		}
		catch(e) {
			// log exception of transaction
			self._saveTransactionLog(ethereum_transaction_uuid, methodname, -101, e);

			global.log('error in EthereumNode.truffle_contract_new(): ' + e);
		}
		
		// log transaction pending
		this._saveTransactionLog(ethereum_transaction_uuid, methodname, 500, JSON.stringify(params));

		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}
		
		return {trufflecontractinstance: contractinstance, contractuuid: (contract.contractuuid ? contract.contractuuid : null), address: address};;
	}
	
	putTruffleContractInstance(contractinstanceuuid, contractinstance) {
		var global = this.session.getGlobalInstance();
		var session = this.session;

		global.log("EthereumNode.putTruffleContractInstance pushing contract instance for " + contractinstanceuuid + " session " + this.session.session_uuid);

		try {
			contractinstance.contractinstanceuuid = contractinstanceuuid;
			session.pushObject(contractinstanceuuid, contractinstance);
			
			if (contractinstance) {
				global.log("EthereumNode.putTruffleContractInstance saving instance in session variables for " + contractinstanceuuid);
				
				var contractuuid = contractinstance.contractuuid;
				var address = contractinstance.address;
				
				//global.log("contractuuid is " + contractuuid);
				//global.log("address is " + address);
				
				var value = {contractuuid: contractuuid, address: address};
				session.setSessionVariable(contractinstanceuuid, value);
			}
		}
		catch(e) {
			global.log("exception in EthereumNode.putTruffleContractInstance: " + e);
		}
	}

	_restoreTruffleContractInstance(contractinstanceuuid) {
		var global = this.session.getGlobalInstance();
		var session = this.session;
		
		var value = session.getSessionVariable(contractinstanceuuid);
		
		if (value) {
			var contractuuid = value.contractuuid;
			var address = value.address;
			
			if (contractuuid) {
				var contract = this.getTruffleContract(contractuuid);
				
				if (contract) {
					var contractintance;
					
					if (address) {
						contractintance = this.truffle_contract_at(contract, address);
					}
					
					
					return contractintance;
				}
			}
		}
	}
	
	getTruffleContractInstance(contractinstanceuuid) {
		var global = this.session.getGlobalInstance();
		var session = this.session;

		var contractinstance = this.session.getObject(contractinstanceuuid);
		
		if (!contractinstance)  {
			global.log("EthereumNode.getTruffleContractInstance looking instance in session variables for " + contractinstanceuuid);
			
			var value = session.getSessionVariable(contractinstanceuuid);

			if (value) {
				var contractinstance = this._restoreTruffleContractInstance(contractinstanceuuid);
				
				if (contractinstance)
					this.putTruffleContractInstance(contractinstanceuuid, contractinstance);
			}
		}
		
		return contractinstance;
	}

	truffle_method_call(constractinstance, methodname, params) {
		var session = this.session;
		var global = this.session.getGlobalInstance();
		
		var trufflecontractinstance = constractinstance.trufflecontractinstance;
		var trufflecontractuid = constractinstance.contractuuid;
		var trufflecontractaddress = constractinstance.address;
		
		global.log('EthereumNode.truffle_method_call for method ' + methodname + ' contractuuid ' + trufflecontractuid + ' at address ' + trufflecontractaddress + ' with params ' + JSON.stringify(params));
		
		if (trufflecontractinstance) {
			var funcname = trufflecontractinstance[methodname];
			
			var finished = false;
			var result = null;
			
			if (funcname) {
				var promise = funcname.call(...params).then(function(res){

					if (res) {
						result = res;
						global.log('truffle_method_call result  for ' + methodname +' is ' + res);
						
						finished = true;
					} else {
						result = null;
						
						var error = 'truffle_method_call did not retrieve any result';
						global.log('error: ' + error);
						
						finished = true;
					}
				}).catch(err => {
					finished = true;
				    global.log('catched error in EthereumNode.truffle_method_call ' + err);
				});
				
				// wait to turn into synchronous call
				while(!finished)
				{require('deasync').runLoopOnce();}
			}
			else {
				global.log('error: EthereumNode.truffle_method_call funcname is null');
			}
			
		}
		else {
			global.log('error: EthereumNode.truffle_method_call trufflecontractinstance is null');
		}
		

		return result;
	}
	
	_saveTransactionLog(ethereum_transaction_uuid, methodname, action, log) {
		// action values
		// 1 start of call
		// 500 transaction pending
		// 1000 transaction completed
		// -100 transaction error
		// -101 transaction exception
		// -500 transaction failed
		
		this.persistor.putTransactionLog(ethereum_transaction_uuid, methodname, action, log);
	}
	
	truffle_method_sendTransaction(constractinstance, methodname, params) {
		var session = this.session;
		var global = this.session.getGlobalInstance() ;
		
		var trufflecontractinstance = constractinstance.trufflecontractinstance;
		var trufflecontractuid = constractinstance.contractuuid;
		var trufflecontractaddress = constractinstance.address;
		
		global.log('EthereumNode.truffle_method_sendTransaction for method ' + methodname + ' contractuuid ' + trufflecontractuid + ' at address ' + trufflecontractaddress + ' with params ' + JSON.stringify(params));
		
		if (trufflecontractinstance) {
			var funcname = trufflecontractinstance[methodname];
			
			var finished = false;
			var result = null;
			
			if (funcname) {
				var self = this;
				
				// log start of transaction
				var ethereum_transaction_uuid = session.guid();
				this._saveTransactionLog(ethereum_transaction_uuid, methodname, 1, JSON.stringify(params));
				
				var promise = funcname.sendTransaction(...params).then(function(res){
					
					if (res) {
						result = res;
						
						// log success of transaction
						self._saveTransactionLog(ethereum_transaction_uuid, methodname, 1000, JSON.stringify(res));

						finished = true;
					} else {
						result = null;
						
						// log error of transaction
						self._saveTransactionLog(ethereum_transaction_uuid, methodname, -500, 'transaction failed');
						
						global.log('EthereumNode.truffle_method_sendTransaction failed');
						finished = true;

					}
				}).catch(err => {
					
					// log exception of transaction
					self._saveTransactionLog(ethereum_transaction_uuid, methodname, -100, err);

					global.log('catched error in EthereumNode.truffle_method_sendTransaction ' + err);
					
					finished = true;
				});
				
				// log transaction pending
				this._saveTransactionLog(ethereum_transaction_uuid, methodname, 500, JSON.stringify(params));

				// wait to turn into synchronous call
				while(!finished)
				{require('deasync').runLoopOnce();}
			}
			else {
				global.log('error: EthereumNode.truffle_method_sendTransaction funcname is null');
			}
			
		}
		else {
			global.log('error: EthereumNode.truffle_method_sendTransaction trufflecontractinstance is null');
		}

		

		return result;
	}
}

module.exports = EthereumNode;