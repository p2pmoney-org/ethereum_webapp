/**
 * 
 */
'use strict';


class ERC20Client {
	constructor(clientcontainer) {
		this.clientcontainer = clientcontainer;
	}
	
	importToken(serversession, tokenaddress) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		var global = clientcontainer.getServerGlobal();
		
		var erc20tokenmodule = clientcontainer.getModuleObject('erc20');
		var erc20tokencontrollers = erc20tokenmodule.getControllersObject();		
		
		var data = {};
		
		data['description'] = tokenaddress;
		data['address'] = tokenaddress;
		
		// create (local) contract for these values
		var erc20tokencontract = erc20tokencontrollers.createERC20TokenObject(clientsession, data);
		

		// retrieve data from blockchain
		var erc20tokenjson = {};
		var finished = false;

		var promise = erc20tokencontract.getChainName(function(err, res) {
			var name = res;
			
			console.log("chain name is " + res);
			
			erc20tokencontract.setLocalName(name);

			return res;
		})
		.then(function(res) {
			return erc20tokencontract.getChainSymbol(function(err, res) {
				var symbol = res;
				
				console.log("symbol is " + res);
				
				erc20tokencontract.setLocalSymbol(symbol);
				
				return res;
			})
		})
		.then(function(res) {
			return erc20tokencontract.getChainDecimals(function(err, res) {
				var decimals = res;
				
				console.log("decimals is " + res);
				
				erc20tokencontract.setLocalDecimals(decimals);
				
				return res;
			})
		})
		.then(function(res) {
			return erc20tokencontract.getChainTotalSupply(function(err, res) {
				var totalsupply = res;
				
				console.log("total supply is " + res);
				
				erc20tokencontract.setLocalTotalSupply(totalsupply);
				
				return res;
			})
		})
		.then( function (res) {
			
			console.log("deployed contract completely retrieved");
			
			erc20tokenjson['name'] = erc20tokencontract.getLocalName();
			erc20tokenjson['symbol'] = erc20tokencontract.getLocalSymbol();
			erc20tokenjson['decimals'] = erc20tokencontract.getLocalDecimals();
			erc20tokenjson['total_supply'] = erc20tokencontract.getLocalTotalSupply();

			finished = true;
		});
			
		// wait to turn into synchronous call
		while(finished === false)
		{global.deasync().runLoopOnce();}
	
		return erc20tokenjson;
	}
	
	getToken(serversession, contractuuid) {
		var clientcontainer = this.clientcontainer;
		var clientsession = clientcontainer.getClientSession(serversession);
		var global = clientcontainer.getServerGlobal();
		
		var erc20tokenmodule = clientcontainer.getModuleObject('erc20');
		var erc20tokencontrollers = erc20tokenmodule.getControllersObject();
		
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