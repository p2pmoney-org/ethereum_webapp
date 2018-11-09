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
		// GET
		var AuthKeyService = require('../../server/includes/authkey/authkey-service.js');
		var service = AuthKeyService.getService();
		var version = service.getVersion();
	  	
		var jsonresult = {status: 1, version:  version};
		
	  	res.json(jsonresult);
	}
	
	
	session_authenticate(req, res) {
		// POST
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
		// POST
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
		// GET
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
	session_getCryptoKeys(req, res) {
		// GET
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		
		global.log("session_getCryptoKeys called for sessiontoken " + sessionuuid);
		
		var authkeyservice = global.getServiceInstance('authkey');
		var authenticationserver = authkeyservice.getAuthenticationServerInstance();
		
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		var jsonresult;
		
		try {
			var session = Session.getSession(global, sessionuuid);
			
			if (!session.isAnonymous()) {
				// get user details
				var userkeys = authenticationserver.getUserCryptoKeys(session);
				
				var keysjson = [];
				
				if (userkeys.length == 0) {
					// user does not have a single crypto key
					// we generate one now and save it
					var type = 0; // crypto key
					var keyuuid = session.guid();
					
					var cryptokey = authkeyservice.createBlankCryptoKeyInstance();
					
					cryptokey.setKeyUUID(keyuuid);
					cryptokey.setType(type);
					
					cryptokey.generatePrivateKey();
					
					cryptokey.setDescription('generated on first call');
					
					var user = session.getUser();
					var useruuid = user.getUserUUID();
					
					authenticationserver.addUserKey(session, useruuid, cryptokey);
					
					userkeys = authenticationserver.getUserCryptoKeys(session);
				}
				
				for (var i = 0; i < userkeys.length; i++) {
					var userkey = userkeys[i];
					
					var json = {key_uuid: userkey['uuid'], 
							private_key: userkey['private_key'], 
							public_key: userkey['public_key'], 
							rsa_public_key: userkey['rsa_public_key'], 
							address: userkey['address'],
							description: userkey['description']};
					
					keysjson.push(json);
					
				}
				
				jsonresult = {status: 1, keys: keysjson};
				//global.log("session_getCryptoKeys called for sessiontoken "+ sessionuuid + " jsonresult is " + JSON.stringify(jsonresult));
			}
			else {
				jsonresult = {status: 0, error: "session is anonymous"};
			}
		}
		catch(e) {
			global.log("exception in session_getCryptoKeys for sessiontoken " + sessionuuid + ": " + e);
			jsonresult = {status: 0, error: "exception could not retrieve keys"};
		}

		
	  	res.json(jsonresult);
	}
	
	user_addKey(req, res) {
		// PUT
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		
		global.log("user_addKey called for sessiontoken " + sessionuuid);
		
		var useruuid  = req.body.useruuid;
		
		var privatekey  = req.body.private_key;
		var address  = req.body.address;
		var publickey  = req.body.public_key;
		var rsapublickey  = req.body.rsa_public_key;
		
		var description  = req.body.description;
		
		var authkeyservice = global.getServiceInstance('authkey');
		var authenticationserver = authkeyservice.getAuthenticationServerInstance();

		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		var jsonresult;
		
		try {
			var session = Session.getSession(global, sessionuuid);
			
			if (!session.isAnonymous()) {
				var user = authenticationserver.getUserFromUUID(session, useruuid);
				
				var type = 0; // crypto key
				var keyuuid = session.guid();
				
				var cryptokey = authkeyservice.createBlankCryptoKeyInstance();
				
				cryptokey.setKeyUUID(keyuuid);
				cryptokey.setType(type);
				
				cryptokey.setAddress(address);
				cryptokey.setPublicKey(publickey);
				cryptokey.setRsaPublicKey(rsapublickey);
				cryptokey.setPrivateKey(privatekey);
				
				cryptokey.setDescription(description);
				
				authenticationserver.addUserKey(session, useruuid, cryptokey);
				
				jsonresult = {status: 1, useruuid: useruuid, key_uuid: keyuuid}
				//global.log("session_getKeys called for sessiontoken "+ sessionuuid + " jsonresult is " + JSON.stringify(jsonresult));
			}
			else {
				jsonresult = {status: 0, error: "session is anonymous"};
			}
		}
		catch(e) {
			global.log("exception in user_addKey for sessiontoken " + sessionuuid + ": " + e);
			jsonresult = {status: 0, error: "exception could not retrieve keys"};
		}

		
	  	res.json(jsonresult);
	}

	//
	// Account API
	//
	session_getAccountKeys(req, res) {
		// GET
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		
		global.log("session_getAccountKeys called for sessiontoken " + sessionuuid);
		
		var authkeyservice = global.getServiceInstance('authkey');
		var authenticationserver = authkeyservice.getAuthenticationServerInstance();
		
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		var jsonresult;
		
		try {
			var session = Session.getSession(global, sessionuuid);
			
			if (!session.isAnonymous()) {
				// get user details
				var userkeys = authenticationserver.getUserAccountKeys(session);
			
				
				var keysjson = [];
				
				for (var i = 0; i < userkeys.length; i++) {
					var userkey = userkeys[i];
					
					var json = {uuid: userkey['uuid'],
							owner_uuid: userkey['useruuid'], 
							key_uuid: userkey['keyuuid'], 
							private_key: userkey['private_key'], 
							public_key: userkey['public_key'], 
							rsa_public_key: userkey['rsa_public_key'], 
							address: userkey['address'],
							description: userkey['description']};
					
					keysjson.push(json);
				}
				
				jsonresult = {status: 1, keys: keysjson};
				//global.log("session_getAccountKeys called for sessiontoken "+ sessionuuid + " jsonresult is " + JSON.stringify(jsonresult));
			}
			else {
				jsonresult = {status: 0, error: "session is anonymous"};
			}
		}
		catch(e) {
			global.log("exception in session_getAccountKeys for sessiontoken " + sessionuuid + ": " + e);
			jsonresult = {status: 0, error: "exception could not retrieve keys"};
		}

		
	  	res.json(jsonresult);
	}

	user_addAccount(req, res) {
		// PUT
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		
		global.log("user_addAccount called for sessiontoken " + sessionuuid);
		
		var useruuid  = req.body.useruuid;
		
		var privatekey  = req.body.private_key;
		var address  = req.body.address;
		var publickey  = req.body.public_key;
		var rsapublickey  = req.body.rsa_public_key;

		var description  = req.body.description;
		
		var authkeyservice = global.getServiceInstance('authkey');
		var authenticationserver = authkeyservice.getAuthenticationServerInstance();

		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		var jsonresult;
		
		try {
			var session = Session.getSession(global, sessionuuid);
			
			if (!session.isAnonymous()) {
				var user = authenticationserver.getUserFromUUID(session, useruuid);
				
				var type = 1; // ethereum account
				var keyuuid = session.guid();
				
				var cryptokey = authkeyservice.createBlankCryptoKeyInstance();
				
				cryptokey.setKeyUUID(keyuuid);
				cryptokey.setType(type);
				
				cryptokey.setAddress(address);
				cryptokey.setPublicKey(publickey);
				cryptokey.setRsaPublicKey(rsapublickey);
				cryptokey.setPrivateKey(privatekey);
				
				cryptokey.setDescription(description);
				
				authenticationserver.addUserKey(session, useruuid, cryptokey);
				
				jsonresult = {status: 1, useruuid: useruuid, account_uuid: keyuuid}
				//global.log("session_getKeys called for sessiontoken "+ sessionuuid + " jsonresult is " + JSON.stringify(jsonresult));
			}
			else {
				jsonresult = {status: 0, error: "session is anonymous"};
			}
		}
		catch(e) {
			global.log("exception in user_addAccount for sessiontoken " + sessionuuid + ": " + e);
			jsonresult = {status: 0, error: "exception could not retrieve keys"};
		}

		
	  	res.json(jsonresult);
	}

}

module.exports = AuthKeyControllers;