'use strict';

class ContractInstanceProxy {
	constructor(address, contractinstanceuuid) {
		this.address = address;
		this.contractinstanceuuid = contractinstanceuuid;
	}
	
	getAddress() {
		return this.address;
	}
}

class CredentialsStorage {
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
		
		var self = this
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

	//
	// Web3
	//

	// node
	web3_isSyncing(callback) {
		console.log("Xtra_EthereumNodeAccess.web3_isSyncing called for " + address);
		
		var self = this
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
	
	
	// accounts
	web3_getBalanceSync(address) {
		throw 'web3_getBalanceSync can not be served';
	}
	
	
	web3_getBalance(address, callback) {
		console.log("Xtra_EthereumNodeAccess.web3_getBalance called for " + address);
		
		var self = this
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

	web3_getCode(address, callback) {
		var self = this
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
						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise;
	}
	
	web3_unlockAccount(account, password, duration) {
		// we store the credentials and will use it later on
		// to keep it a sync call
		var address = account.getAddress();
		console.log("Xtra_EthereumNodeAccess.web3_unlockAccount called for " + address);

		this.credentials_storage.store(account.getAddress(), password, duration);
		
		// we can not know if password is correct
		// and return true by default
		return true; 
		
	}
	
	web3_lockAccount(account) {
		var address = account.getAddress();
		
		console.log("Xtra_EthereumNodeAccess.web3_lockAccount called for " + address);

		this.credentials_storage.remove(address);
		
		// TODO: make a rest call to lock on the server
	}

	// blocks
	web3_getBlockNumber(callback) {
		var self = this
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
						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise;
	}
	
	web3_getBlock(blockid, bWithTransactions, callback) {
		var self = this
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
						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise;
	}
	
	// transactions
	web3_getTransaction(hash, callback) {
		var self = this
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
						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise;
	}
	
	web3_getTransactionReceipt(hash, callback) {
		var self = this
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
						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				reject('web3 exception: ' + e);
			}
			
		});
		
		return promise
	}
	
	// contracts
	web3_contract_load_at(abi, address, callback) {

		var abijsonstring = JSON.stringify(abi);
		
		var self = this
		var session = this.session;
		
		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/web3/contract/load";
				
				var postdata = [];
				
				postdata = {address: address, abi: abijsonstring};
				
				self.rest_post(resource, postdata, function (err, res) {
					var contractinstanceuuid = res['contractinstanceuuid'];
					var constractinstanceproxy = new ContractInstanceProxy(address, contractinstanceuuid);
					
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
	
	web3_contract_dynamicMethodCall(web3_contract, abidef, params, callback) {
		console.log("Xtra_EthereumNodeAccess.web3_contract_dynamicMethodCall called for contractinstanceuuid " + web3_contract.contractinstanceuuid + " and method " + abidef.name);
		
		if (!web3_contract) {
			throw "contract instance is not defined";
		}
		
		var self = this
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
	
	
	//
	// Truffle
	//
	truffle_loadArtifact(artifactpath, callback) {
		console.log("Xtra_EthereumNodeAccess.truffle_loadArtifact called for " + artifactpath);

		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/truffle/artifact/load";
				
				var postdata = [];
				
				postdata = {artifactpath: artifactpath};
				
				self.rest_post(resource, postdata, function (err, res) {
					if (res) {
						var artifact = res['artifact'];
						
						/*if (callback)
							callback(artifact);*/
						
						console.log("post_truffle_loadArtifact resolved with " + artifact);
						
						return resolve(artifact);
					}
					else {
						reject('rest error calling ' + resource + ' : ' + err);
					}
					
				});
			}
			catch(e) {
				reject('rest exception: ' + e);
			}
		})
		.then(function (artifact) {
			// we chain the instantiation now because caller of
			// truffle_loadContract does not expect a promise
			return new Promise(function (resolve, reject) {
				try {
					var resource = "/truffle/contract/load";
					
					var postdata = [];
					
					postdata = {artifact: artifact};
					
					self.rest_post(resource, postdata, function (err, res) {
						if (res) {
							var contractuuid = res['contractuuid'];
							
							console.log("post_truffle_loadContract resolved with " + contractuuid);
							
							if (callback)
								callback(contractuuid);
							
							return resolve(contractuuid);
						}
						else {
							reject('rest error calling ' + resource + ' : ' + err);
						}
						
					});
				}
				catch(e) {
					console.log("error during loading of artifact: " + err);
					reject('rest exception: ' + e);
				}
			});
			
		}).then(function (prom) {
			return prom;
		}); 
		
		return promise;
	}
	
	truffle_loadContract(artifact) {
		console.log("Xtra_EthereumNodeAccess.truffle_loadContract called " + artifact);
		
		return artifact;
	}
	
	truffle_contract_at(trufflecontract, address) {
		console.log("Xtra_EthereumNodeAccess.truffle_contract_at called for contractuuid " + trufflecontract + " and blockchain address " + address);
		
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/truffle/contract/at";
				
				var postdata = [];
				
				postdata = {contractuuid: trufflecontract, address: address};
				
				var promise2 = self.rest_post(resource, postdata, function (err, res) {
					if (res) {
						var contractinstanceuuid = res['contractinstanceuuid'];
						
						console.log("loading of contract successful, contractinstanceuuid is " + contractinstanceuuid);
						
						var constractinstanceproxy = new ContractInstanceProxy(address, contractinstanceuuid);
						
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

	getTransactionCredentials(params) {
		// last param contains json for transaction
		var json = params[params.length - 1];
		
		if (json['from']) {
			var payeraddress = json['from'];
			
			var credentials = this.credentials_storage.retrieve(payeraddress);
			
			if (!credentials)
				console.log('no credentials found for ' + payeraddress);
			
			return credentials;
		}
		else {
			console.log('no from field found in json');
		}
	}
	
	
	truffle_contract_new(trufflecontract, params) {
		console.log("Xtra_EthereumNodeAccess.truffle_contract_new called for contractuuid " + trufflecontract);
		
		if (!trufflecontract) {
			throw "contract is not defined";
		}
		
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var contractuuid = trufflecontract;
				
				var resource = "/truffle/contract/new";
				
				var postdata = [];
				
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
							params: JSON.stringify(params)};
				
				var promise2 = self.rest_post(resource, postdata, function (err, res) {
					if (res) {
						var constractinstanceproxy = new ContractInstanceProxy(res['address'], res['contractinstanceuuid']);
						
						return resolve(constractinstanceproxy);
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

	truffle_method_call(constractinstance, methodname, params) {
		console.log("Xtra_EthereumNodeAccess.truffle_method_call called for contractinstanceuuid " + constractinstance.contractinstanceuuid + " and method " + methodname);
		
		if (!constractinstance) {
			throw "contract instance is not defined";
		}
		
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var address = constractinstance.getAddress();
				var contractinstanceuuid = constractinstance.contractinstanceuuid;
				
				var resource = "/truffle/contract/" + address + "/call";
				
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
						console.log("error during truffle_method_call: " + err);
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
	
	truffle_method_sendTransaction(constractinstance, methodname, params) {
		console.log("Xtra_EthereumNodeAccess.truffle_method_sendTransaction called for contractinstanceuuid " + constractinstance.contractinstanceuuid + " and method " + methodname);
		
		if (!constractinstance) {
			throw "contract instance is not defined";
		}
		
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var address = constractinstance.getAddress();
				var contractinstanceuuid = constractinstance.contractinstanceuuid;
				
				var resource = "/truffle/contract/" + address + "/send";
				
				var postdata = [];
				
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
							params: JSON.stringify(params)};
				
				var promise2 = self.rest_post(resource, postdata, function (err, res) {
					if (res) {
						var result = res['result'];
						
						return resolve(result);
					}
					else {
						console.log("error during truffle_method_sendTransaction: " + err);
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

