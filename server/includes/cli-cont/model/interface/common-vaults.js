/**
 * 
 */
'use strict';


class VaultsClient {
	constructor(clientcontainer) {
		this.clientcontainer = clientcontainer;
	}
	
	vaults_create(serversession, vaultname, vaultpassword, vaulttype) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		var global = clientcontainer.getServerGlobal();
		
		var commonmodule = clientcontainer.getModuleObject('common');
		
		var	result;	
		var finished = false;

		commonmodule.createVault(clientsession, vaultname, vaultpassword, vaulttype, (err, res) => {
			result = (res ? true : false);
			finished = true;
		});
		
		// wait to turn into synchronous call
		while(finished === false)
		{global.deasync().runLoopOnce();}
	
		return result;
	}
	
	vaults_open(serversession, vaultname, vaultpassword, vaulttype) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		var global = clientcontainer.getServerGlobal();
		
		var commonmodule = clientcontainer.getModuleObject('common');
		
		var	result;	
		var finished = false;

		commonmodule.openVault(clientsession, vaultname, vaultpassword, vaulttype, (err, res) => {
			result = (res ? true : false);
			finished = true;
		});
		
		// wait to turn into synchronous call
		while(finished === false)
		{global.deasync().runLoopOnce();}
	
		return result;
	}
	
	_impersonateVault(clientsession, vault) {
		if ((!clientsession) || (!vault))
			return;
		
		var clientcontainer = this.clientcontainer;
		var global = clientcontainer.getServerGlobal();
		
		var commonmodule = clientcontainer.getModuleObject('common');
		
		var vaultname = vault.getName();
		var cryptokey = vault.getCryptoKeyObject();
		
		// impersonate with vault's name and crypto key uuid
		var clientuser = commonmodule.createBlankUserObject(clientsession);

		clientuser.setUserName(vaultname);
		clientuser.setUserUUID(cryptokey.getKeyUUID());
		
		clientsession.impersonateUser(clientuser);
		
		// add crypto key to session and user
		clientuser.addCryptoKeyObject(cryptokey);
		clientsession.addCryptoKeyObject(cryptokey);
		
	}
	
	vaults_get(serversession, vaultname, vaultpassword, vaulttype, key) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		var global = clientcontainer.getServerGlobal();
		
		var commonmodule = clientcontainer.getModuleObject('common');
		
		var	result;	
		var finished = false;

		commonmodule.openVault(clientsession, vaultname, vaultpassword, vaulttype, (err, res) => {
			var vault = res;
			
			if (vault) {
				if (clientsession.isAnonymous()) {
					// we impersonate the vault in the client session
					this._impersonateVault(clientsession, vault);
					
					// we refresh the readValues before reading result
					vault.readValues((err, res) => {
						result = vault.getValue(key);
						finished = true;
					});
				}
				else {
					result = vault.getValue(key);
					finished = true;
				}

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
	
	vaults_put(serversession, vaultname, vaultpassword, vaulttype, key, value) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		var global = clientcontainer.getServerGlobal();
		
		var commonmodule = clientcontainer.getModuleObject('common');
		
		var	result;	
		var finished = false;

		commonmodule.openVault(clientsession, vaultname, vaultpassword, vaulttype, (err, res) => {
			var vault = res;
			
			if (vault) {
				if (clientsession.isAnonymous()) {
					// we impersonate the vault in the client session
					this._impersonateVault(clientsession, vault);
				}
				
				vault.putValue(key, value, (err, res) => {
					result = res;
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


module.exports = VaultsClient;