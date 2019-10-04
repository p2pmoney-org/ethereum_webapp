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

}


module.exports = LocalStorageClient;