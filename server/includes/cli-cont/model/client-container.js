/**
 * 
 */
'use strict';


class ClientContainer {
	constructor(clientglobal, containerserver) {
		this.containerserver = containerserver;
		this.clientglobal = clientglobal;
		
		var serverglobal = this.getServerGlobal();
		
		this.containerid = serverglobal.guid();
		
		containerserver.log('Creating client container with id ' + this.containerid);
		
		this.clientinterfaces = Object.create(null);
		
		// load interfaces

		var CryptoKeyClient = require('./interface/ethereum-cryptokey.js');
		this.clientinterfaces['cryptokey'] = new CryptoKeyClient(this);

		var LocalStorageClient = require('./interface/ethereum-localstorage.js');
		this.clientinterfaces['localstorage'] = new LocalStorageClient(this);

		var Web3Client = require('./interface/ethereum-web3.js');
		this.clientinterfaces['web3'] = new Web3Client(this);

		var ER20Client = require('./interface/ethereum-erc20.js');
		this.clientinterfaces['erc20'] = new ER20Client(this);
	}
	

	getServerGlobal() {
		return this.containerserver.global;
	}
	
	getClientGlobal() {
		return this.ethereum_core.getGlobalObject();
	}
	
	getClientScopeId() {
		return this.clientglobal.scopeid;
	}
	
	getContainerId() {
		return this.containerid;
	}
	
	getModuleObject(modulename) {
		return this.clientglobal.getModuleObject(modulename);
	}
	
	getClientSession(serversession) {
		var sessionuuid = serversession.getSessionUUID();
		var clientcommonmodule = this.clientglobal.getModuleObject('common');
		
		var clientsession = clientcommonmodule.findSessionObjectFromUUID(sessionuuid);
		
		if (!clientsession) {
			clientsession = clientcommonmodule.createBlankSessionObject();
			
			clientsession.setSessionUUID(sessionuuid);
		}
		
		return clientsession;
	}
	
	getClientInterface(clientname) {
		return this.clientinterfaces[clientname];
	}
	
}


module.exports = ClientContainer;
