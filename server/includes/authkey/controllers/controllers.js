/**
 * 
 */
'use strict';


class AuthKeyControllers {
	
	constructor(global) {
		this.global = global;
	}
	
	getCalltokenJson(calltoken) {
		if (calltoken && (calltoken.charAt(0) == '{')) {
			// try to transform it into an object
			try {
				var calltokenjson = JSON.parse(calltoken);

				return calltokenjson;
			}
			catch(e) {
			}
		}
	}

	//
	// auth API
	//
	authorize(req, res) {
		// GET
		var global = this.global;
		var authkeyservice = global.getServiceInstance('authkey');
		var version = authkeyservice.getVersion();
	  	
		var jsonresult = {status: 1, version:  version};
		
	  	res.json(jsonresult);
	}
	
	session_status(req, res) {
		// POST or GET
		var global = this.global;
		var sessionuuid = req.get("sessiontoken"); // in the sessiontoken header
		var calltoken = req.get("calltoken");
		var calltokenjson = this.getCalltokenJson(calltoken);
		
		var sessionid =  req.params.id;

		
		if (!sessionid) {
			// not a get, look in the body
			sessionid = req.body.sessionuuid;
		}
		
		
		if (!sessionuuid) {
			// nothing in the session, we use the parameter
			sessionuuid = sessionid;
		}
		
		global.log("session_status called for sessiontoken " + sessionuuid);
		
		var authkeyservice = global.getServiceInstance('authkey');
		var authenticationserver = authkeyservice.getAuthenticationServerInstance();

		var jsonresult;
		
		try {
			var commonservice = global.getServiceInstance('common');
			var Session = commonservice.Session;

			var section = Session.openSessionSection(global, sessionuuid, 'session_status', calltokenjson);
			var session = section.getSession();

			if (session) {
				var isanonymous = session.isAnonymous();
				var isauthenticated = session.isAuthenticated();
				
				// return user details
				jsonresult = {status: 1, sessionuuid: sessionuuid, isanonymous: isanonymous, isauthenticated: isauthenticated};
			}
			else {
				jsonresult = {status: 0, error: "session not found " + sessionuuid};
			}
		}
		catch(e) {
			global.log("exception in session_logout for sessiontoken " + sessionuuid + ": " + e);
			jsonresult = {status: 0, error: "exception could not authenticate session"};
		}

		global.log("session_status response is " + JSON.stringify(jsonresult));
	  	
	  	if (section) section.close();
		res.json(jsonresult);
	}

	
	session_authenticate(req, res) {
		// POST
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		var calltoken = req.get("calltoken");
		var calltokenjson = this.getCalltokenJson(calltoken);
		
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

				var section = Session.openSessionSection(global, sessionuuid, 'session_authenticate', calltokenjson);
				var session = section.getSession();
				
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
	  	
	  	if (section) section.close();
	  	res.json(jsonresult);
	}

	session_logout(req, res) {
		// POST
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		var calltoken = req.get("calltoken");
		var calltokenjson = this.getCalltokenJson(calltoken);
		
		global.log("session_logout called for sessiontoken " + sessionuuid);
		
		var useruuid  = req.body.useruuid;
		
		var authkeyservice = global.getServiceInstance('authkey');
		var authenticationserver = authkeyservice.getAuthenticationServerInstance();

		var jsonresult;
		
		try {
			var commonservice = global.getServiceInstance('common');
			var Session = commonservice.Session;

			var section = Session.openSessionSection(global, sessionuuid, 'session_logout', calltokenjson);
			var session = section.getSession();
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
	  	
	  	if (section) section.close();
	  	res.json(jsonresult);
	}

	session_getUser(req, res) {
		// GET
		var global = this.global;
		
		var sessionid =  req.params.id;
		var sessionuuid = req.get("sessiontoken");
		var calltoken = req.get("calltoken");
		var calltokenjson = this.getCalltokenJson(calltoken);
		
		global.log("session_getUser called for sessiontoken " + sessionuuid);
		
		var jsonresult;

		try {
			if (sessionid == sessionuuid) {
				var authkeyservice = global.getServiceInstance('authkey');
				var authenticationserver = authkeyservice.getAuthenticationServerInstance();

				
				var commonservice = global.getServiceInstance('common');
				var Session = commonservice.Session;

				var section = Session.openSessionSection(global, sessionuuid, 'session_getUser', calltokenjson);
				var session = section.getSession();
				
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
		
	  	
	  	if (section) section.close();
	  	res.json(jsonresult);
	}

	session_updateUser(req, res) {
		// PUT
		var global = this.global;
		
		var sessionid =  req.params.id;
		var sessionuuid = req.get("sessiontoken");
		var calltoken = req.get("calltoken");
		var calltokenjson = this.getCalltokenJson(calltoken);
		
		global.log("session_updateUser called for sessiontoken " + sessionuuid);

		var useruuid  = req.body.useruuid;
		var useremail  = req.body.user_email;

		
		var jsonresult;

		try {
			if (sessionid == sessionuuid) {
				var authkeyservice = global.getServiceInstance('authkey');
				var authenticationserver = authkeyservice.getAuthenticationServerInstance();

				
				var commonservice = global.getServiceInstance('common');
				var Session = commonservice.Session;

				var section = Session.openSessionSection(global, sessionuuid, 'session_updateUser', calltokenjson);
				var session = section.getSession();
				
				if (session.isAuthenticated()) {
					var user = session.getUser();

					if ((user.getUserUUID() == useruuid) && (authkeyservice.isValidEmail(session, useremail))) {
						user.setUserEmail(useremail);

						authenticationserver.saveUser(session, user);
					}
					
					jsonresult = {status: 1, useruuid: user.getUserUUID(), username: user.getUserName(), useremail: user.getUserEmail()};
				}
				else {
					jsonresult = {status: 0, error: "session is not authenticated"};
				}
				
			}
			else {
				jsonresult = {status: 0, error: "can not query details of another session"};
			}
		}
		catch(e) {
			global.log("exception in session_updateUser for sessiontoken " + sessionuuid + ": " + e);
			jsonresult = {status: 0, error: "exception could not update user details"};
		}
		
	  	
	  	if (section) section.close();
	  	res.json(jsonresult);
	}

	//
	// key API
	//
	session_getCryptoKeys(req, res) {
		// GET
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		var calltoken = req.get("calltoken");
		var calltokenjson = this.getCalltokenJson(calltoken);
		
		global.log("session_getCryptoKeys called for sessiontoken " + sessionuuid);
		
		var authkeyservice = global.getServiceInstance('authkey');
		var authenticationserver = authkeyservice.getAuthenticationServerInstance();
		
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		var jsonresult;
		
		try {
			var section = Session.openSessionSection(global, sessionuuid, 'session_getCryptoKeys', calltokenjson);
			var session = section.getSession();
			
			if (session.isAuthenticated()) {
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
					
					cryptokey.generatePrivateKey(session);
					
					cryptokey.setDescription('generated on first call');
					
					var user = session.getUser();
					var useruuid = user.getUserUUID();
					
					authenticationserver.addUserKey(session, useruuid, cryptokey);
					
					userkeys = authenticationserver.getUserCryptoKeys(session);
				}
				
				for (var i = 0; i < userkeys.length; i++) {
					var userkey = userkeys[i];
					
					var json = {key_uuid: userkey.getKeyUUID(), 
							private_key: userkey.getPrivateKey(), 
							public_key: userkey.getPublicKey(), 
							rsa_public_key: userkey.getRsaPublicKey(), 
							address: userkey.getAddress(),
							description: userkey.getDescription()};
					
					keysjson.push(json);
					
				}
				
				jsonresult = {status: 1, keys: keysjson};
				//global.log("session_getCryptoKeys called for sessiontoken "+ sessionuuid + " jsonresult is " + JSON.stringify(jsonresult));
			}
			else {
				jsonresult = {status: 0, error: "session is not authenticated"};
			}
		}
		catch(e) {
			global.log("exception in session_getCryptoKeys for sessiontoken " + sessionuuid + ": " + e);
			jsonresult = {status: 0, error: "exception could not retrieve keys"};
		}

		
	  	if (section) section.close();
	  	res.json(jsonresult);
	}
	
	user_addKey(req, res) {
		// PUT
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		var calltoken = req.get("calltoken");
		var calltokenjson = this.getCalltokenJson(calltoken);
		
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
			var section = Session.openSessionSection(global, sessionuuid, 'user_addKey', calltokenjson);
			var session = section.getSession();
			
			if (session.isAuthenticated()) {
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
				jsonresult = {status: 0, error: "session is not authenticated"};
			}
		}
		catch(e) {
			global.log("exception in user_addKey for sessiontoken " + sessionuuid + ": " + e);
			jsonresult = {status: 0, error: "exception could not retrieve keys"};
		}

		
	  	if (section) section.close();
	  	res.json(jsonresult);
	}

	//
	// Account API (storage domain)
	//


	session_getAccountKeys(req, res) {
		// GET
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		var calltoken = req.get("calltoken");
		var calltokenjson = this.getCalltokenJson(calltoken);
		
		global.log("session_getAccountKeys called for sessiontoken " + sessionuuid);
		
		var authkeyservice = global.getServiceInstance('authkey');
		var authenticationserver = authkeyservice.getAuthenticationServerInstance();
		
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		var jsonresult;
		
		try {
			var section = Session.openSessionSection(global, sessionuuid, 'session_getAccountKeys', calltokenjson);
			var session = section.getSession();
			
			if (session.isAuthenticated()) {
				// get user details
				var userkeys = authenticationserver.getUserAccountKeys(session);
			
				
				var keysjson = [];
				
				for (var i = 0; i < userkeys.length; i++) {
					var userkey = userkeys[i];
					
					var json = {uuid: userkey.getKeyUUID(), 
							owner_uuid: userkey.getUserUUID(),  
							key_uuid: userkey.getKeyUUID(),
							private_key: userkey.getPrivateKey(), 
							public_key: userkey.getPublicKey(), 
							rsa_public_key: userkey.getRsaPublicKey(), 
							address: userkey.getAddress(),
							description: userkey.getDescription()};
					
					keysjson.push(json);
				}
				
				jsonresult = {status: 1, keys: keysjson};
				//global.log("session_getAccountKeys called for sessiontoken "+ sessionuuid + " jsonresult is " + JSON.stringify(jsonresult));
			}
			else {
				jsonresult = {status: 0, error: "session is not authenticated"};
			}
		}
		catch(e) {
			global.log("exception in session_getAccountKeys for sessiontoken " + sessionuuid + ": " + e);

			jsonresult = {status: 0, error: "exception could not retrieve keys"};
		}

		
	  	if (section) section.close();
	  	res.json(jsonresult);
	}

	user_addAccount(req, res) {
		// PUT
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		var calltoken = req.get("calltoken");
		var calltokenjson = this.getCalltokenJson(calltoken);
		
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
			var section = Session.openSessionSection(global, sessionuuid, 'user_addAccount', calltokenjson);
			var session = section.getSession();
			
			if (session.isAuthenticated()) {
				var user = authenticationserver.getUserFromUUID(session, useruuid);
				
				var type = 1; // ethereum transaction account
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
				jsonresult = {status: 0, error: "session is not authenticated"};
			}
		}
		catch(e) {
			global.log("exception in user_addAccount for sessiontoken " + sessionuuid + ": " + e);
			console.log(e.stack);

			jsonresult = {status: 0, error: "exception could add account"};
		}

		
	  	if (section) section.close();
	  	res.json(jsonresult);
	}

	user_updateAccount(req, res) {
		// PUT
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		var calltoken = req.get("calltoken");
		var calltokenjson = this.getCalltokenJson(calltoken);
		
		global.log("user_updateAccount called for sessiontoken " + sessionuuid);
		
		var useruuid  = req.body.useruuid;
		
		var accountuuid  = req.body.account_uuid;
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
			var section = Session.openSessionSection(global, sessionuuid, 'user_updateAccount', calltokenjson);
			var session = section.getSession();
			
			if (session.isAuthenticated()) {
				var user = authenticationserver.getUserFromUUID(session, useruuid);
				
				var cryptokey = authenticationserver.getUserAccountKeyFromUUID(session, accountuuid);
				
				if (cryptokey) {
					// we update only the description
					cryptokey.setDescription(description);
					
					authenticationserver.saveUserKey(session, useruuid, cryptokey);
					
					jsonresult = {status: 1, useruuid: useruuid, account_uuid: accountuuid}
					
				}
				else {
					jsonresult = {status: 0, error: "could not find account " + accountuuid};
				}
				
				
				//global.log("session_getKeys called for sessiontoken "+ sessionuuid + " jsonresult is " + JSON.stringify(jsonresult));
			}
			else {
				jsonresult = {status: 0, error: "session is not authenticated"};
			}
		}
		catch(e) {
			global.log("exception in user_updateAccount for sessiontoken " + sessionuuid + ": " + e);

			jsonresult = {status: 0, error: "exception could not update account"};
		}

		
	  	if (section) section.close();
	  	res.json(jsonresult);
	}

	user_reactivateAccount(req, res) {
		// PUT
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		var calltoken = req.get("calltoken");
		var calltokenjson = this.getCalltokenJson(calltoken);
		
		global.log("user_reactivateAccount called for sessiontoken " + sessionuuid);
		
		var useruuid  = req.body.useruuid;
		
		var accountuuid  = req.body.account_uuid;
		
		var authkeyservice = global.getServiceInstance('authkey');
		var authenticationserver = authkeyservice.getAuthenticationServerInstance();

		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		var jsonresult;
		
		try {
			var section = Session.openSessionSection(global, sessionuuid, 'user_reactivateAccount', calltokenjson);
			var session = section.getSession();
			
			if (session.isAuthenticated()) {
				var user = authenticationserver.getUserFromUUID(session, useruuid);
				
				// we ask getUserKeyFromUUID because deactivate account won't show in getUserAccountKeyFromUUID
				var cryptokey = authenticationserver.getUserKeyFromUUID(session, accountuuid);
				
				if (cryptokey) {
					// we deactivate the key
					authenticationserver.reactivateUserKey(session, useruuid, cryptokey);
					
					jsonresult = {status: 1, useruuid: useruuid, account_uuid: accountuuid}
					
				}
				else {
					jsonresult = {status: 0, error: "could not find account " + accountuuid};
				}

			}
			else {
				jsonresult = {status: 0, error: "session is not authenticated"};
			}
		}
		catch(e) {
			global.log("exception in user_reactivateAccount for sessiontoken " + sessionuuid + ": " + e);

			jsonresult = {status: 0, error: "exception could not activate account"};
		}

		
	  	if (section) section.close();
	  	res.json(jsonresult);
	}

	user_deactivateAccount(req, res) {
		// PUT
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		var calltoken = req.get("calltoken");
		var calltokenjson = this.getCalltokenJson(calltoken);
		
		global.log("user_deactivateAccount called for sessiontoken " + sessionuuid);
		
		var useruuid  = req.body.useruuid;
		
		var accountuuid  = req.body.account_uuid;
		
		var authkeyservice = global.getServiceInstance('authkey');
		var authenticationserver = authkeyservice.getAuthenticationServerInstance();

		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		var jsonresult;
		
		try {
			var section = Session.openSessionSection(global, sessionuuid, 'user_deactivateAccount', calltokenjson);
			var session = section.getSession();
			
			if (session.isAuthenticated()) {
				var user = authenticationserver.getUserFromUUID(session, useruuid);
				
				var cryptokey = authenticationserver.getUserAccountKeyFromUUID(session, accountuuid);

				if (cryptokey) {
					// we deactivate the key
					authenticationserver.deactivateUserKey(session, useruuid, cryptokey);
					
					jsonresult = {status: 1, useruuid: useruuid, account_uuid: accountuuid}
					
				}
				else {
					jsonresult = {status: 0, error: "could not find account " + accountuuid};
				}

			}
			else {
				jsonresult = {status: 0, error: "session is not authenticated"};
			}
		}
		catch(e) {
			global.log("exception in user_deactivateAccount for sessiontoken " + sessionuuid + ": " + e);

			jsonresult = {status: 0, error: "exception could not deactivate account"};
		}

		
	  	if (section) section.close();
	  	res.json(jsonresult);
	}

	user_removeAccount(req, res) {
		// PUT
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		var calltoken = req.get("calltoken");
		var calltokenjson = this.getCalltokenJson(calltoken);
		
		global.log("user_removeAccount called for sessiontoken " + sessionuuid);
		
		var useruuid  = req.body.useruuid;
		
		var accountuuid  = req.body.account_uuid;
		
		var authkeyservice = global.getServiceInstance('authkey');
		var authenticationserver = authkeyservice.getAuthenticationServerInstance();

		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		var jsonresult;
		
		try {
			var section = Session.openSessionSection(global, sessionuuid, 'user_removeAccount', calltokenjson);
			var session = section.getSession();
			
			if (session.isAuthenticated()) {
				var user = authenticationserver.getUserFromUUID(session, useruuid);
				
				var cryptokey = authenticationserver.getUserAccountKeyFromUUID(session, accountuuid);
				
				if (cryptokey) {
					// we deactivate the key
					authenticationserver.removeUserKey(session, useruuid, cryptokey);
					
					jsonresult = {status: 1, useruuid: useruuid, account_uuid: accountuuid}
					
				}
				else {
					jsonresult = {status: 0, error: "could not find account " + accountuuid};
				}
				
			}
			else {
				jsonresult = {status: 0, error: "session is not authenticated"};
			}
		}
		catch(e) {
			global.log("exception in user_removeAccount for sessiontoken " + sessionuuid + ": " + e);

			jsonresult = {status: 0, error: "exception could not remove account"};
		}

		
	  	if (section) section.close();
	  	res.json(jsonresult);
	}
}

module.exports = AuthKeyControllers;