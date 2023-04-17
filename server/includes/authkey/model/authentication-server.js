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

		this.authkey_server_passthrough = service.authkey_server_passthrough;
	}
	
	_getUserArray(username) {
		return this.persistor.getUserArray(username);
	}
	
	async _getUserArrayAsync(username) {
		return this.persistor.getUserArrayAsync(username);
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

	async authenticateUserAsync(username, password) {
		var global = this.global;
		var authkeyservice = this.service;
		
		global.log("AuthenticationServer.authenticate called for user " + username);
		
		
		var userdetails = await this._getUserArrayAsync(username);
		
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


	_canAccessUser(session, useruuid) {
		if (!session.isAuthenticated())
			return false;
		
		var currentuser = session.getUser();
		
		if ((currentuser.getUserUUID() != useruuid) && (!currentuser.isSuperAdmin()))
			return false;
			
		return true;
	}

	async _canAccessUserAsync(session, useruuid) {
		var isAuthenticated = await session.isAuthenticatedAsync();

		if (!isAuthenticated)
			return false;
		
		var currentuser = session.getUser();
		
		if ((currentuser.getUserUUID() != useruuid) && (!currentuser.isSuperAdmin()))
			return false;
			
		return true;
	}

	// read
	_readRealUserDetails(session, useruuid) {
		var _useruuid =  this._getSafeUserUUID(session, useruuid)
		var userdetails = this.persistor.getUserArrayFromUUID(_useruuid);

		if (!userdetails || !userdetails['useruuid'])
			return;

		// we replace the potentially hashed uuid back to this one
		userdetails['useruuid'] = useruuid;

		return userdetails;
	}

	async _readRealUserDetailsAsync(session, useruuid) {
		var _useruuid =  this._getSafeUserUUID(session, useruuid)
		var userdetails = await this.persistor.getUserArrayFromUUIDAsync(_useruuid);

		if (!userdetails || !userdetails['useruuid'])
			return;

		// we replace the potentially hashed uuid back to this one
		userdetails['useruuid'] = useruuid;

		return userdetails;
	}

	_readRealUserFromArray(commonservice, session, userdetails) {
		var user = commonservice.createBlankUserInstance();

		var _realuseruuid = (session.getUser() ? session.getUser().getUserUUID() : null);
		var _safeuseruuid = this._getSafeUserUUID(session);
		
		user.setUserName(userdetails['username']);
		
		if (userdetails['useremail'])
			user.setUserEmail(userdetails['useremail']);
		
		if (userdetails['useruuid']) {
			// we replace user uuid with real useruuid if it
			// has been transformed
			var _useruuid = userdetails['useruuid'];

			if (_safeuseruuid && (_safeuseruuid == _useruuid) && (_useruuid != _realuseruuid))
			_useruuid = _realuseruuid;

			user.setUserUUID(_useruuid);
		}
			
		
		user.setAccountStatus(userdetails['accountstatus'] ? userdetails['accountstatus'] : 2);
		
		return user;
	}

	_readRealUserKey(session, userkey) {
		var _realuseruuid = (session.getUser() ? session.getUser().getUserUUID() : null);
		var _safeuseruuid = this._getSafeUserUUID(session);

		if (userkey['useruuid']) {
			// we replace user uuid with real useruuid if it
			// has been transformed
			var _useruuid = userkey['useruuid'];

			if (_safeuseruuid && (_safeuseruuid == _useruuid) && (_useruuid != _realuseruuid)) {
				userkey['useruuid'] = _realuseruuid;
			}
		}

		return userkey;
	}

	// write
	_getSafeUserUUID(session, useruuid) {
		var global = this.global;
		var _useruuid;

		if (useruuid) {
			if (this.authkey_server_passthrough !== true)
			return useruuid;

			_useruuid = useruuid;
		}
		else {
			// get current session's useruuid
			var currentuser = session.getUser();
		
			if (!currentuser)
				return null;
	
			_useruuid = currentuser.getUserUUID();

			if ((!_useruuid) && (!currentuser.isSuperAdmin()))
				throw 'user has no uuid';
		}

		if (session.auth_url_hash && (session.auth_url_hash != 'default')) {

			// we replace useruuid with a hash of url and useruuid 
			// to avoid collisions between different urls
			// (or proxies) of same authentication server
			var userid = this.service.getUserIdHash(_useruuid);

			return session.auth_url_hash + '-' + userid;
		}
		else {
			return _useruuid;
		}

	}
	
	// API
	getUserDetails(session) {
		var username = session.getUser().getUserName();
		
		return this._getUserArray(username);
	}

	async getUserDetailsAsync(session) {
		var username = session.getUser().getUserName();
		
		return this._getUserArrayAsync(username);
	}

	
	getUserKeysFromUserUUID(session, useruuid) {
		var _useruuid = this._getSafeUserUUID(session, useruuid);

		var keys = this.persistor.getUserKeysFromUserUUID(_useruuid);

		for (var i = 0; i < (keys ? keys.length : 0); i++) {
			keys[i] = this._readRealUserKey(session, keys[i]);
		}
		
		return keys;
	}
	
	async getUserKeysFromUserUUIDAsync(session, useruuid) {
		var _useruuid = this._getSafeUserUUID(session, useruuid);

		var keys = await this.persistor.getUserKeysFromUserUUIDAsync(_useruuid);

		for (var i = 0; i < (keys ? keys.length : 0); i++) {
			keys[i] = this._readRealUserKey(session, keys[i]);
		}
		
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
		var _useruuid = this._getSafeUserUUID(session);
		
		var keys = this.persistor.getUserKeysFromUserUUID(_useruuid);
		
		for (var i = 0; i < (keys ? keys.length : 0); i++) {
			keys[i] = this._readRealUserKey(session, keys[i]);
		}
		
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

	async getUserKeysAsync(session) {
		var _useruuid = this._getSafeUserUUID(session);
		
		var keys = await this.persistor.getUserKeysFromUserUUIDAsync(_useruuid);
		
		for (var i = 0; i < (keys ? keys.length : 0); i++) {
			keys[i] = this._readRealUserKey(session, keys[i]);
		}
		
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
	
	async getUserKeyFromUUIDAsync(session, keyuuid) {
		var userkeys = await this.getUserKeysAsync(session);
		
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
	
	async getUserCryptoKeysAsync(session) {
		var userkeys = await this.getUserKeysAsync(session);
		
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
	
	async getUserCryptoKeyFromUUIDAsync(session, keyuuid) {
		var userkey = await this.getUserKeyFromUUIDAsync(session, keyuuid);
		
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
	
	async getUserAccountKeysAsync(session) {
		var userkeys = await this.getUserKeysAsync(session);
		
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
	
	async getUserAccountKeyFromUUIDAsync(session, keyuuid) {
		var userkey = await this.getUserKeyFromUUIDAsync(session, keyuuid);
		
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
		
		var _useruuid = this._getSafeUserUUID(session, useruuid);

		this.persistor.putUserKey(_useruuid, keyuuid, privatekey, publickey, address, rsapublickey, type, description);
	}

	async addUserKeyAsync(session, useruuid, cryptokey) {
		var keyuuid = cryptokey.getKeyUUID();
		
		var type = cryptokey.getType(); 
		
		var privatekey = cryptokey.getPrivateKey();
		var publickey = cryptokey.getPublicKey();
		var address = cryptokey.getAddress();
		var rsapublickey = cryptokey.getRsaPublicKey();
		
		// TODO: generate public keys from private key if they have not been filled
		
		var description = cryptokey.getDescription(); 
		
		var _useruuid = this._getSafeUserUUID(session, useruuid);

		await this.persistor.putUserKeyAsync(_useruuid, keyuuid, privatekey, publickey, address, rsapublickey, type, description);
	}

	saveUserKey(session, useruuid, cryptokey) {
		var keyuuid = cryptokey.getKeyUUID();
		
		// update only description for existing key
		var description = cryptokey.getDescription();
		
		var _useruuid = this._getSafeUserUUID(session, useruuid);

		this.persistor.updateUserKey(_useruuid, keyuuid, description);
	}

	async saveUserKeyAsync(session, useruuid, cryptokey) {
		var keyuuid = cryptokey.getKeyUUID();
		
		// update only description for existing key
		var description = cryptokey.getDescription();
		
		var _useruuid = this._getSafeUserUUID(session, useruuid);

		await this.persistor.updateUserKeyAsync(_useruuid, keyuuid, description);
	}

	reactivateUserKey(session, useruuid, cryptokey) {
		var keyuuid = cryptokey.getKeyUUID();
		
		if (!this._canAccessUser(session, useruuid) )
			throw 'can not activate a key from another user';
		
		var _useruuid = this._getSafeUserUUID(session, useruuid);
		
		this.persistor.reactivateUserKey(_useruuid, keyuuid);
	}

	async reactivateUserKeyAsync(session, useruuid, cryptokey) {
		var keyuuid = cryptokey.getKeyUUID();
		
		var canAccess = await this._canAccessUserAsync(session, useruuid)
		
		if (!canAccess)
			throw 'can not activate a key from another user';
		
		var _useruuid = this._getSafeUserUUID(session, useruuid);
		
		await this.persistor.reactivateUserKeyAsync(_useruuid, keyuuid);
	}
	
	deactivateUserKey(session, useruuid, cryptokey) {
		var keyuuid = cryptokey.getKeyUUID();

		if (!this._canAccessUser(session, useruuid) )
			throw 'can not deactivate a key from another user';

		var _useruuid = this._getSafeUserUUID(session, useruuid);
		
		this.persistor.deactivateUserKey(_useruuid, keyuuid);
	}

	async deactivateUserKeyAsync(session, useruuid, cryptokey) {
		var keyuuid = cryptokey.getKeyUUID();

		var canAccess = await this._canAccessUserAsync(session, useruuid)
		
		if (!canAccess)
			throw 'can not deactivate a key from another user';

		var _useruuid = this._getSafeUserUUID(session, useruuid);
		
		await this.persistor.deactivateUserKeyAsync(_useruuid, keyuuid);
	}

	
	removeUserKey(session, useruuid, cryptokey) {
		var keyuuid = cryptokey.getKeyUUID();
		
		if (!this._canAccessUser(session, useruuid) )
			throw 'can not remove a key from another user';

		var _useruuid = this._getSafeUserUUID(session, useruuid);

		// we should not delete a key, we should just put a flag telling is has been deactivated
		this.persistor.deactivateUserKey(_useruuid, keyuuid);
	}

	async removeUserKeyAsync(session, useruuid, cryptokey) {
		var keyuuid = cryptokey.getKeyUUID();
		
		var canAccess = await this._canAccessUserAsync(session, useruuid)
		
		if (!canAccess)
			throw 'can not remove a key from another user';

		var _useruuid = this._getSafeUserUUID(session, useruuid);

		// we should not delete a key, we should just put a flag telling is has been deactivated
		await this.persistor.deactivateUserKeyAsync(_useruuid, keyuuid);
	}

	
	
	getUser(session, username) {
		var userdetails = this._getUserArray(username);
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		
		var user = this._readRealUserFromArray(commonservice, session, userdetails);
		
		return user;
	}
	
	async getUserAsync(session, username) {
		var userdetails = await this._getUserArrayAsync(username);
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		
		var user = this._readRealUserFromArray(commonservice, session, userdetails);
		
		return user;
	}
	
	userExistsFromUUID(session, useruuid) {
		if (!useruuid)
			return false;
		
		var global = this.global;

		var userdetails = this._readRealUserDetails(session, useruuid);
		
		return (userdetails && (userdetails.useruuid == useruuid) ? true : false);
	}

	async userExistsFromUUIDAsync(session, useruuid) {
		if (!useruuid)
			return false;
		
		var global = this.global;

		var userdetails = await this._readRealUserDetailsAsync(session, useruuid);
		
		return (userdetails && (userdetails.useruuid == useruuid) ? true : false);
	}

	getUserFromUUID(session, useruuid) {
		if (!session.isAuthenticated())
			throw 'Session is not authenticated';
		
		if (!this._canAccessUser(session, useruuid) )
			throw 'User does not have the rights to read another user';
			
		var userdetails = this._readRealUserDetails(session, useruuid);
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		
		var user = this._readRealUserFromArray(commonservice, session, userdetails);
		
		return user;
	}
	
	async getUserFromUUIDAsync(session, useruuid) {
		var isAuthenticated = await session.isAuthenticatedAsync();

		if (!isAuthenticated)
			throw 'Session is not authenticated';

		var canAccess = await this._canAccessUserAsync(session, useruuid)
		
		if (!canAccess)
			throw 'User does not have the rights to read another user';
			
		var userdetails = this._readRealUserDetails(session, useruuid);
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		
		var user = this._readRealUserFromArray(commonservice, session, userdetails);
		
		return user;
	}
	
	saveUser(session, user) {
		var global = this.global;
		
		var array = {};

		var useruuid = user.getUserUUID();
		var _useruuid = this._getSafeUserUUID(session, useruuid);

		array.useruuid = _useruuid;
		array.useremail = user.getUserEmail();
		array.username = user.getUserName();
		array.accountstatus = user.getAccountStatus();
		
		array.altloginmethod = (user.altloginmethod ? user.altloginmethod : 'none');
		global.log('user.altloginmethod is ' + user.altloginmethod);
		
		this.persistor.putUserArray(array);
	}
	
	async saveUserAsync(session, user) {
		var global = this.global;
		
		var array = {};

		var useruuid = user.getUserUUID();
		var _useruuid = this._getSafeUserUUID(session, useruuid);

		array.useruuid = _useruuid;
		array.useremail = user.getUserEmail();
		array.username = user.getUserName();
		array.accountstatus = user.getAccountStatus();
		
		array.altloginmethod = (user.altloginmethod ? user.altloginmethod : 'none');
		global.log('user.altloginmethod is ' + user.altloginmethod);
		
		await this.persistor.putUserArrayAsync(array);
	}
	
	saveUserPassword(session, useruuid, passwordobject) {
		var global = this.global;

		var array = {};
		
		array.hashmethod = passwordobject.hashmethod
		array.password = (passwordobject.hashmethod == 0 ? passwordobject.clearpassword : passwordobject.hashpassword);
		array.salt = passwordobject.salt;

		var _useruuid = this._getSafeUserUUID(session, useruuid);

		this.persistor.putUserPassword(_useruuid, array);
	}
	
	async saveUserPasswordAsync(session, useruuid, passwordobject) {
		var global = this.global;

		var array = {};
		
		array.hashmethod = passwordobject.hashmethod
		array.password = (passwordobject.hashmethod == 0 ? passwordobject.clearpassword : passwordobject.hashpassword);
		array.salt = passwordobject.salt;

		var _useruuid = this._getSafeUserUUID(session, useruuid);

		await this.persistor.putUserPasswordAsync(_useruuid, array);
	}

	getUsers(session) {
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		
		var usersarray = this.persistor.getUsers();
		
		var array = [];
		
		for (var i = 0; i < usersarray.length; i++) {
			var userdetails = usersarray[i];
			array.push(this._readRealUserFromArray(commonservice, session, userdetails));
		}
		
		return array;
	}

	async getUsersAsync(session) {
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		
		var usersarray = await this.persistor.getUsersAsync();
		
		var array = [];
		
		for (var i = 0; i < usersarray.length; i++) {
			var userdetails = usersarray[i];
			array.push(this._readRealUserFromArray(commonservice, session, userdetails));
		}
		
		return array;
	}
}

module.exports = AuthenticationServer;