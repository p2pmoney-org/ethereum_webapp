/**
 * 
 */
'use strict';


class AuthenticationServer {
	constructor(service) {
		this.service = service;
		this.global = service.global;
		
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
		
		var inputpasswordobject = authkeyservice.createPasswordObject(password, salt, pepper, hashmethod);
		
		var userpasswordobject = authkeyservice.createPasswordObject(userdetails['password'], salt, pepper, hashmethod);
	
		global.log("userdetails password is " + userdetails['password']);

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
	
	getUserKeys(session) {
		var user = session.getUser();
		var username = user.getUserName();
		
		var keys = this.persistor.getUserKeys(username);
		
		return keys;
	}
	
	addUserKey(session, useruuid, keyuuid, privatekey) {
		this.persistor.putUserKey(useruuid, keyuuid, privatekey);
	}

	removeUserKey(session, useruuid, keyuuid) {
		this.persistor.removeUserKey(useruuid, keyuuid);
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
	
	getUserFromUUID(session, useruuid) {
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