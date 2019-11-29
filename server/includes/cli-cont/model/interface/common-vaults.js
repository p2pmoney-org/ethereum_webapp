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
				result = vault.getValue(key);
			}
			
			finished = true;
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