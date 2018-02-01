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


class Xtra_EthereumNodeAccess {
	constructor(session) {
		this.session = session;
	}
	
	rest_get(resource, callback) {
		console.log("Xtra_EthereumNodeAccess.rest_get called for resource " + resource);
		
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
			    console.log('response text is ' + xhttp.responseText);
			    
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
		    		callback(xhr.statusText, null);	
			}
	    	
	    };
	    
	    xhttp.onerror = function (e) {
	    	console.error('rest error is ' + xhttp.statusText);
	    	
	    	if (callback)
	    		callback(xhttp.statusText, null);	
	    };
	    
	}
	
	rest_post(resource, postdata, callback) {
		console.log("Xtra_EthereumNodeAccess.rest_post called for resource " + resource);
		
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
	    };
	    
	}
	
	//
	// rest API
	//
	webapp_version(callback) {
		console.log("Xtra_EthereumNodeAccess.webapp_session_authenticate called");
		
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
						reject('rest error calling ' + resource);
					}
					
				});
			}
			catch(e) {
				reject('rest exception: ' + e);
			}
		});
		
		return promise;
		
	}
	
	
	webapp_session_authenticate(username, password, callback) {
		console.log("Xtra_EthereumNodeAccess.webapp_session_authenticate called");
		
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/session/authenticate";
				
				var postdata = [];
				
				postdata = {username: username, password: password};
				
				self.rest_post(resource, postdata, function (err, res) {
					if (res) {
						
						if (callback)
							callback(null, res);
						
						return resolve(res);
					}
					else {
						reject('rest error calling ' + resource);
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
	web3_getBalance(address) {
		var web3 = this.session.getWeb3Instance();
		var balance = web3.eth.getBalance(address);
		
		return balance;
	}
	
	web3_getBalance(address, callback) {
		console.log("Xtra_EthereumNodeAccess.web3_getBalance called for " + address);
		
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/web3/" + address + "/balance";
				
				var promise2 = self.rest_get(resource, function (err, res) {
					if (res) {
						var balance = res['balance'];
						
						if (callback)
							callback(null, balance);
						
						return resolve(balance);
					}
					else {
						reject('rest error calling ' + resource);
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
						reject('rest error calling ' + resource);
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
							reject('rest error calling ' + resource);
						}
						
					});
				}
				catch(e) {
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
						
						var constractinstanceproxy = new ContractInstanceProxy(address, contractinstanceuuid);
						
						resolve(constractinstanceproxy);
						
						return Promise.resolve(constractinstanceproxy);
					}
					else {
						reject('rest error calling ' + resource);
					}
					
				});
			}
			catch(e) {
				reject('rest exception: ' + e);
			}
		});
		
		return promise;
	}

	truffle_contract_new(constractinstance, params) {
		console.log("Xtra_EthereumNodeAccess.truffle_contract_new called for contractinstanceuuid " + constractinstance.contractinstanceuuid + " and method " + methodname);
		
		if (!constractinstance) {
			throw "contract instance is not defined";
		}
		
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var address = constractinstance.getAddress();
				var contractinstanceuuid = constractinstance.contractinstanceuuid;
				
				var resource = "/truffle/contract/new";
				
				var postdata = [];
				
				postdata = {contractinstanceuuid: contractinstanceuuid, methodname: methodname, params: JSON.stringify(params)};
				
				var promise2 = self.rest_post(resource, postdata, function (err, res) {
					if (res) {
						var constractinstanceproxy = new ContractInstanceProxy(res['address'], res['contractinstanceuuid']);
						
						return resolve(constractinstanceproxy);
					}
					else {
						reject('rest error calling ' + resource);
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
				
				postdata = {contractinstanceuuid: contractinstanceuuid, methodname: methodname, params: JSON.stringify(params)};
				
				var promise2 = self.rest_post(resource, postdata, function (err, res) {
					if (res) {
						var result = res['result'];
						
						return resolve(result);
					}
					else {
						reject('rest error calling ' + resource);
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
				
				postdata = {contractinstanceuuid: contractinstanceuuid, methodname: methodname, params: JSON.stringify(params)};
				
				var promise2 = self.rest_post(resource, postdata, function (err, res) {
					if (res) {
						var result = res['result'];
						
						return resolve(result);
					}
					else {
						reject('rest error calling ' + resource);
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

console.log("Xtra_EthereumNodeAccess is loaded");

if ( typeof window !== 'undefined' && window ) // if we are in browser and not node js (e.g. truffle)
window.Xtra_EthereumNodeAccess = Xtra_EthereumNodeAccess;
else
module.exports = Xtra_EthereumNodeAccess; // we are in node js

