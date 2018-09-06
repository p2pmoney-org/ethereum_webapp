/**
 * 
 */
'use strict';


class AuthKeyControllers {
	
	constructor(global) {
		this.global = global;
	}
	
	//
	// auth API
	//
	authorize(req, res) {
		var AuthKeyService = require('../../server/includes/authkey/authkey-service.js');
		var service = AuthKeyService.getService();
		var version = service.getVersion();
	  	
		var jsonresult = {status: 1, version:  version};
		
	  	res.json(jsonresult);
	}
	
	
	session_authenticate(req, res) {
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		
		global.log("session_authenticate called for sessiontoken " + sessionuuid);
		
		var username  = req.body.username;
		var password = req.body.password;
		
		var authkeyservice = global.getServiceInstance('authkey');
		var authenticationserver = authkeyservice.getAuthenticationServerInstance();

		var jsonresult;
		
		try {
			if (authenticationserver.authenticateUser(username, password)) {
				// authenticate session
				var commonservice = global.getServiceInstance('common');
				var Session = commonservice.Session;

				var session = Session.getSession(global, sessionuuid);
				
				var user = authenticationserver.getUser(session, username);
				
				session.impersonateUser(user);
				
				// return user details
				jsonresult = {status: 1, useruuid: user.getUserUUID(), username: user.getUserName(), useremail: user.getUserEmail()};
			}
			else {
				jsonresult = {status: 0, error: "could not authenticate this session with the provided credentials"};
			}
		}
		catch(e) {
			global.log("exception in session_authenticate for sessiontoken " + sessionuuid + ": " + e);
			jsonresult = {status: 0, error: "exception could not authenticate session"};
		}

		global.log("session_authenticate response is " + JSON.stringify(jsonresult));
	  	
	  	res.json(jsonresult);
	}

	session_logout(req, res) {
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		
		global.log("session_logout called for sessiontoken " + sessionuuid);
		
		var useruuid  = req.body.useruuid;
		
		var authkeyservice = global.getServiceInstance('authkey');
		var authenticationserver = authkeyservice.getAuthenticationServerInstance();

		var jsonresult;
		
		try {
			var commonservice = global.getServiceInstance('common');
			var Session = commonservice.Session;

			var session = Session.getSession(global, sessionuuid);
			var user = (session ? session.getUser() : null);

			if (user && (user.getUserUUID() == useruuid)) {
				session.logout();
				
				// return user details
				jsonresult = {status: 1, useruuid: user.getUserUUID(), username: user.getUserName(), useremail: user.getUserEmail()};
			}
			else {
				jsonresult = {status: 0, error: "could not logout session with receiving the corresponding user name"};
			}
		}
		catch(e) {
			global.log("exception in session_logout for sessiontoken " + sessionuuid + ": " + e);
			jsonresult = {status: 0, error: "exception could not authenticate session"};
		}

		global.log("session_logout response is " + JSON.stringify(jsonresult));
	  	
	  	res.json(jsonresult);
	}

	session_getUser(req, res) {
		var global = this.global;
		
		var sessionid =  req.params.id;
		var sessionuuid = req.get("sessiontoken");
		
		global.log("session_getUser called for sessiontoken " + sessionuuid);
		
		var jsonresult;

		try {
			if (sessionid == sessionuuid) {
				var authkeyservice = global.getServiceInstance('authkey');
				var authenticationserver = authkeyservice.getAuthenticationServerInstance();

				
				var commonservice = global.getServiceInstance('common');
				var Session = commonservice.Session;

				var session = Session.getSession(global, sessionuuid);
				
				if (!session.isAnonymous()) {
					var user = session.getUser();
					
					jsonresult = {status: 1, useruuid: user.getUserUUID(), username: user.getUserName(), useremail: user.getUserEmail()};
				}
				else {
					jsonresult = {status: 0, error: "session is anonymous"};
				}
				
			}
			else {
				jsonresult = {status: 0, error: "can not query details of another session"};
			}
		}
		catch(e) {
			global.log("exception in session_getUser for sessiontoken " + sessionuuid + ": " + e);
			jsonresult = {status: 0, error: "exception could not retrieve user details"};
		}
		
	  	
	  	res.json(jsonresult);
	}

	//
	// key API
	//
	session_getKeys(req, res) {
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		
		global.log("session_getKeys called for sessiontoken " + sessionuuid);
		
		var authkeyservice = global.getServiceInstance('authkey');
		var authenticationserver = authkeyservice.getAuthenticationServerInstance();
		
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		var session = Session.getSession(global, sessionuuid);
		
		var jsonresult;
		
		try {
			if (!session.isAnonymous()) {
				// get user details
				var userkeys = authenticationserver.getUserKeys(session);
			
				
				var keysjson = [];
				
				for (var i = 0; i < userkeys.length; i++) {
					var userkey = userkeys[i];
					var json = {key_uuid: userkey['uuid'], private_key: userkey['private_key'], public_key: userkey['public_key'], address: userkey['address']};
					
					keysjson.push(json);
				}
				
				jsonresult = {status: 1, keys: keysjson};
				global.log("session_getKeys called for sessiontoken "+ sessionuuid + " jsonresult is " + JSON.stringify(jsonresult));
			}
			else {
				jsonresult = {status: 0, error: "session is anonymous"};
			}
		}
		catch(e) {
			global.log("exception in session_getKeys for sessiontoken " + sessionuuid + ": " + e);
			jsonresult = {status: 0, error: "exception could not retrieve keys"};
		}

		
	  	res.json(jsonresult);
	}

}

module.exports = AuthKeyControllers;