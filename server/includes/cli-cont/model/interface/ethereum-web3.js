/**
 * 
 */
'use strict';


class Web3Client {
	constructor(clientcontainer) {
		this.clientcontainer = clientcontainer;
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