/**
 * 
 */
'use strict';

class ClientContainerControllers {
	
	constructor(global) {
		this.global = global;
		
		//this.ethereum_node = null;
	}

	
	//
	// clicont
	//
	
	
	// root
	clicont_root(req, res) {
		// GET
		var sessionuuid = req.get("sessiontoken");
		
		var global = this.global;
		
		var jsonresult = {status: 0, error: "can not use this route"};
	  	
		
		var execenv = global.getExecutionEnvironment();
		
		if (execenv !== 'prod') {
			var commonservice = global.getServiceInstance('common');
			var Session = commonservice.Session;
			var session = Session.getSession(global, sessionuuid);
			
			console.log('dev environment');
			
			var clicontservice = global.getServiceInstance('client-container');
			
			var clientcontainer = clicontservice.getClientContainer(session);
			
			jsonresult = {status: 1}
		}

		res.json(jsonresult);
	}
	
	//
	// crypto
	//
	
	// generate private key
	clicont_keys_generate(req, res) {
		// GET
		var sessionuuid = req.get("sessiontoken");
		var address = req.params.id;
		
		var global = this.global;

		global.log("clicont_keys_generate called for sessiontoken " + sessionuuid + " and address " + address);
		
		var jsonresult = {status: 0, error: "can not use this route"};
	  	
		try {
			var commonservice = global.getServiceInstance('common');
			var Session = commonservice.Session;
			var session = Session.getSession(global, sessionuuid);
			
			var clicontservice = global.getServiceInstance('client-container');
			
			var clientcontainer = clicontservice.getClientContainer(session);
			var cryptokeyinterface = clientcontainer.getClientInterface('cryptokey');
			
			var private_key = cryptokeyinterface.generatePrivateKey(session);
			
			jsonresult = {status: 1, private_key: private_key};
		}
		catch(e) {
			global.log("exception in clicont_keys_generate for sessiontoken " + sessionuuid + " and address " + address + ": " + e);
			global.log(e.stack);
		}

	  	res.json(jsonresult);
	  	
	}

	// public keys from private key
	clicont_keys_publickeys(req, res) {
		// POST
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		
		global.log("clicont_keys_publickeys called for sessiontoken " + sessionuuid);
		
		var privatekey  = req.body.private_key;
		
		var jsonresult;
		
		try {
			var commonservice = global.getServiceInstance('common');
			var Session = commonservice.Session;
			var session = Session.getSession(global, sessionuuid);
			
			var clicontservice = global.getServiceInstance('client-container');
			
			var clientcontainer = clicontservice.getClientContainer(session);
			var cryptokeyinterface = clientcontainer.getClientInterface('cryptokey');

			var keys = cryptokeyinterface.getPublicKeys(session, privatekey);
			
			jsonresult = {status: 1, private_key: keys['private_key'], public_key: keys['public_key'], address: keys['address'], rsa_public_key: keys['rsa_public_key']};
		}
		catch(e) {
			global.log("exception in clicont_keys_publickeys for sessiontoken " + sessionuuid + ": " + e);
			global.log(e.stack);

			jsonresult = {status: 0, error: "exception could not get public keys"};
		}

	  	res.json(jsonresult);
	}

	// encrypt plain text
	clicont_keys_encrypt(req, res) {
		// POST
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		
		global.log("clicont_keys_encrypt called for sessiontoken " + sessionuuid);
		
		var privatekey  = req.body.private_key;
		var plaintext  = req.body.plaintext;
		
		var jsonresult;
		
		try {
			var commonservice = global.getServiceInstance('common');
			var Session = commonservice.Session;
			var session = Session.getSession(global, sessionuuid);
			
			var clicontservice = global.getServiceInstance('client-container');
			
			var clientcontainer = clicontservice.getClientContainer(session);
			var cryptokeyinterface = clientcontainer.getClientInterface('cryptokey');

			var cyphertext = cryptokeyinterface.aesEncryptString(session, privatekey, plaintext);
			
			var jsonresult = {status: 1, plaintext: plaintext, cyphertext: cyphertext};
		}
		catch(e) {
			global.log("exception in clicont_keys_encrypt for sessiontoken " + sessionuuid + ": " + e);
			global.log(e.stack);

			jsonresult = {status: 0, error: "exception could not encrypt text"};
		}

	  	res.json(jsonresult);
	}

	// decrypt cypher text
	clicont_keys_decrypt(req, res) {
		// POST
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		
		global.log("clicont_keys_decrypt called for sessiontoken " + sessionuuid);
		
		var privatekey  = req.body.private_key;
		var cyphertext  = req.body.cyphertext;
		
		var jsonresult;
		
		try {
			var commonservice = global.getServiceInstance('common');
			var Session = commonservice.Session;
			var session = Session.getSession(global, sessionuuid);
			
			var clicontservice = global.getServiceInstance('client-container');
			
			var clientcontainer = clicontservice.getClientContainer(session);
			var cryptokeyinterface = clientcontainer.getClientInterface('cryptokey');

			var plaintext = cryptokeyinterface.aesDecryptString(session, privatekey, cyphertext);
			
			var jsonresult = {status: 1, cyphertext: cyphertext, plaintext: plaintext};
		}
		catch(e) {
			global.log("exception in clicont_keys_decrypt for sessiontoken " + sessionuuid + ": " + e);
			global.log(e.stack);

			jsonresult = {status: 0, error: "exception could not decrypt text"};
		}

	  	res.json(jsonresult);
	}
	
	
	//
	// local storage
	//
	clicont_localstorage_get(req, res) {
		// POST
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		
		global.log("clicont_localstorage_get called for sessiontoken " + sessionuuid);
		
		var keys  = req.body.keys;
		
		var jsonresult;
		
		try {
			var commonservice = global.getServiceInstance('common');
			var Session = commonservice.Session;
			var session = Session.getSession(global, sessionuuid);
			
			var clicontservice = global.getServiceInstance('client-container');
			
			var clientcontainer = clicontservice.getClientContainer(session);
			var localstorageinterface = clientcontainer.getClientInterface('localstorage');

			var value = localstorageinterface.getValue(session, keys);
			
			var jsonresult = {status: 1, keys: keys, value: value};
		}
		catch(e) {
			global.log("exception in clicont_localstorage_get for sessiontoken " + sessionuuid + ": " + e);
			global.log(e.stack);

			jsonresult = {status: 0, error: "exception could get value"};
		}

	  	res.json(jsonresult);
	}
	
	clicont_localstorage_set(req, res) {
		// POST
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		
		global.log("clicont_localstorage_get called for sessiontoken " + sessionuuid);
		
		var keys  = req.body.keys;
		var value  = req.body.value;
		
		var jsonresult;
		
		try {
			var commonservice = global.getServiceInstance('common');
			var Session = commonservice.Session;
			var session = Session.getSession(global, sessionuuid);
			
			var clicontservice = global.getServiceInstance('client-container');
			
			var clientcontainer = clicontservice.getClientContainer(session);
			var localstorageinterface = clientcontainer.getClientInterface('localstorage');

			var value = localstorageinterface.setValue(session, keys, value);
			
			var jsonresult = {status: 1, keys: keys, value: value};
		}
		catch(e) {
			global.log("exception in clicont_localstorage_get for sessiontoken " + sessionuuid + ": " + e);
			global.log(e.stack);

			jsonresult = {status: 0, error: "exception could get value"};
		}

	  	res.json(jsonresult);
	}
	
	//
	// web3
	//
	
	// root
	clicont_web3_root(req, res) {
		// GET
		var sessionuuid = req.get("sessiontoken");
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;
		
		if (!sessionuuid) {
			// we allow calls without a session
			sessionuuid = global.guid(); // give a one-time sessionuuid
		}

		global.log("web3_get_provider called for sessiontoken " + sessionuuid);
		var web3info = null;
		
		try {
			var session = Session.getSession(global, sessionuuid);
			
			var clicontservice = global.getServiceInstance('client-container');
			
			var clientcontainer = clicontservice.getClientContainer(session);
			var web3interface = clientcontainer.getClientInterface('web3');
			
			web3info = {};
			
			web3info.web3_host = web3interface.getWeb3ProviderUrl(session);

			var execenv = global.getExecutionEnvironment();
			
			if (execenv == 'dev') {
				var web3instance = web3interface.getWeb3Instance(session);

				web3info.web3_instance_version = (web3instance && web3instance.version ? web3instance.version : null);
			}
	
		}
		catch(e) {
			global.log("exception in web3_get_provider for sessiontoken " + sessionuuid + ": " + e);
		}
		var jsonresult;
		
		if (web3info !== null) {
			jsonresult = {status: 1, data: web3info};
		}
		else {
			jsonresult = {status: 0, error: "could not retrieve web3 information"};
		}
	  	
	  	res.json(jsonresult);
	}

	// providers
	clicont_web3_get_provider(req, res) {
		// GET
		var sessionuuid = req.get("sessiontoken");
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;
		
		if (!sessionuuid) {
			// we allow calls without a session
			sessionuuid = global.guid(); // give a one-time sessionuuid
		}

		global.log("web3_get_provider called for sessiontoken " + sessionuuid);
		var web3info = null;
		
		try {
			var session = Session.getSession(global, sessionuuid);
			
			var clicontservice = global.getServiceInstance('client-container');
			
			var clientcontainer = clicontservice.getClientContainer(session);
			var web3interface = clientcontainer.getClientInterface('web3');
			
			web3info = {};
			
			web3info.web3_host = web3interface.getWeb3ProviderUrl(session);
	
		}
		catch(e) {
			global.log("exception in web3_get_provider for sessiontoken " + sessionuuid + ": " + e);
		}
		var jsonresult;
		
		if (web3info !== null) {
			jsonresult = {status: 1, data: web3info};
		}
		else {
			jsonresult = {status: 0, error: "could not retrieve web3 information"};
		}
	  	
	  	res.json(jsonresult);
	}
	
	clicont_web3_add_provider(req, res) {
		// POST
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		
		var web3url  = req.body.web3url;
		
		global.log("web3_add_provider called for sessiontoken " + sessionuuid + " with url " + web3url);
		
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;
		
		var jsonresult;

		try {
			var session = Session.getSession(global, sessionuuid);
			
			var clicontservice = global.getServiceInstance('client-container');
			
			if (session.isAuthenticated()) {
				var clientcontainer = clicontservice.getClientContainer(session);
				var web3interface = clientcontainer.getClientInterface('web3');
				
				// add new url (if not already done)
				var ethnode = web3interface.addWeb3ProviderUrl(session, web3url);
				
				// and return web3info
				var web3info = {};
				
				web3info.web3_host = ethnode.web3_getProviderUrl(session);
				
				jsonresult = {status: 1, data: web3info};
			}
			else {
				jsonresult = {status: 0, error: "session is not authenticated"};
			}
		}
		catch(e) {
			global.log("exception in web3_add_provider for sessiontoken " + sessionuuid + ": " + e);
			
			jsonresult = {status: 0, error: "exception: " + e};
		}
		
	  	res.json(jsonresult);
	}
	
	clicont_web3_set_provider(req, res) {
		// PUT
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		
		var web3url  = req.body.web3url;
		
		global.log("web3_set_provider called for sessiontoken " + sessionuuid + " with url " + web3url);
		
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;
		
		var jsonresult;

		try {
			var session = Session.getSession(global, sessionuuid);
			
			var clicontservice = global.getServiceInstance('client-container');
			
			if (session.isAuthenticated()) {
				var clientcontainer = clicontservice.getClientContainer(session);
				var web3interface = clientcontainer.getClientInterface('web3');
				
				// set new url
				var ethnode = web3interface.setWeb3ProviderUrl(session, web3url);
				
				// and return web3info
				var web3info = {};
				
				web3info.web3_host = ethnode.web3_getProviderUrl(session);
				
				jsonresult = {status: 1, data: web3info};
			}
			else {
				jsonresult = {status: 0, error: "session is not authenticated"};
			}
		}
		catch(e) {
			global.log("exception in web3_set_provider for sessiontoken " + sessionuuid + ": " + e);
			
			jsonresult = {status: 0, error: "exception: " + e};
		}
		
	  	res.json(jsonresult);
	}

	// node info
	clicont_web3_node(req, res) {
		// GET
		var sessionuuid = req.get("sessiontoken");
		//var address = req.params.id;
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;
		
		if (!sessionuuid) {
			// we allow calls without a session
			sessionuuid = global.guid(); // give a one-time sessionuuid
		}

		global.log("clicont_web3_node called for sessiontoken " + sessionuuid);
		
		try {
			var commonservice = global.getServiceInstance('common');
			var Session = commonservice.Session;
			var session = Session.getSession(global, sessionuuid);
			
			var clicontservice = global.getServiceInstance('client-container');
			
			var clientcontainer = clicontservice.getClientContainer(session);
			var web3interface = clientcontainer.getClientInterface('web3');
			
			var nodeinfo = web3interface.getNodeInfo(session);

		}
		catch(e) {
			global.log("exception in clicont_web3_node for sessiontoken " + sessionuuid + ": " + e);
		}
		var jsonresult;
		
		if (nodeinfo !== null) {
			jsonresult = {status: 1, data: nodeinfo};
		}
		else {
			jsonresult = {status: 0, error: "could not retrieve node information"};
		}
	  	
	  	res.json(jsonresult);
	  	
	}


	// balance
	clicont_web3_account_balance(req, res) {
		// GET
		var sessionuuid = req.get("sessiontoken");
		var address = req.params.id;
		
		var global = this.global;

		global.log("clicont_web3_account_balance called for sessiontoken " + sessionuuid + " and address " + address);
		
		var jsonresult = {status: 0, error: "can not use this route"};
	  	
		try {
			var commonservice = global.getServiceInstance('common');
			var Session = commonservice.Session;
			var session = Session.getSession(global, sessionuuid);
			
			var clicontservice = global.getServiceInstance('client-container');
			
			var clientcontainer = clicontservice.getClientContainer(session);
			var web3interface = clientcontainer.getClientInterface('web3');
			
			var balance = web3interface.getBalance(session, address);
			
			jsonresult = {status: 1, balance: balance};
		}
		catch(e) {
			global.log("exception in clicont_web3_account_balance for sessiontoken " + sessionuuid + " and address " + address + ": " + e);
			global.log(e.stack);
		}

	  	res.json(jsonresult);
	  	
	}

	
	//
	// erc20
	//
	
	// token
	clicont_erc20_token(req, res) {
		// GET
		var sessionuuid = req.get("sessiontoken");
		var contractuuid = req.params.id;
		
		var global = this.global;

		global.log("clicont_erc20_token called for sessiontoken " + sessionuuid + " and contractuuid " + contractuuid);
		
		var jsonresult = {status: 0, error: "can not use this route"};
	  	
		try {
			var commonservice = global.getServiceInstance('common');
			var Session = commonservice.Session;
			var session = Session.getSession(global, sessionuuid);
			
			var clicontservice = global.getServiceInstance('client-container');
			
			var clientcontainer = clicontservice.getClientContainer(session);
			var erc20interface = clientcontainer.getClientInterface('erc20');
			
			var erc20tokenjson = erc20interface.getToken(session, contractuuid);
			
			jsonresult = {status: 1, erc20token: erc20tokenjson};
		}
		catch(e) {
			global.log("exception in clicont_erc20_token for sessiontoken " + sessionuuid + " and contractuuid " + contractuuid + ": " + e);
			global.log(e.stack);
		}

	  	res.json(jsonresult);
	}
	
	clicont_erc20_token_import(req, res) {
		// GET
		var sessionuuid = req.get("sessiontoken");
		var tokenaddress = req.params.id;
		
		var global = this.global;

		global.log("clicont_erc20_token_import called for sessiontoken " + sessionuuid + " and tokenaddress " + tokenaddress);
		
		var jsonresult = {status: 0, error: "can not use this route"};
	  	
		try {
			var commonservice = global.getServiceInstance('common');
			var Session = commonservice.Session;
			var session = Session.getSession(global, sessionuuid);
			
			var clicontservice = global.getServiceInstance('client-container');
			
			var clientcontainer = clicontservice.getClientContainer(session);
			var erc20interface = clientcontainer.getClientInterface('erc20');
			
			var erc20tokenjson = erc20interface.importToken(session, tokenaddress);
			
			jsonresult = {status: 1, erc20token: erc20tokenjson};
		}
		catch(e) {
			global.log("exception in clicont_erc20_token for sessiontoken " + sessionuuid + " and tokenaddress " + tokenaddress + ": " + e);
			global.log(e.stack);
		}

	  	res.json(jsonresult);
	}


}

module.exports = ClientContainerControllers;