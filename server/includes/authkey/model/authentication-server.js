/**
 * 
 */
'use strict';


class AuthenticationServer {
	constructor(global) {
		this.global = global;
	}
	
	_getUserArray(username) {
		var global = this.global;
		
		var users = global.users;
		
		for (var i = 0; i < users.length; i++) {
			var user = users[i];

			if (user['username'] == username) {
				return user;
			}
		}
	}
	
	authenticateUser(username, password) {
		var global = this.global;
		
		global.log("AuthenticationServer.authenticate called for user '" + username);
		
		
		var userdetails = this._getUserArray(username);

		if ((userdetails['username'] == username) && (userdetails['password'] == password)) {
			return true;
		}
		
		return false;
		
	}
	
	getUserDetails(session) {
		var username = session.getUser().getUserName();
		
		return this._getUserArray(username);
	}
	
	getUserKeys(session) {
		var user = session.getUser();
		var username = user.getUserName();
		
		var userdetails = this._getUserArray(username);
		
		var keys = [];
		
		var key = [];
		key['private_key'] = userdetails['private_key'];
		key['public_key'] = userdetails['public_key'];
		key['address'] = userdetails['address'];
		
		keys.push(key);
		
		return keys;
	}
	
	getUser(username) {
		var userdetails = this._getUserArray(username);
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		
		var user = commonservice.createBlankUserInstance();
		
		user.setUserName(userdetails['username']);
		
		if (userdetails['useremail'])
			user.setUserEmail(userdetails['useremail']);
		
		if (userdetails['useruuid'])
			user.setUserUUID(userdetails['useruuid']);
		
		return user;
	}
}

module.exports = AuthenticationServer;