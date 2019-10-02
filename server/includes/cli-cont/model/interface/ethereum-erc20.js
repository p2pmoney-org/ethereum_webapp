/**
 * 
 */
'use strict';


class ERC20Client {
	constructor(clientcontainer) {
		this.clientcontainer = clientcontainer;
	}
	
	getToken(serversession, contractuuid) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		
		var erc20tokenmodule = clientcontainer.getModuleObject('erc20');
		var erc20tokencontrollers = erc20tokenmodule.getControllersObject();
		var erc20tokenviews = this.erc20tokenviews;
		
		var erc20tokenjson = {};
		var finished = false;
		
		var erc20tokencontracts = erc20tokenmodule.getERC20Tokens(clientsession, true, function(err, res) {
			var erc20tokencontract = erc20tokencontrollers.getERC20TokenFromUUID(clientsession, contractuuid);
			
			erc20tokenjson.contractuuid = contractuuid;

			if (erc20tokencontract) {
				erc20tokenjson.erc20tokenindex = erc20tokencontract.getContractIndex();
				erc20tokenjson.erc20tokenuuid = erc20tokencontract.getUUID();
				erc20tokenjson.isLocalOnly = erc20tokencontract.isLocalOnly();
			}
			
			finished = true;
		});
		
		// wait to turn into synchronous call
		while(finished === false)
		{global.deasync().runLoopOnce();}
		
		
		return erc20tokenjson;
		
	}
}


module.exports = ERC20Client;