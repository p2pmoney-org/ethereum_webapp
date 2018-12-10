'use strict';


class Xtra_StorageAccess {
	constructor(session) {
		this.session = session;
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
	}
	
	rest_post(resource, postdata, callback) {
		var rest_connection = this.getRestConnection();
		
		return rest_connection.rest_post(resource, postdata, callback);
	}

	rest_put(resource, postdata, callback) {
		var rest_connection = this.getRestConnection();
		
		return rest_connection.rest_put(resource, postdata, callback);
	}

	
	rest_delete(resource, callback) {
		var rest_connection = this.getRestConnection();
		
		return rest_connection.rest_delete(resource, callback);
	}
	
	
	// client side
	readClientSideJson(keys) {
		var session = this.session;
		var global = session.getGlobalObject();
		var storagemodule = global.getModuleObject('storage-access');
		
		var jsonleaf = storagemodule.readClientSideJson(session, keys);
		
		return jsonleaf;
	}
	
	saveClientSideJson(keys, json) {
		var session = this.session;
		var global = session.getGlobalObject();
		var storagemodule = global.getModuleObject('storage-access');
		
		storagemodule.saveClientSideJson(session, keys, json);
	}
	

	//
	// rest Storage API
	//
	
	
	// user
	_keystostring(keys) {
		var key = '';
		
		for (var i =0; i < keys.length; i++) {
			key += (i > 0 ? '-' : '') + keys[i]
		}
		
		return key;
	}
	

	readUserJson(keys, callback) {
		var key = this._keystostring(keys);
		
		console.log("Xtra_StorageAccess.readUserJson called for " + key);

		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/storage/user";
				
				var postdata = [];
				
				postdata = {key: key};
				
				self.rest_post(resource, postdata, function (err, res) {
					if (res) {
						var reskey = res['key'];
						var content = (reskey == key ? res['content'] : null);
						
						var json = (content ? JSON.parse(content) : {});
						
						if (callback)
							callback(null, json);
						
						return resolve(json);
					}
					else {
						reject('rest error calling ' + resource + ' : ' + err, res);
					}
					
				});
			}
			catch(e) {
				reject('rest exception: ' + e);
			}
		});
		
		return promise;
	}
	
	saveUserJson(keys, json, callback) {
		var key = this._keystostring(keys);
		
		console.log("Xtra_StorageAccess.saveUserJson called for " + key);
		
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/storage/user";
				
				var contentstring = JSON.stringify(json);
				
				var postdata = [];
				
				postdata = {key: key, content: contentstring};
				
				self.rest_put(resource, postdata, function (err, res) {
					if (res) {
						var content = (res['content'] ? JSON.parse(res['content']) : {});
						
						if (callback)
							callback(null, content);
						
						return resolve(content);
					}
					else {
						reject('rest error calling ' + resource + ' : ' + err, res);
					}
					
				});
			}
			catch(e) {
				reject('rest exception: ' + e);
			}
		});
		
		return promise;
	}
	
	// user storage
	account_session_keys(callback) {
		console.log("Xtra_StorageAccess.account_session_keys called");
		
		var self = this;
		var session = this.session;
		var global = session.getGlobalObject();
		var cryptoencryptionmodule = global.getModuleObject('cryptokey-encryption');

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/account/session/keys";
				
				self.rest_get(resource, function (err, res) {
					if (res) {
						var reskeys = res['keys'];

						// we decrypt the keys
						var keysjson = cryptoencryptionmodule.decryptJsonArray(session, reskeys);
						
						var json = {keys: keysjson};
						
						if (callback)
							callback(null, json);
						
						return resolve(json);
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
	
	user_add_account(user, account, callback) {
		console.log("Xtra_StorageAccess.user_add_account called");
		
		var self = this;
		var session = this.session;
		var global = session.getGlobalObject();
		var cryptoencryptionmodule = global.getModuleObject('cryptokey-encryption');

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/account/user/add";
				
				var useruuid = user.getUserUUID();
				
				var privatekey = account.getPrivateKey();
				
				var cryptokey = cryptoencryptionmodule.pickCryptoKeyEncryptionInstance(session);
				var encryptedprivatekey = cryptoencryptionmodule.encryptPrivateKey(privatekey, cryptokey);
					
				var publickey = account.getPublicKey();
				var address = account.getAddress();
				var rsapublickey = account.getRsaPublicKey();
				
				var description = account.getDescription();
				
				var postdata = [];
				
				postdata = {useruuid: useruuid, private_key: encryptedprivatekey, public_key: publickey, address: address, rsa_public_key: rsapublickey, description: description};
				
				self.rest_put(resource, postdata, function (err, res) {
					if (res) {
						
						// set account uuid given by the server
						var accountuuid = res['account_uuid'];
						
						account.setAccountUUID(accountuuid);
						
						if (callback)
							callback(null, res);
						
						return resolve(res);
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

	user_update_account(user, account, callback) {
		console.log("Xtra_StorageAccess.user_update_account called");
		
		var self = this;
		var session = this.session;
		var global = session.getGlobalObject();
		var cryptoencryptionmodule = global.getModuleObject('cryptokey-encryption');

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/account/user/update";
				
				var useruuid = user.getUserUUID();
				
				var accountuuid = account.getAccountUUID();
				var privatekey = account.getPrivateKey();
				
				var cryptokey = cryptoencryptionmodule.pickCryptoKeyEncryptionInstance(session);
				var encryptedprivatekey = cryptoencryptionmodule.encryptPrivateKey(privatekey, cryptokey);
					
				var publickey = account.getPublicKey();
				var address = account.getAddress();
				var rsapublickey = account.getRsaPublicKey();
				
				var description = account.getDescription();
				
				var postdata = [];
				
				postdata = {useruuid: useruuid, account_uuid: accountuuid, private_key: encryptedprivatekey, public_key: publickey, address: address, rsa_public_key: rsapublickey, description: description};
				
				self.rest_put(resource, postdata, function (err, res) {
					if (res) {
						
						// set account uuid given by the server
						var accountuuid = res['account_uuid'];
						
						account.setAccountUUID(accountuuid);
						
						if (callback)
							callback(null, res);
						
						return resolve(res);
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

}


if ( typeof window !== 'undefined' && window ) // if we are in browser and not node js (e.g. truffle)
window.Xtra_StorageAccess = Xtra_StorageAccess;
else
module.exports = Xtra_StorageAccess; // we are in node js
