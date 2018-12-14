'use strict';

var CredentialsStorage = class {
	constructor() {
		this.map = Object.create(null); // use a simple object to implement the map
	}
	
	store(address, password, duration) {
		var key = address.toString().toLowerCase();
		
		var now = Math.trunc(Date.now()/1000); // in seconds
		
		var array = [];
		
		array['address'] = address;
		array['from'] = now;
		array['during'] = duration;
		array['password'] = password;
		
		this.map[key] = array;
	}
	
	retrieve(address) {
		var key = address.toString().toLowerCase();
		
		if (key in this.map) {
			var credential = this.map[key];
			
			var now = Math.trunc(Date.now()/1000); // in seconds
			var from = credential['from'];
			var duration = credential['during'];
			
			if (now - from < duration) {
				return credential;
			}
		}
		
	}
	
	remove(address) {
		var key = address.toString().toLowerCase();

		delete this.map[key];
	}
}


class Xtra_EthereumNodeAccess {
	constructor(session) {
		this.session = session;
		
		this.credentials_storage = new CredentialsStorage();
		
		this.rest_connection = null;

		var global = session.getGlobalObject();
		var ethereumnodeaccessmodule = global.getModuleObject('ethereum-node-access');
		
		if (!ethereumnodeaccessmodule)
			throw 'ethereum-node-access module is no loaded';
		
		this.ethereumnodeaccessmodule = ethereumnodeaccessmodule;
		this.web3_version = ethereumnodeaccessmodule.web3_version;
}
	
	getRestConnection() {
		if (this.rest_connection)
			return this.rest_connection;
		
	    var rest_server_url = this.session.getXtraConfigValue('rest_server_url');
	    var rest_server_api_path = this.session.getXtraConfigValue('rest_server_api_path');

	    this.rest_connection = this.session.createRestConnection(rest_server_url, rest_server_api_path);
		
		return this.rest_connection;
	}
	
	rest_get(resource, callback) {
		var rest_connection = this.getRestConnection();
		
		return rest_connection.rest_get(resource, callback);
		/*console.log("Xtra_EthereumNodeAccess.rest_get called for resource " + resource);
		
		var session = this.session;
	    
		var xhttp = new XMLHttpRequest();
	    
	    var rest_server_url = this.session.getXtraConfigValue('rest_server_url');
	    var rest_server_api_path = this.session.getXtraConfigValue('rest_server_api_path');
	    var resource_url = rest_server_url + rest_server_api_path + resource;
	    
	    xhttp.open("GET", resource_url, true);
	    
	    xhttp.setRequestHeader("Content-type", "application/json");
	    xhttp.setRequestHeader("sessiontoken", session.getSessionUUID());
	    
	    xhttp.send();
	    
	    xhttp.onload = function(e) {
		    if (xhttp.status == 200) {
			    //console.log('response text is ' + xhttp.responseText);
			    
		    	if (callback) {
			    	var jsonresponse = JSON.parse(xhttp.responseText);
			    		    		
			    	if (jsonresponse['status'] && (jsonresponse['status'] == '1'))
			    		callback(null, jsonresponse);
			    	else 
			    		callback((jsonresponse['error'] ? jsonresponse['error'] : 'unknown error'), null);
		    	}
		    }
		    else {
		    	if (callback)
		    		callback(xhttp.statusText, null);	
			}
	    	
	    };
	    
	    xhttp.onerror = function (e) {
	    	console.error('rest error is ' + xhttp.statusText);
	    	
	    	if (callback)
	    		callback(xhttp.statusText, null);	
	    };*/
	    
	}
	
	rest_post(resource, postdata, callback) {
		var rest_connection = this.getRestConnection();
		
		return rest_connection.rest_post(resource, postdata, callback);
		/*console.log("Xtra_EthereumNodeAccess.rest_post called for resource " + resource);
		
		var session = this.session;
	    
		var xhttp = new XMLHttpRequest();
	    
	    var rest_server_url = this.session.getXtraConfigValue('rest_server_url');
	    var rest_server_api_path = this.session.getXtraConfigValue('rest_server_api_path');
	    var resource_url = rest_server_url + rest_server_api_path + resource;
	    
	    xhttp.open("POST", resource_url, true);
	    
	    xhttp.setRequestHeader("Content-type", "application/json");
	    xhttp.setRequestHeader("sessiontoken", session.getSessionUUID());
	    
	    xhttp.send(JSON.stringify(postdata));
	    
	    xhttp.onload = function(e) {
		    if (xhttp.status == 200) {
		    	if (callback) {
			    	var jsonresponse = JSON.parse(xhttp.responseText);
			    		    		
			    	if (jsonresponse['status'] && (jsonresponse['status'] == '1'))
			    		callback(null, jsonresponse);
			    	else 
			    		callback((jsonresponse['error'] ? jsonresponse['error'] : 'unknown error'), null);
		    	}
		    }
		    else {
		    	if (callback)
		    		callback(xhttp.statusText, null);	
			}
	    	
	    };
	    
	    xhttp.onerror = function (e) {
	    	console.error('rest error is ' + xhttp.statusText);
	    	
	    	if (callback)
	    		callback(xhttp.statusText, null);	
	    };*/
	    
	}
	
	//
	// rest API
	//
	
	ethnode_version(callback) {
		console.log("Xtra_EthereumNodeAccess.ethnode_version called");
		
		var self = this;
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/version";
				
				self.rest_get(resource, function (err, res) {
					if (res) {
						var version = res['version'];
						
						if (callback)
							callback(null, version);
						
						return resolve(version);
					}
					else {
						if (callback)
							callback('error', null);
						
						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('rest exception: ' + e);
			}
		});
		
		return promise;
		
	}

	//
	// Web3
	//
	
	// local instance
	_getWeb3Class() {
		return this.ethereumnodeaccessmodule.getWeb3Class(this.session);
	}
	
	_getWeb3Provider() {
		return  this.ethereumnodeaccessmodule.getWeb3Provider(this.session);
	}
	
	_getWeb3Instance() {
		if (this.web3instance)
			return this.web3instance;
		
		this.web3instance = this.ethereumnodeaccessmodule.getWeb3Instance(this.session);		
		
		console.log("web3 instance created in EthereumNodeAccess");
		
		return this.web3instance;
	}
	

	// node
	web3_isSyncing(callback) {
		console.log("Xtra_EthereumNodeAccess.web3_isSyncing called for " + address);
		
		var self = this;
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/node";
				
				var promise2 = self.rest_get(resource, function (err, res) {
					if (res) {
						if (callback)
							callback(null, res['issyncing']);
						
						return resolve(res['issyncing']);
					}
					else {
						if (callback)
							callback('error', null);
						
						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('rest exception: ' + e);
			}
		});
		
		return promise;
	}
	
	
	// accounts
	web3_getBalanceSync(address) {
		throw 'web3_getBalanceSync can not be served';
	}
	
	
	web3_getBalance(address, callback) {
		console.log("Xtra_EthereumNodeAccess.web3_getBalance called for " + address);
		
		var self = this;
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/web3/account/" + address + "/balance";
				
				var promise2 = self.rest_get(resource, function (err, res) {
					if (res) {
						var balance = res['balance'];
						
						if (callback)
							callback(null, balance);
						
						return resolve(balance);
					}
					else {
						if (callback)
							callback('error', null);
						
						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('rest exception: ' + e);
			}
		});
		
		return promise;
	}

	web3_getCode(address, callback) {
		var self = this;
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			try {
				var resource = "/web3/account/" + address + "/code";
				
				var promise2 = self.rest_get(resource, function (err, res) {
					if (res) {
						var code = res['code'];
						
						if (callback)
							callback(null, code);
						
						return resolve(code);
					}
					else {
						if (callback)
							callback('error', null);
						
						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise;
	}
	
	web3_unlockAccount(account, password, duration, callback) {
		var self = this;
		var address = account.getAddress();
		console.log("Xtra_EthereumNodeAccess.web3_unlockAccount called for " + address);
		
		var promise = new Promise(function (resolve, reject) {
			try {
				// we store the credentials and will use it later on
				self.credentials_storage.store(account.getAddress(), password, duration);
				
				if (callback)
					callback(null, true);
				
				// we can not know if password is correct
				// and return true by default
				return resolve(true); 
			}
			catch(e) {
				var err = 'exception in web3_unlockAccount: ' + e;
				
				if (callback)
					callback(err, null);

				reject(err);
			}
			
		});

		return promise;
		
	}
	
	web3_lockAccount(account, callback) {
		var self = this;
		var address = account.getAddress();
		
		console.log("Xtra_EthereumNodeAccess.web3_lockAccount called for " + address);

		var promise = new Promise(function (resolve, reject) {
			try {
				self.credentials_storage.remove(address);
				
				// TODO: make a rest call to lock on the server

				if (callback)
					callback(null, true);
				
				return resolve(true); 
			}
			catch(e) {
				var err = 'exception in web3_lockAccount: ' + e;
				
				if (callback)
					callback(err, null);

				reject(err);
			}
			
		});

		return promise;
	}

	// blocks
	web3_getBlockNumber(callback) {
		var self = this;
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			try {
				var resource = "/web3/block/currentnumber";
				
				var promise2 = self.rest_get(resource, function (err, res) {
					if (res) {
						var number = res['number'];
						
						if (callback)
							callback(null, number);
						
						return resolve(number);
					}
					else {
						if (callback)
							callback('error', null);
						
						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise;
	}
	
	web3_getBlock(blockid, bWithTransactions, callback) {
		var self = this;
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			try {
				var resource = "/web3/block/" + blockid + (bWithTransactions ? "/txs" : "");
				
				var promise2 = self.rest_get(resource, function (err, res) {
					if (res) {
						if (callback)
							callback(null, res['data']);
						
						return resolve(res['data']);
					}
					else {
						if (callback)
							callback('error', null);
						
						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise;
	}
	
	// transactions
	web3_findTransaction(transactionuuid, callback) {
		var self = this;
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			try {
				var resource = "/web3/findtx";
				
				var postdata = [];
				
				postdata = {transactionuuid: transactionuuid};

				var promise2 = self.rest_post(resource, postdata, function (err, res) {
					if (res) {
						if (callback)
							callback(null, res['data']);
						
						return resolve(res['data']);
					}
					else {
						if (callback)
							callback('error', null);
						
						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise;
	}

	web3_getTransactionList(callback) {
		var self = this;
		var session = this.session;
		var global = session.getGlobalObject();
		
		var user = session.getSessionUserObject();
		var useruuid = (user ? user.getUserUUID() : null);

		var promise = new Promise(function (resolve, reject) {
			try {
				var resource = "/web3/usertx";
				
				var postdata = [];
				
				postdata = {useruuid: useruuid};

				var promise2 = self.rest_post(resource, postdata, function (err, res) {
					if (res) {
						var txarray = res['data'];
						var transactionarray = [];
						
						for (var i = 0; i < txarray.length; i++) {
							var tx = txarray[i];
							
							var transactionuuid = tx['transactionuuid'];
							var creationdate = global.parseDate(tx['creationdate']);
							
							var transaction = session.getTransactionObject(transactionuuid);
							
							transaction.setTransactionHash(tx['transactionhash']);
							transaction.setFrom(tx['from']);
							transaction.setTo(tx['to']);
							transaction.setValue(tx['value']);
							transaction.setCreationDate(creationdate);
							transaction.setStatus(tx['status']);
						
							transactionarray.push(transaction);
						}
						
						if (callback)
							callback(null, transactionarray);
						
						return resolve(transactionarray);
					}
					else {
						if (callback)
							callback('rest error calling ' + resource + ' : ' + err, null);

						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise;
	}

	web3_getTransactionCount(fromaddress, callback) {
		var self = this;
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			try {
				var resource = "/web3/account/" + fromaddress + '/tx/count';
				
				var promise2 = self.rest_get(resource, function (err, res) {
					if (res) {
						if (callback)
							callback(null, res['count']);
						
						return resolve(res['count']);
					}
					else {
						if (callback)
							callback('error', null);
						
						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise;
	}
	
	web3_getTransaction(hash, callback) {
		var self = this;
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			try {
				var resource = "/web3/tx/" + hash;
				
				var promise2 = self.rest_get(resource, function (err, res) {
					if (res) {
						if (callback)
							callback(null, res['data']);
						
						return resolve(res['data']);
					}
					else {
						if (callback)
							callback('error', null);
						
						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise;
	}
	
	web3_getTransactionReceipt(hash, callback) {
		var self = this;
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			try {
				var resource = "/web3/tx/" + hash + "/receipt";
				
				var promise2 = self.rest_get(resource, function (err, res) {
					if (res) {
						if (callback)
							callback(null, res['data']);
						
						return resolve(res['data']);
					}
					else {
						if (callback)
							callback('error', null);
						
						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise
	}
	
	web3_sendEthTransaction(ethtransaction, callback) {
		console.log('EthereumNodeAccess.web3_sendEthTransaction called');
		
		if (!ethtransaction)
			throw 'no transaction defined';
		
		var self = this;
		var session = this.session;
		
		if (ethtransaction.getTransactionUUID() === null)
			ethtransaction.setTransactionUUID(session.guid());
		
		var transactionuuid = ethtransaction.getTransactionUUID();
		
		
		var promise = new Promise( function(resolve, reject) {
			
			try {
				//var web3 = self._getWeb3Instance();
				
			    
			    var txjson = ethtransaction.getTxJson();
			    
				// common callback function
				var __transactioncallback = function(err, res) {
					var transactionHash = res;
					console.log('EthereumNodeAccess.web3_sendTransaction transactionHash is ' + transactionHash);
			         
					if (!err) {
						if (callback)
							callback(null, transactionHash);
						
						ethtransaction.setTransactionHash(transactionHash);

						return resolve(transactionHash);
					}
					else {
						if (callback)
							callback('web3 error: ' + err, null);
						
						reject('web3 error: ' + err);
					}
				};
				
				var __sendTransaction = function(postdata, callback) {
					try {
						var resource = "/web3/sendtx";
						
						var promise2 = self.rest_post(resource, postdata, function (err, res) {
							if (res) {
								var transactionhash = res['transactionhash'];
								
								if (callback)
									callback(null, transactionhash);
								
								return transactionhash;
							}
							else {
								console.log("error sending transaction: " + err);
								
								if (callback)
									callback('rest error calling ' + resource + ' : ' + err, null);
							}
							
						});
						
						return promise2;
					}
					catch(e) {
						reject('rest exception: ' + e);
					}
					
				};
				
				// sending unsigned or signed
				if (ethtransaction.canSignTransaction()) {
					// signing the transaction
					
				    return ethtransaction.getRawData(function(err, raw) {
				    	if (!err) {
							var postdata = [];
							
							postdata = {transactionuuid: transactionuuid, 
									raw: raw,
									
									from: ethtransaction.getFromAddress(),
									to: ethtransaction.getToAddress(),
									
									value: ethtransaction.getValue(),

									gas: ethtransaction.getGas(),
									gasPrice: ethtransaction.getGasPrice(),

									data: ethtransaction.getData(),
									nonce: ethtransaction.getNonce()
									};
							
							return __sendTransaction(postdata, __transactioncallback);
				    	}
				    	else {
				    		__transactioncallback(err, null);
				    	}
				    });

				}
				else {
					// unsigned send (node will sign thanks to the unlocking of account)
					var postdata = [];
					
					postdata = {transactionuuid: transactionuuid, 
					
					from: ethtransaction.getFromAddress(),
					to: ethtransaction.getToAddress(),
					
					value: ethtransaction.getValue(),

					gas: ethtransaction.getGas(),
					gasPrice: ethtransaction.getGasPrice(),

					data: ethtransaction.getData(),
					nonce: ethtransaction.getNonce()
					};
					
					return __sendTransaction(postdata, __transactioncallback);
				}
				
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);

				reject('web3 exception: ' + e);
			}
		
		});
		
		return promise
	}
	
	web3_sendTransaction(fromaccount, toaccount, amount, gas, gasPrice, txdata, nonce, callback) {
		console.log('Xtra_EthereumNodeAccess.web3_sendTransaction called');
		
		var self = this;
		var session = this.session;
		
		if (!fromaccount)
			throw 'no sender specified for transaction';
		
		if ( (amount > 0) && !toaccount)
			throw 'no recipient specified for transaction. Use burn if you want to destroy ethers.';
		
		var fromaddress = fromaccount.getAddress();
		var toaddress = (toaccount ? toaccount.getAddress() : null);
		
		console.log('Xtra_EthereumNodeAccess.web3_sendTransaction called from ' + fromaddress + ' to ' + toaddress + ' amount ' + amount + ' transaction uuid ' + transactionuuid);

	    var ethtransaction = self.ethereumnodeaccessmodule.getEthereumTransactionObject(session, fromaccount);
	    
	    ethtransaction.setToAddress(toaddress);
	    ethtransaction.setValue(amount);
	    ethtransaction.setGas(gas);
	    ethtransaction.setGasPrice(gasPrice);
	    ethtransaction.setData(txdata);
	    ethtransaction.setNonce(nonce);
	    
		var transactionuuid = session.guid(); // maybe we could read it from txdata
		
		ethtransaction.setTransactionUUID(transactionuuid);

	    return this.web3_sendEthTransaction(ethtransaction, callback);
	}
	
	// contracts
	
	web3_loadArtifact(artifactpath, callback) {
		console.log('Xtra_EthereumNodeAccess.web3_loadArtifact called');
		
		var self = this;
		var session = this.session;
		var ethereumnodeaccessmodule = this.ethereumnodeaccessmodule;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/web3/artifact/load";
				
				var postdata = [];
				
				postdata = {artifactpath: artifactpath};
				
				self.rest_post(resource, postdata, function (err, res) {
					if (res) {
						var artifactuuid = res['artifactuuid'];
						var contractname = res['contractname'];
						var artifactpath = res['artifactpath'];
						var abi = res['abi'];
						var bytecode = res['bytecode'];
						
						var artifact = ethereumnodeaccessmodule.getArtifactProxyObject(artifactuuid, contractname, artifactpath, abi, bytecode);
						
						console.log("post_truffle_loadArtifact resolved with " + artifactuuid);
						
						return resolve(artifact);
					}
					else {
						if (callback)
							callback('error', null);
						
						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('rest exception: ' + e);
			}
		})
		.then(function (artifact) {
			// we chain the instantiation now because caller of
			// web3_loadContract does not expect a promise
			return new Promise(function (resolve, reject) {
				try {
					var resource = "/web3/contract/load";
					
					var postdata = [];
					
					postdata = {artifactuuid: artifact.artifactuuid};
					
					self.rest_post(resource, postdata, function (err, res) {
						if (res) {
							var contractuuid = res['contractuuid'];
							
							console.log("post_truffle_loadContract resolved with " + contractuuid);
							
							var contractproxy = ethereumnodeaccessmodule.getContractProxyObject(contractuuid, artifact);
							
							if (callback)
								callback(contractproxy);
							
							return resolve(contractproxy);
						}
						else {
							if (callback)
								callback('error', null);
							
							reject('rest error calling ' + resource + ' : ' + err);
						}
						
					});
				}
				catch(e) {
					console.log("error during loading of artifact: " + err);

					if (callback)
						callback('exception: ' + e, null);
					
					reject('rest exception: ' + e);
				}
			});
			
		}).then(function (prom) {
			return prom;
		}); 
		
		return promise;
	}
	
	web3_loadContract(artifact) {
		console.log('Xtra_EthereumNodeAccess.web3_loadContract called');
		
		// we actually receive a contractproxy because of the chaining above
		return artifact;
	}
	
	_mustBeSigned(params) {
		var session = this.session;
		
		let txjson = params[params.length - 1];
		let args = params.slice(0,-1);

		if (txjson instanceof EthereumTransaction) {
			var ethereumtransaction = params[params.length - 1];
			var fromaccount = ethereumtransaction.getFromAccount();
		}
		else {
			let fromaddress = txjson.from;
			var fromaccount = session.getAccountObject(fromaddress);
		}
		
		return fromaccount.canSignTransactions();
	}
	
	_waitTransactionReceipt(transactionHash, delay, callback) {
		var self = this;
		
		if (!this.loopnum)
			this.loopnum = [];
		
		if (typeof this.loopnum[transactionHash] === "undefined") 
			this.loopnum[transactionHash] = 0;
		else
			this.loopnum[transactionHash]++;
		
		console.log('loop number ' + this.loopnum[transactionHash]);

		self.web3_getTransactionReceipt(transactionHash, function(err, result) {
		    if(err) {
		        if (callback)
		        	callback('error executing getTransactionReceipt:  ' + err, null)
		    }
		    else {
		        if(result === null) {
		        	
		        	if (this.loopnum[transactionHash] < 200)
		            setTimeout(function() {
		            	self._waitTransactionReceipt(transactionHash, delay, callback);
		            }, delay);
		        }
		        else {
					//console.log('Xtra_EthereumNodeAccess._getPendingTransactionReceipt receipt is ' + JSON.stringify(result));

					if (callback)
			        	callback(null, result);
			        
			        return result;
		        }
		    }
		})
		.catch(err => {
        	if (this.loopnum[transactionHash] < 200)
			setTimeout(function() {
            	self._waitTransactionReceipt(transactionHash, delay, callback);
            }, delay);
		});
	}
	
	_getPendingTransactionReceipt(transactionHash, callback) {
		var self = this;

		return new Promise(function (resolve, reject) {
			try {
				self._waitTransactionReceipt(transactionHash, 500, function(err, res) {
					console.log('Xtra_EthereumNodeAccess._getPendingTransactionReceipt callback called for ' + transactionHash);
					
					if (!err) {
						
						if (callback)
							callback(null, res);
						
						return resolve(res);
					}
					else {
						console.log('Xtra_EthereumNodeAccess._getPendingTransactionReceipt error ' + JSON.stringify(err));

						if (callback)
							callback('web3 error: ' + err, null);
						
						reject('web3 error: ' + err);
					}
				
				});
			}
			catch(e) {
				if (callback)
					callback('exception: ' + e, null);
				
				reject('web3 exception: ' + e);
			}
			
		});		
	}
	
	web3_contract_new(web3contract, params, callback) {
		console.log('Xtra_EthereumNodeAccess.web3_contract_new called for contract ' + web3contract.getUUID());
		
		if (!web3contract) {
			throw "contract is not defined";
		}
		
		var self = this;
		var session = this.session;
		var ethereumnodeaccessmodule = this.ethereumnodeaccessmodule;
		
		var web3_contract_instance = ethereumnodeaccessmodule.getContractInstanceProxyObject(session.guid(), null, web3contract);
		
		var ethereumtransaction = ethereumnodeaccessmodule.unstackEthereumTransactionObject(session, params);
		let args = params.slice(0,-1);

		if (ethereumtransaction.getTransactionUUID() === null)
			ethereumtransaction.setTransactionUUID(session.guid());
		
		var transactionuuid = ethereumtransaction.getTransactionUUID();

		
		if (ethereumtransaction.canSignTransaction()) {
			// create a deploy transaction that will be signed on client's side
			var abi = web3contract.getAbi();
			var bytecode = web3contract.getByteCode();
			
			web3_contract_instance['contract'] = web3contract;
			
			if (!bytecode)
				throw 'no byte code, can not deploy contract';
			
			
			// then create a deploy transaction data
			let soliditycontract = ethereumnodeaccessmodule.getSolidityContractObject(session, abi);
			let deploy = soliditycontract.getDeployData(bytecode, args);
			
			ethereumtransaction.setData(deploy);
			
			// sending deploy transaction
			try {
				return this.web3_sendEthTransaction(ethereumtransaction, function(err, res) {
					if (!err) {
						var transactionHash = res;
						console.log('EthereumNodeAcces.web3_contract_new transaction hash is: ' + transactionHash);
						
						if (callback)
							callback(null, transactionHash);
						
						return transactionHash;
					}
					else {
						var error = 'error deploying contract: ' + err;
						console.log('EthereumNodeAcces.web3_contract_new error:' + error);
						
						if (callback)
							callback(error, null);
					}
					
				})
				.then(function(transactionHash) {
					return self._getPendingTransactionReceipt(transactionHash, function(err, res) {
						if (err) {
							console.log('contract deployment transaction is invalid: ' + transactionHash);
							
							if (callback)
								callback('contract deployment transaction is invalid: ' + transactionHash, null);
						}
						else {
							//console.log('contract deployment transaction receipt is: ' + JSON.stringify(res));
							return res;
						}
						
					});
				})
				.then(function(receipt) {
					if (receipt) {
						var address = receipt['contractAddress'];
						console.log('contract deployment address is ' + address);
						
						web3_contract_instance['address'] = address;
						
						return web3_contract_instance;
					}
				});
			}
			catch(e) {
				console.log('exception: ' + e);
			}
		}
		else {
			// unsigned, call server rest api to deploy with unlocked account
			var promise = new Promise(function (resolve, reject) {
				
				
				try {
					var contractuuid = web3contract.contractuuid;
					
					var resource = "/web3/contract/new";
					
					var postdata = [];
					
					let txjson = ethereumtransaction.getTxJson();
					
					var credentials = self.getTransactionCredentials(params);
					var walletaddress = (credentials['address'] ? credentials['address'] : null);
					var password = (credentials['password'] ? credentials['password'] : null);
					var time = (credentials['from'] ? credentials['from'] : null);
					var duration = (credentials['during'] ? credentials['during'] : null);
					
					postdata = {contractuuid: contractuuid, 
								walletaddress: walletaddress,
								password: password,
								time: time,
								duration: duration,
								args: JSON.stringify(args),
								txjson: JSON.stringify(txjson),
								transactionuuid: transactionuuid};
					
					var promise2 = self.rest_post(resource, postdata, function (err, res) {
						if (res) {
							
							web3_contract_instance.address = res['address'];
							web3_contract_instance.contractinstanceuuid = res['contractinstanceuuid'];
							
							return resolve(web3_contract_instance);
						}
						else {
							console.log("error during new of contract: " + err);
							reject('rest error calling ' + resource + ' : ' + err);
						}
						
					});
				}
				catch(e) {
					reject('rest exception: ' + e);
				}
			});
			
			return promise;
		}
	}


	getTransactionCredentials(params) {
		var session = this.session;
		var ethereumnodeaccessmodule = this.ethereumnodeaccessmodule;
		
		var ethereumtransaction = ethereumnodeaccessmodule.unstackEthereumTransactionObject(session, params);
		let args = params.slice(0,-1);
		
		var payeraddress = ethereumtransaction.getPayerAddress();
		
		
		if (payeraddress) {
			var credentials = this.credentials_storage.retrieve(payeraddress);
			
			if (!credentials)
				console.log('no credentials found for ' + payeraddress);
			
			return credentials;
		}
		else {
			console.log('no payer found for transaction');
		}
	}
	

	web3_abi_load_at(abi, address, callback) {

		var abijsonstring = JSON.stringify(abi);
		
		var self = this;
		var session = this.session;
		var ethereumnodeaccessmodule = this.ethereumnodeaccessmodule;
		
		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/web3/contract/at";
				
				var postdata = [];
				
				postdata = {address: address, abi: abijsonstring};
				
				self.rest_post(resource, postdata, function (err, res) {
					var contractinstanceuuid = res['contractinstanceuuid'];
					
					var artifact = ethereumnodeaccessmodule.getArtifactProxyObject(session.guid(), null, abi.contractName, abi, null);
					var contract = ethereumnodeaccessmodule.getContractProxyObject(session.guid(), artifact);
					
					var constractinstanceproxy = ethereumnodeaccessmodule.getContractInstanceProxyObject(contractinstanceuuid, address, contract);
					
					if (callback)
						callback(null, constractinstanceproxy);
					
					return resolve(constractinstanceproxy);				
				});
			}
			catch(e) {
				if (callback)
					callback('rest exception: ' + e, null);

				reject('rest exception: ' + e);
			}
		}); 
		
		return promise;

	}
	
	web3_contract_at(web3contract, address, callback) {
		console.log('Xtra_EthereumNodeAccess.web3_contract_at called');
		
		var self = this;
		var session = this.session;
		var ethereumnodeaccessmodule = this.ethereumnodeaccessmodule;
		
		var contractuuid = web3contract.contractuuid;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/web3/contract/at";
				
				var postdata = [];
				
				postdata = {contractuuid: contractuuid, address: address};
				
				var promise2 = self.rest_post(resource, postdata, function (err, res) {
					if (res) {
						var contractinstanceuuid = res['contractinstanceuuid'];
						
						console.log("loading of contract successful, contractinstanceuuid is " + contractinstanceuuid);
						
						var constractinstanceproxy = ethereumnodeaccessmodule.getContractInstanceProxyObject(contractinstanceuuid, address, web3contract);
						
						resolve(constractinstanceproxy);
						
						return Promise.resolve(constractinstanceproxy);
					}
					else {
						console.log("error during loading of contract: " + err);
						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				reject('rest exception: ' + e);
			}
		});
		
		return promise;
	}

	
	_web3_contract_dynamicMethodCall(web3_contract, abidef, params, callback) {
		console.log("Xtra_EthereumNodeAccess._web3_contract_dynamicMethodCall called for contractinstanceuuid " + web3_contract.contractinstanceuuid + " and method " + abidef.name);
		
		if (!web3_contract) {
			throw "contract instance is not defined";
		}
		
		var self = this;
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var address = web3_contract.getAddress();
				var contractinstanceuuid = web3_contract.contractinstanceuuid;
				var abidefjsonstring = JSON.stringify(abidef);
				
				var resource = "/web3/contract/" + address + "/call";
				
				var postdata = [];
				
				postdata = {contractinstanceuuid: contractinstanceuuid, 
							abidef: abidefjsonstring, 
							params: JSON.stringify(params)};
				
				var promise2 = self.rest_post(resource, postdata, function (err, res) {
					if (res) {
						var result = res['result'];
						
						return resolve(result);
					}
					else {
						console.log("error during web3_contract_dynamicMethodCall: " + err);
						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				reject('rest exception: ' + e);
			}
		});
		
		return promise;
	}
	
	web3_method_call(web3_contract_instance, methodname, params, callback) {
		console.log('Xtra_EthereumNodeAccess.web3_method_call called for method ' + methodname+ ' and contractinstanceuuid ' + web3_contract_instance.getUUID() );
		
		if (!web3_contract_instance) {
			throw "contract instance is not defined";
		}
		
		var self = this;
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var address = web3_contract_instance.getAddress();
				var contractinstanceuuid = web3_contract_instance.contractinstanceuuid;
				
				var resource = "/web3/contract/" + address + "/call";
				
				var postdata = [];
				
				postdata = {contractinstanceuuid: contractinstanceuuid, 
							methodname: methodname, 
							params: JSON.stringify(params)};
				
				var promise2 = self.rest_post(resource, postdata, function (err, res) {
					if (res) {
						var result = res['result'];
						
						return resolve(result);
					}
					else {
						console.log("error during web3_method_call: " + err);
						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				reject('rest exception: ' + e);
			}
		});
		
		return promise;
	}
	
	web3_method_sendTransaction(web3_contract_instance, methodname, params, callback) {
		console.log('Xtra_EthereumNodeAccess.web3_method_sendTransaction called for method ' + methodname+ ' and contractinstanceuuid ' + web3_contract_instance.getUUID() );
		
		if (!web3_contract_instance) {
			throw "contract instance is not defined";
		}
		
		var self = this;
		var session = this.session;
		var ethereumnodeaccessmodule = this.ethereumnodeaccessmodule;
		
		var ethereumtransaction = ethereumnodeaccessmodule.unstackEthereumTransactionObject(session, params);
		let args = params.slice(0,-1);

		if (ethereumtransaction.getTransactionUUID() === null)
			ethereumtransaction.setTransactionUUID(session.guid());
		
		var transactionuuid = ethereumtransaction.getTransactionUUID();

		
		if (ethereumtransaction.canSignTransaction()) {
			var abi = web3_contract_instance.getAbi()
			var contractaddress = web3_contract_instance.getAddress();

			// create a call transaction data
			let soliditycontract = ethereumnodeaccessmodule.getSolidityContractObject(session, abi);
			let abidef = soliditycontract.getMethodAbiDefinition(methodname);
			let calldata = soliditycontract.getCallData(contractaddress, abidef, args);
			
			ethereumtransaction.setData(calldata);
			ethereumtransaction.setToAddress(contractaddress);
			
			// sending method transaction
			try {
				return this.web3_sendEthTransaction(ethereumtransaction, function(err, res) {
					if (!err) {
						var transactionHash = res;
						console.log('Xtra_EthereumNodeAccess._web3_contract_dynamicSendTransaction transaction hash is ' + transactionHash);
						
						if (callback)
							callback(null, transactionHash);
						
						return transactionHash;
					}
					else {
						console.log('Xtra_EthereumNodeAccess._web3_contract_dynamicSendTransaction error: ' + err);
						
						if (callback)
							callback('Xtra_EthereumNodeAccess._web3_contract_dynamicSendTransaction error: ' + err, null);
					}
					
				});
			}
			catch(e) {
				console.log('exception: ' + e);
			}
		}
		else {

			var promise = new Promise(function (resolve, reject) {
				
				try {
					var address = web3_contract_instance.getAddress();
					var contractinstanceuuid = web3_contract_instance.contractinstanceuuid;
					
					var resource = "/web3/contract/" + address + "/send";
					
					var postdata = [];
					
					let txjson = ethereumtransaction.getTxJson();
					
					var credentials = self.getTransactionCredentials(params);
					var walletaddress = (credentials['address'] ? credentials['address'] : null);
					var password = (credentials['password'] ? credentials['password'] : null);
					var time = (credentials['from'] ? credentials['from'] : null);
					var duration = (credentials['during'] ? credentials['during'] : null);
					
					postdata = {contractinstanceuuid: contractinstanceuuid, 
								walletaddress: walletaddress,
								password: password,
								time: time,
								duration: duration,
								methodname: methodname, 
								args: JSON.stringify(args),
								txjson: JSON.stringify(txjson),
								transactionuuid: transactionuuid};
					
					var promise2 = self.rest_post(resource, postdata, function (err, res) {
						if (res) {
							var transactionHash = res['transactionhash'];
							
							ethtransaction.setTransactionHash(transactionHash);

							if (callback)
								callback(null, transactionHash);
							
							return resolve(transactionHash);
						}
						else {
							console.log("error during web3_method_sendTransaction: " + err);
							
							
							if (callback)
								callback('Xtra_EthereumNodeAccess._web3_contract_dynamicSendTransaction error: ' + err, null);
							
							reject('rest error calling ' + resource + ' : ' + err);
						}
						
					});
				}
				catch(e) {
					reject('rest exception: ' + e);
				}
			});
			
			return promise;
		}
	}

		
	//
	// Truffle
	//
	truffle_loadArtifact(artifactpath, callback) {
		console.log("Xtra_EthereumNodeAccess.truffle_loadArtifact called for " + artifactpath);
		
		return this.web3_loadArtifact(artifactpath, callback);
	}
	
	truffle_loadContract(artifact) {
		console.log('artifact is ' + JSON.stringify(artifact));
		console.log("Xtra_EthereumNodeAccess.truffle_loadContract called for artifact " + (artifact.getUUID ? artifact.getUUID() : null));
		
		return this.web3_loadContract(artifact) ;
	}
	
	truffle_contract_at(trufflecontract, address) {
		console.log("Xtra_EthereumNodeAccess.truffle_contract_at called for contractuuid " + (trufflecontract.getUUID ? trufflecontract.getUUID() : null) + " and blockchain address " + address);
		
		return this.web3_contract_at(trufflecontract, address)
	}

	
	truffle_contract_new(trufflecontract, params) {
		console.log("Xtra_EthereumNodeAccess.truffle_contract_new called for contractuuid " + trufflecontract.contractuuid);
		
		return this.web3_contract_new(trufflecontract, params);
	}

	truffle_method_call(constractinstance, methodname, params) {
		console.log("Xtra_EthereumNodeAccess.truffle_method_call called for contractinstanceuuid " + constractinstance.contractinstanceuuid + " and method " + methodname);
		
		return this.web3_method_call(constractinstance, methodname, params)
	}
	
	truffle_method_sendTransaction(constractinstance, methodname, params) {
		console.log("Xtra_EthereumNodeAccess.truffle_method_sendTransaction called for contractinstanceuuid " + constractinstance.getUUID() + " and method " + methodname);
		
		return this.web3_method_sendTransaction(constractinstance, methodname, params)
	}
	
	
	// uuid
	guid() {
		// we could make a rest call to get a more
		// "universal" guid factory
		function s4() {
		    return Math.floor((1 + Math.random()) * 0x10000)
		      .toString(16)
		      .substring(1);
		  }
		  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		    s4() + '-' + s4() + s4() + s4();
	}

}

console.log("Xtra_EthereumNodeAccess is loaded");

if ( typeof window !== 'undefined' && window ) // if we are in browser and not node js (e.g. truffle)
window.Xtra_EthereumNodeAccess = Xtra_EthereumNodeAccess;
else
module.exports = Xtra_EthereumNodeAccess; // we are in node js
