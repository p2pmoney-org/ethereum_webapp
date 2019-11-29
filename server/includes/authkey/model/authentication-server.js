/**
 * 
 */
'use strict';


class AuthenticationServer {
	constructor(service) {
		this.service = service;
		this.global = service.global;
		
		this.CryptoKey = require('./cryptokey');
		
		var Persistor = require('./interface/database-persistor.js');
		
		this.persistor =  new Persistor(service);
	}
	
	_getUserArray(username) {
		return this.persistor.getUserArray(username);
	}
	
	authenticateUser(username, password) {
		var global = this.global;
		var authkeyservice = this.service;
		
		global.log("AuthenticationServer.authenticate called for user " + username);
		
		
		var userdetails = this._getUserArray(username);
		
		var PasswordObject = require('./passwordobject.js');
		
		var hashmethod = (userdetails['hashmethod'] ? userdetails['hashmethod'] : 0);
		var salt = (userdetails['salt'] ? userdetails['salt'] : null);
		var pepper = null;
		
		var inputpasswordobject = authkeyservice.createPasswordObjectInstance(password, salt, pepper, hashmethod);
		
		var userpasswordobject = authkeyservice.createPasswordObjectInstance(userdetails['password'], salt, pepper, hashmethod);
	
		//global.log("userdetails is " + JSON.stringify(userdetails));

		if (userpasswordobject.equals(inputpasswordobject)) {
			return true;
		}
		
		return false;
		
	}
	
	getUserDetails(session) {
		var username = session.getUser().getUserName();
		
		return this._getUserArray(username);
	}
	
	getUserKeysFromUserUUID(session, useruuid) {
		var keys = this.persistor.getUserKeysFromUserUUID(useruuid);
		
		return keys;
	}
	
	_getCryptoKeyInstanceFromUserKey(key) {
		var authkeyservice = this.service;
		var cryptokey = authkeyservice.createBlankCryptoKeyInstance();

		cryptokey.setKeyUUID(key['keyuuid']);
		
		cryptokey.setUserUUID(key['useruuid']);
		cryptokey.setType(key['type']);
		
		cryptokey.setAddress(key['address']);
		cryptokey.setPublicKey(key['public_key']);
		cryptokey.setRsaPublicKey(key['rsa_public_key']);
		cryptokey.setPrivateKey(key['private_key']);
		
		cryptokey.setDescription(key['description']);

		return cryptokey;
	}
	
	getUserKeys(session) {
		var user = session.getUser();
		
		if (!user)
			throw 'session is not identified';
		
		var useruuid = user.getUserUUID();
		
		var keys = this.persistor.getUserKeysFromUserUUID(useruuid);
		
		// create array of cryptokey objects
		var cryptokeys = [];
		
		var authkeyservice = this.service;

		// let's compute public keys from private keys
		var global = this.global;
		
		var cryptoservice = global.getServiceInstance('crypto');
		var cryptoserverinstance = cryptoservice.getCryptoServerInstance()
		
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			
			var privatekey = key['private_key'];
			
			if (cryptoserverinstance.isValidPrivateKey(session, privatekey)) {
				var pubkeys = cryptoserverinstance.getPublicKeys(session, privatekey);
				
				key['public_key'] = pubkeys['public_key'];
				key['address'] = pubkeys['address'];
			}
			
			var cryptokey = this._getCryptoKeyInstanceFromUserKey(key);

			cryptokeys.push(cryptokey);
		}
		
		return cryptokeys;
	}
	
	getUserKeyFromUUID(session, keyuuid) {
		var userkeys = this.getUserKeys(session);
		
		for (var i = 0; i < userkeys.length; i++) {
			var userkey = userkeys[i];
			
			if (userkey['keyuuid'] == keyuuid) {
				return userkey;
			}
			
		}
	}
	
	getUserCryptoKeys(session) {
		var userkeys = this.getUserKeys(session);
		
		var usercryptokeys = [];
		
		for (var i = 0; i < userkeys.length; i++) {
			var userkey = userkeys[i];
			
			if (userkey['type'] == this.CryptoKey.ENCRYPTION_KEY) {
				usercryptokeys.push(userkey);
			}
			
		}
		
		return usercryptokeys;
	}
	
	getUserCryptoKeyFromUUID(session, keyuuid) {
		var userkey = this.getUserKeyFromUUID(session, keyuuid);
		
		if (userkey && (userkey['type'] == this.CryptoKey.ENCRYPTION_KEY))
			return userkey;
	}
	
	getUserAccountKeys(session) {
		var userkeys = this.getUserKeys(session);
		
		var useracountkeys = [];
		
		for (var i = 0; i < userkeys.length; i++) {
			var userkey = userkeys[i];
			
			if (userkey['type'] == this.CryptoKey.TRANSACTION_KEY) {
				useracountkeys.push(userkey);
			}
			
		}
		
		return useracountkeys;
	}
	
	getUserAccountKeyFromUUID(session, keyuuid) {
		var userkey = this.getUserKeyFromUUID(session, keyuuid);
		
		if (userkey && (userkey['type'] == this.CryptoKey.TRANSACTION_KEY))
			return userkey;
	}
	
	addUserKey(session, useruuid, cryptokey) {
		var keyuuid = cryptokey.getKeyUUID();
		
		var type = cryptokey.getType(); 
		
		var privatekey = cryptokey.getPrivateKey();
		var publickey = cryptokey.getPublicKey();
		var address = cryptokey.getAddress();
		var rsapublickey = cryptokey.getRsaPublicKey();
		
		// TODO: generate public keys from private key if they have not been filled
		
		var description = cryptokey.getDescription(); 
		
		this.persistor.putUserKey(useruuid, keyuuid, privatekey, publickey, address, rsapublickey, type, description);
	}

	saveUserKey(session, useruuid, cryptokey) {
		var keyuuid = cryptokey.getKeyUUID();
		
		// update only description for existing key
		var description = cryptokey.getDescription(); 
		
		this.persistor.updateUserKey(useruuid, keyuuid, description);
	}

	reactivateUserKey(session, useruuid, cryptokey) {
		var keyuuid = cryptokey.getKeyUUID();
		var sessionuseruuid = session.getUserUUID();
		
		if (sessionuseruuid != useruuid)
			throw 'can not activate a key from another user';
		
		this.persistor.reactivateUserKey(useruuid, keyuuid);
	}

	
	deactivateUserKey(session, useruuid, cryptokey) {
		var keyuuid = cryptokey.getKeyUUID();
		var sessionuseruuid = session.getUserUUID();
		
		if (sessionuseruuid != useruuid)
			throw 'can not deactivate a key from another user';
		
		this.persistor.deactivateUserKey(useruuid, keyuuid);
	}

	
	removeUserKey(session, useruuid, cryptokey) {
		var keyuuid = cryptokey.getKeyUUID();
		var sessionuseruuid = session.getUserUUID();
		
		if (sessionuseruuid != useruuid)
			throw 'can not deactivate a key from another user';
		
		// we should not delete a key, we should just put a flag telling is has been deactivated
		this.persistor.deactivateUserKey(useruuid, keyuuid);
	}

	
	_getUserFromArray(commonservice, userdetails) {
		var user = commonservice.createBlankUserInstance();
		
		user.setUserName(userdetails['username']);
		
		if (userdetails['useremail'])
			user.setUserEmail(userdetails['useremail']);
		
		if (userdetails['useruuid'])
			user.setUserUUID(userdetails['useruuid']);
		
		user.setAccountStatus(userdetails['accountstatus'] ? userdetails['accountstatus'] : 2);
		
		return user;
	}
	
	getUser(session, username) {
		var userdetails = this._getUserArray(username);
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		
		var user = this._getUserFromArray(commonservice, userdetails);
		
		return user;
	}
	
	userExistsFromUUID(useruuid) {
		var global = this.global;
		var userdetails = this.persistor.getUserArrayFromUUID(useruuid);
		
		return (userdetails.useruuid == useruuid);
	}
	
	getUserFromUUID(session, useruuid) {
		// TODO: check this sessions has the rights to read this user
		if (!session.isAuthenticated())
			throw 'Session is not authenticated';
		
		var currentuser = session.getUser();
		
		if ((currentuser.getUserUUID() != useruuid) && (!currentuser.isSuperAdmin()))
			throw 'User does not have the rights to read another user';
			
		var userdetails = this.persistor.getUserArrayFromUUID(useruuid);
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		
		var user = this._getUserFromArray(commonservice, userdetails);
		
		return user;
	}
	
	saveUser(session, user) {
		var global = this.global;
		
		var array = {};
		
		array.useruuid = user.getUserUUID();
		array.useremail = user.getUserEmail();
		array.username = user.getUserName();
		array.accountstatus = user.getAccountStatus();
		
		array.altloginmethod = (user.altloginmethod ? user.altloginmethod : 'none');
		global.log('user.altloginmethod is ' + user.altloginmethod);
		
		this.persistor.putUserArray(array);
	}
	
	saveUserPassword(session, useruuid, passwordobject) {
		var global = this.global;

		var array = {};
		
		array.hashmethod = passwordobject.hashmethod
		array.password = (passwordobject.hashmethod == 0 ? passwordobject.clearpassword : passwordobject.hashpassword);
		array.salt = passwordobject.salt;

		this.persistor.putUserPassword(useruuid, array);
	}
	
	getUsers(session) {
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		
		var usersarray = this.persistor.getUsers();
		
		var array = [];
		
		for (var i = 0; i < usersarray.length; i++) {
			var userdetails = usersarray[i];
			array.push(this._getUserFromArray(commonservice, userdetails));
		}
		
		return array;
	}
}

module.exports = AuthenticationServer;