/**
 * 
 */
'use strict';


class LocalStorageClient {
	constructor(clientcontainer) {
		this.clientcontainer = clientcontainer;
	}
	
	getValue(serversession, keys) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		var global = clientcontainer.getServerGlobal();
		
		var value;
		var finished = false;
		
		var storageaccessinstance = clientsession.getStorageAccessInstance();
		
		storageaccessinstance.readClientSideJson(keys, function(err, res) {
			value = res;
			
			finished = true;
		})

		
		// wait to turn into synchronous call
		while(finished === false)
		{global.deasync().runLoopOnce();}
	
		return value;
	}

	setValue(serversession, keys, value) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		var global = clientcontainer.getServerGlobal();
		
		var value;
		var finished = false;
		
		var storageaccessinstance = clientsession.getStorageAccessInstance();
		
		storageaccessinstance.saveClientSideJson(keys, value, function(err, res) {
			value = res;
			
			finished = true;
		})

		
		// wait to turn into synchronous call
		while(finished === false)
		{global.deasync().runLoopOnce();}
	
		return value;
	}
	
	// storage access
	user_account_keys(serversession, cryptokeyuuid, cryptoprivatekey) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		var global = clientcontainer.getServerGlobal();
		

		if (cryptokeyuuid && cryptoprivatekey) {
			// create encryption key
			var commonmodule = clientcontainer.getModuleObject('common');
			var sessioncryptokey = commonmodule.createBlankCryptoKeyObject(clientsession);
			
			sessioncryptokey.setOrigin({storage: 'client-container'});
			
			sessioncryptokey.setPrivateKey(cryptoprivatekey);
			sessioncryptokey.setKeyUUID(cryptokeyuuid);

			clientsession.addCryptoKeyObject(sessioncryptokey);
		}
		
		// read in local storage
		var storagemodule = clientcontainer.getModuleObject('storage-access');
		var storageaccess = storagemodule.getStorageAccessInstance(clientsession);
		
		var	result;	
		var finished = false;
		
		storageaccess.account_session_keys(function(err, res) {
			var keysjson = (res ? res['keys'] : []);
			
			var origin = {storage: 'client-container'};
			for (var i = 0; i < keysjson.length; i++) {
				var key = keysjson[i];
				
				key.origin = origin;
			}
			
			result = keysjson;
			finished = true;
		});
		
		// wait to turn into synchronous call
		while(finished === false)
		{global.deasync().runLoopOnce();}
	
		return result;
	}
	
	user_add_account(serversession, useruuid, accountprivatekey, accountdescription, cryptokeyuuid, cryptoprivatekey) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		var global = clientcontainer.getServerGlobal();
		
		var commonmodule = clientcontainer.getModuleObject('common');
		var sessionuser = commonmodule.createBlankUserObject(clientsession);
		
		sessionuser.setUserUUID(useruuid);
		
		clientsession.impersonateUser(sessionuser);
		
		if (cryptokeyuuid && cryptoprivatekey) {
			// create encryption key
			var sessioncryptokey = commonmodule.createBlankCryptoKeyObject(clientsession);
			
			sessioncryptokey.setOrigin({storage: 'client-container'});
			
			sessioncryptokey.setPrivateKey(cryptoprivatekey);
			sessioncryptokey.setKeyUUID(cryptokeyuuid);

			sessionuser.addCryptoKeyObject(sessioncryptokey);
			clientsession.addCryptoKeyObject(sessioncryptokey);
		}
		
		// create account
		var sessionaccount = commonmodule.createBlankAccountObject(clientsession);
		
		sessioncryptokey.setOrigin({storage: 'client-container'});

		sessionaccount.setPrivateKey(accountprivatekey);
		sessionaccount.setDescription(accountdescription);
		
		if (sessionuser) {
			sessionaccount.setOwner(sessionuser);
		}
		
		clientsession.addAccountObject(sessionaccount);
			
		// save account
		var storagemodule = clientcontainer.getModuleObject('storage-access');
		var storageaccess = storagemodule.getStorageAccessInstance(clientsession);
		
		var	result;	
		var finished = false;
		
		storageaccess.user_add_account(sessionuser, sessionaccount, function(err, res) {
			result = (res ? sessionaccount : null);
			finished = true;
		});
		
		// wait to turn into synchronous call
		while(finished === false)
		{global.deasync().runLoopOnce();}
	
		return result;
	}

	user_update_account(serversession, useruuid, accountuuid, accountdescription, cryptokeyuuid, cryptoprivatekey) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		var global = clientcontainer.getServerGlobal();
		
		var commonmodule = clientcontainer.getModuleObject('common');
		var sessionuser = commonmodule.createBlankUserObject(clientsession);
		
		sessionuser.setUserUUID(useruuid);
		
		clientsession.impersonateUser(sessionuser);
		
		if (cryptokeyuuid && cryptoprivatekey) {
			// create encryption key
			var sessioncryptokey = commonmodule.createBlankCryptoKeyObject(clientsession);
			
			sessioncryptokey.setOrigin({storage: 'client-container'});
			
			sessioncryptokey.setPrivateKey(cryptoprivatekey);
			sessioncryptokey.setKeyUUID(cryptokeyuuid);

			sessionuser.addCryptoKeyObject(sessioncryptokey);
			clientsession.addCryptoKeyObject(sessioncryptokey);
		}
		
		var	result = false;	
		var finished = false;
		

		// read account
		var bForceRefresh = true;
		commonmodule.findAccountObjectFromUUID(clientsession, bForceRefresh, accountuuid, (err, res) => {
			var account = res;
			
			if (account) {
				// change description
				account.setDescription(accountdescription);
					
				// update account
				var storagemodule = clientcontainer.getModuleObject('storage-access');
				var storageaccess = storagemodule.getStorageAccessInstance(clientsession);
				
				storageaccess.user_update_account(sessionuser, account, function(err, res) {
					result = (res ? true : false);
					finished = true;
				});
				
			}
			else {
				finished = true;
			}
		});
		
		
		// wait to turn into synchronous call
		while(finished === false)
		{global.deasync().runLoopOnce();}
	
		return result;
	}

	user_reactivate_account(serversession, useruuid, accountuuid, cryptokeyuuid, cryptoprivatekey) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		var global = clientcontainer.getServerGlobal();
		
		var commonmodule = clientcontainer.getModuleObject('common');
		var sessionuser = commonmodule.createBlankUserObject(clientsession);
		
		sessionuser.setUserUUID(useruuid);
		
		clientsession.impersonateUser(sessionuser);
		
		if (cryptokeyuuid && cryptoprivatekey) {
			// create encryption key
			var sessioncryptokey = commonmodule.createBlankCryptoKeyObject(clientsession);
			
			sessioncryptokey.setOrigin({storage: 'client-container'});
			
			sessioncryptokey.setPrivateKey(cryptoprivatekey);
			sessioncryptokey.setKeyUUID(cryptokeyuuid);

			sessionuser.addCryptoKeyObject(sessioncryptokey);
			clientsession.addCryptoKeyObject(sessioncryptokey);
		}
		
		var	result = false;	
		var finished = false;
		

		// read account
		var bForceRefresh = true;
		commonmodule.findAccountObjectFromUUID(clientsession, bForceRefresh, accountuuid, (err, res) => {
			var account = res;
			
			if (account) {
				// reactivate account
				var storagemodule = clientcontainer.getModuleObject('storage-access');
				var storageaccess = storagemodule.getStorageAccessInstance(clientsession);
				
				storageaccess.user_reactivate_account(sessionuser, account, function(err, res) {
					result = (res ? true : false);
					finished = true;
				});
				
			}
			else {
				finished = true;
			}
		});
		
		
		// wait to turn into synchronous call
		while(finished === false)
		{global.deasync().runLoopOnce();}
	
		return result;
	}

	user_deactivate_account(serversession, useruuid, accountuuid, cryptokeyuuid, cryptoprivatekey) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		var global = clientcontainer.getServerGlobal();
		
		var commonmodule = clientcontainer.getModuleObject('common');
		var sessionuser = commonmodule.createBlankUserObject(clientsession);
		
		sessionuser.setUserUUID(useruuid);
		
		clientsession.impersonateUser(sessionuser);
		
		if (cryptokeyuuid && cryptoprivatekey) {
			// create encryption key
			var sessioncryptokey = commonmodule.createBlankCryptoKeyObject(clientsession);
			
			sessioncryptokey.setOrigin({storage: 'client-container'});
			
			sessioncryptokey.setPrivateKey(cryptoprivatekey);
			sessioncryptokey.setKeyUUID(cryptokeyuuid);

			sessionuser.addCryptoKeyObject(sessioncryptokey);
			clientsession.addCryptoKeyObject(sessioncryptokey);
		}
		
		var	result = false;	
		var finished = false;
		

		// read account
		var bForceRefresh = true;
		commonmodule.findAccountObjectFromUUID(clientsession, bForceRefresh, accountuuid, (err, res) => {
			var account = res;
			
			if (account) {
				// reactivate account
				var storagemodule = clientcontainer.getModuleObject('storage-access');
				var storageaccess = storagemodule.getStorageAccessInstance(clientsession);
				
				storageaccess.user_deactivate_account(sessionuser, account, function(err, res) {
					result = (res ? true : false);
					finished = true;
				});
				
			}
			else {
				finished = true;
			}
		});
		
		
		// wait to turn into synchronous call
		while(finished === false)
		{global.deasync().runLoopOnce();}
	
		return result;
	}
	
	user_remove_account(serversession, useruuid, accountuuid, cryptokeyuuid, cryptoprivatekey) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		var global = clientcontainer.getServerGlobal();
		
		var commonmodule = clientcontainer.getModuleObject('common');
		var sessionuser = commonmodule.createBlankUserObject(clientsession);
		
		sessionuser.setUserUUID(useruuid);
		
		clientsession.impersonateUser(sessionuser);
		
		if (cryptokeyuuid && cryptoprivatekey) {
			// create encryption key
			var sessioncryptokey = commonmodule.createBlankCryptoKeyObject(clientsession);
			
			sessioncryptokey.setOrigin({storage: 'client-container'});
			
			sessioncryptokey.setPrivateKey(cryptoprivatekey);
			sessioncryptokey.setKeyUUID(cryptokeyuuid);

			sessionuser.addCryptoKeyObject(sessioncryptokey);
			clientsession.addCryptoKeyObject(sessioncryptokey);
		}
		
		var	result = false;	
		var finished = false;
		

		// read account
		var bForceRefresh = true;
		commonmodule.findAccountObjectFromUUID(clientsession, bForceRefresh, accountuuid, (err, res) => {
			var account = res;
			
			if (account) {
				// reactivate account
				var storagemodule = clientcontainer.getModuleObject('storage-access');
				var storageaccess = storagemodule.getStorageAccessInstance(clientsession);
				
				storageaccess.user_remove_account(sessionuser, account, function(err, res) {
					result = (res ? true : false);
					finished = true;
				});
				
			}
			else {
				finished = true;
			}
		});
		
		
		// wait to turn into synchronous call
		while(finished === false)
		{global.deasync().runLoopOnce();}
	
		return result;
	}	
	
}


module.exports = LocalStorageClient;