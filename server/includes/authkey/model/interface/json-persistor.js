/**
 * 
 */
'use strict';


class JsonPersistor {
	constructor(service) {
		this.service = service;
		this.global = service.global;
	}
	
	getUserArray(username) {
		var global = this.global;
		var authkeyservice = this.service;
		
		var users = authkeyservice.users;
		
		for (var i = 0; i < users.length; i++) {
			var user = users[i];

			if (user['username'] == username) {
				return user;
			}
		}
	}
	
	getUserKeys(username) {
		var userdetails = this.getUserArray(username);
		
		var keys = [];
		
		var key = [];
		key['private_key'] = userdetails['private_key'];
		key['public_key'] = userdetails['public_key'];
		key['address'] = userdetails['address'];
		
		keys.push(key);
		
		return keys;
	}
	
}


module.exports = JsonPersistor;