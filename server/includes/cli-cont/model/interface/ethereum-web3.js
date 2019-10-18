/**
 * 
 */
'use strict';


class Web3Client {
	constructor(clientcontainer) {
		this.clientcontainer = clientcontainer;
	}
	
	getWeb3ProviderUrl(serversession) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		
		var ethnodemodule = clientcontainer.getModuleObject('ethnode');

		return ethnodemodule.getWeb3ProviderUrl(clientsession);
	}
	
	addWeb3ProviderUrl(serversession, web3providerurl) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		
		var ethnodemodule = clientcontainer.getModuleObject('ethnode');

		var ethereumnodeaccess = ethnodemodule.getEthereumNodeAccessInstance(clientsession, web3providerurl);
		
		return ethereumnodeaccess;
	}
	
	setWeb3ProviderUrl(serversession, web3providerurl) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		
		var global = clientcontainer.getServerGlobal();

		var ethnodemodule = clientcontainer.getModuleObject('ethnode');
		
		ethnodemodule.setWeb3ProviderUrl(web3providerurl, clientsession, function(err, res) {
			if (!res)  {
				global.log('error in Web3Client.setWeb3ProviderUrl: ' + err);
			}
			
			finished = true;
		});

		// wait to turn into synchronous call
		while(finished === false)
		{global.deasync().runLoopOnce();}
		
		var ethereumnodeaccess = ethnodemodule.getEthereumNodeAccessInstance(clientsession, web3providerurl);
		
		return ethereumnodeaccess;
	}
	
	getNodeInfo(serversession) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		
		var ethnodemodule = clientcontainer.getModuleObject('ethnode');
		
		var global = clientcontainer.getServerGlobal();

		var ethereumnodeaccessintance = ethnodemodule.getEthereumNodeAccessInstance(clientsession);
		
		var nodeinfo = null;
		var finished = false;
		
		ethereumnodeaccessintance.web3_getNodeInfo(function(err, res) {
			if (res) {
				global.log('Web3Client.getNodeInfo: ' + JSON.stringify(res));
				nodeinfo = res;
			}
			else {
				global.log('error in Web3Client.getNodeInfo: ' + err);
			}
			
			finished = true;
		});
		
		// wait to turn into synchronous call
		while(finished === false)
		{global.deasync().runLoopOnce();}
		
		return nodeinfo;
	}
	
	getBalance(serversession, address) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		
		var commonmodule = clientcontainer.getModuleObject('common');
		var ethnodemodule = clientcontainer.getModuleObject('ethnode');
		
		var account = clientsession.createBlankAccountObject();
		account.setAddress(address);
		
		var global = clientcontainer.getServerGlobal();

		var balance = null;
		var finished = false;
		
		ethnodemodule.getChainAccountBalance(clientsession, account, function(err, res) {
			if (res) {
				global.log('Web3Client.getBalance: ' + res);
				balance = res;
			}
			else {
				global.log('error in Web3Client.getBalance: ' + err);
			}
			
			finished = true;
		});
		
		// wait to turn into synchronous call
		while(finished === false)
		{global.deasync().runLoopOnce();}
		
		
		return balance;
		
	}
}


module.exports = Web3Client;