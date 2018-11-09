/**
 * 
 */
'use strict';

var AuthKeyInterface = class {
	constructor(module) {
		this.module = module
		this.global = module.global;
	}
	
	// api
	

	// sync

	
	// async
	authenticate(session, username, password, callback) {
		console.log('AuthKeyInterface.authenticate called');
		var global = this.global;
		var promises = [];
		
		var authkeyserveraccess = this.module.getAuthKeyServerAccessInstance(session);
		
		var versionpromise = authkeyserveraccess.auth_version(function(err, version) {
			console.log("version is " + version);
			
			// could check if version is compatible
			
			return version;
		});
		
		promises.push(versionpromise);
		
		
		var commonmodule = global.getModuleObject('common');
		var user = commonmodule.createBlankUserObject();
		
		var authenticationpromise = authkeyserveraccess.auth_session_authenticate(username, password, function(err, res) {
			var authenticated = (res['status'] == '1' ? true : false);
			
			console.log("authentication is " + authenticated);
			
			user.setUserName(res['username']);
			user.setUserEmail((res['useremail'] ? res['useremail'] : null));
			user.setUserUUID((res['useruuid'] ? res['useruuid'] : null));
			
			session.impersonateUser(user);
			
			return authenticated;
		})
		.then(function(authenticated) {
			if (authenticated) {
				
				// load crypto keys
				return authkeyserveraccess.key_session_keys( function(err, res) {
					
					if (res && res['keys']) {
						var keys = res['keys'];
						
						for (var i = 0; i < keys.length; i++) {
							var key = keys[i];
							
							var keyuuid = key['key_uuid'];
							var privatekey = key['private_key'];
							var publickey = key['public_key'];
							var address = key['address'];
							var rsapublickey = key['rsa_public_key'];
							var description = key['description'];
							
							if (privatekey) {
								
								var cryptokey = commonmodule.createBlankCryptoKeyObject();
								
								cryptokey.setKeyUUID(keyuuid);
								cryptokey.setDescription(description);
								
								cryptokey.setPrivateKey(privatekey);
								
								session.addCryptoKeyObject(cryptokey);
							}
							else {
								throw "Could not retrieve private key for a crypto key!";
							}
						
						}
						
					}
			
				});
				
			}
			else {
				return null;
			}
			
		});
		
		promises.push(authenticationpromise);
		
		return Promise.all(promises).then(function(res) {
			if (callback)
				callback(null, res[1]);
			
			return res[1];
		});
	}
	
	logout(session, callback) {
		console.log('AuthKeyInterface.logout called');
		var global = this.global;
		
		var authkeyserveraccess = this.module.getAuthKeyServerAccessInstance(session);
		
		var useruuid = (session.getSessionUserObject() ? session.getSessionUserObject().getUserUUID() : null);
		
		return authkeyserveraccess.auth_session_logout(useruuid, function(err, res) {
			var loggedout = (res['status'] == '1' ? true : false);
			
			console.log("log out result is " + loggedout);
			
			if (callback)
				callback(null, loggedout);
			
			return loggedout;
		});
	}
}

if ( typeof GlobalClass !== 'undefined' && GlobalClass )
GlobalClass.registerModuleClass('authkey', 'AuthKeyInterface', AuthKeyInterface);
else
module.exports = Session; // we are in node js