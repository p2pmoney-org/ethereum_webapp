/**
 * 
 */
'use strict';

var Global = require('./global.js');

var global = Global.getGlobalInstance();

var EthereumNode = require('./ethnode.js');


class SessionMap {
	constructor() {
		this.map = Object.create(null); // use a simple object to implement the map
	}
	
	getSession(uuid) {
		var key = uuid.toString().toLowerCase();
		
		if (key in this.map) {
			return this.map[key];
		}
	}
	
	pushSession(session) {
		var key = session.session_uuid.toString().toLowerCase();

		this.map[key] = session;
	}
	
	removeSession(session) {
		var key = session.session_uuid.toString().toLowerCase();

		delete this.map[key];
	}
	
	count() {
		return Object.keys(this.map).length
	}
	
	empty() {
		this.map = Object.create(null);
	}
}

var sessionmap = new SessionMap();

class Session {
	constructor() {
		this.ethereum_node = null;
		
		this.session_uuid = null;
		
		this.user = null;
		
		this.creation_date = Date.now();
		
		// object map
		this.objectmap = Object.create(null);
	}
	
	getEthereumNode() {
		if (this.ethereum_node)
			this.ethereum_node;
		
		this.ethereum_node = new EthereumNode(this);
		
		return this.ethereum_node;
	}
	
	getSessionUUID() {
		return this.session_uuid;
	}
	
	guid() {
		  function s4() {
		    return Math.floor((1 + Math.random()) * 0x10000)
		      .toString(16)
		      .substring(1);
		  }
		  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		    s4() + '-' + s4() + s4() + s4();
	}

	pushObject(key, object) {
		this.objectmap[key] = object;
	}
	
	getObject(key) {
		if (key in this.objectmap) {
			return this.objectmap[key];
		}
	}
	
	removeObject(key) {
		delete this.map[key];
	}
	
	// session
	authenticate(username, password) {
		global.log("Session.authenticate called for user '" + username);
		var users = global.users;
		
		for (var i = 0; i < users.length; i++) {
			var user = users[i];

			if ((user['username'] == username) && (user['password'] == password)) {
				this.user = user;
				
				return true;
			}
		}
		
		return false;
	}
	
	getUser() {
		return this.user;
	}
	
	// static
	static getSession(sessionuuid) {
		var session;
		
		var key = sessionuuid.toString();
		var mapvalue = sessionmap.getSession(key);
		
		var account;
		
		if (mapvalue !== undefined) {
			// is already in map
			session = mapvalue;
		}
		else {
			session = new Session();
			session.session_uuid = sessionuuid;
			
			sessionmap.pushSession(session);
		}
		
		return session;
	}
}


module.exports = Session;