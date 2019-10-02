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
		}

		res.json(jsonresult);
	}
	
	//
	// web3
	//
	
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

	//
	// crypto
	//
	
	// generate private key
	clicont_keys_generate(req, res) {
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
			var cryptokeyinterface = clientcontainer.getClientInterface('cryptokey');
			
			var private_key = cryptokeyinterface.generatePrivateKey(session);
			
			jsonresult = {status: 1, private_key: private_key};
		}
		catch(e) {
			global.log("exception in clicont_web3_account_balance for sessiontoken " + sessionuuid + " and address " + address + ": " + e);
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
			
			jsonresult = {private_key: keys['private_key'], public_key: keys['public_key'], address: keys['address'], rsa_public_key: keys['rsa_public_key']};
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
			
			var jsonresult = {plaintext: plaintext, cyphertext: cyphertext};
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
			
			var jsonresult = {cyphertext: cyphertext, plaintext: plaintext};
		}
		catch(e) {
			global.log("exception in clicont_keys_decrypt for sessiontoken " + sessionuuid + ": " + e);
			global.log(e.stack);

			jsonresult = {status: 0, error: "exception could not decrypt text"};
		}

	  	res.json(jsonresult);
	}

}

module.exports = ClientContainerControllers;