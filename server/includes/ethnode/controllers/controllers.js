/**
 * 
 */
'use strict';


class EthNodeControllers {
	
	constructor(global) {
		this.global = global;
		
		this.ethereum_node = null;
	}
	
	getEthereumNode(session) {
		var ethnodeservice = this.global.getServiceInstance('ethnode');
		
		return ethnodeservice.getEthereumNodeInstance(session);
	}
	
	//
	// web 3
	//
	
	// node
	web3_node(req, res) {
		var sessionuuid = req.get("sessiontoken");
		var address = req.params.id;
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_node called for sessiontoken " + sessionuuid);
		
		var session = Session.getSession(global, sessionuuid);
		var ethnode = this.getEthereumNode(session);
		
		var nodeinfo = ethnode.web3_getNodeInfo();

		var jsonresult;
		
		if (balance !== null) {
			jsonresult = {status: 1, data: nodeinfo};
		}
		else {
			jsonresult = {status: 0, error: "could not retrieve balance"};
		}
	  	
	  	res.json(jsonresult);
	  	
	}


	
	// account
	web3_account_balance(req, res) {
		var sessionuuid = req.get("sessiontoken");
		var address = req.params.id;
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_account_balance called for sessiontoken " + sessionuuid);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session);
			
			var balance = ethnode.web3_getAccountBalance(address);
		}
		catch(e) {
			global.log("exception in web3_account_balance for sessiontoken " + sessionuuid + " and address " + address + ": " + e);
		}

		var jsonresult;
		
		if (balance !== null) {
			jsonresult = {status: 1, balance: balance};
		}
		else {
			jsonresult = {status: 0, error: "could not retrieve balance"};
		}
	  	
	  	res.json(jsonresult);
	  	
	}

	web3_account_code(req, res) {
		var sessionuuid = req.get("sessiontoken");
		var address = req.params.id;
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_account_code called for sessiontoken " + sessionuuid);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session);
			
			var code = ethnode.web3_getAccountCode(address);
		}
		catch(e) {
			global.log("exception in web3_account_code for sessiontoken " + sessionuuid + " and address " + address + ": " + e);
		}

		var jsonresult;
		
		if (code !== null) {
			jsonresult = {status: 1, code: code};
		}
		else {
			jsonresult = {status: 0, error: "could not retrieve balance"};
		}
	  	
	  	res.json(jsonresult);
	  	
	}
	
	// blocks
	web3_block_current_number(req, res) {
		var sessionuuid = req.get("sessiontoken");
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_block_current_number called for sessiontoken " + sessionuuid);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session);
			
			var blocknumber = ethnode.web3_getHighestBlockNumber();
		}
		catch(e) {
			global.log("exception in web3_block_current_number for sessiontoken " + sessionuuid +  ": " + e);
		}

		var jsonresult;
		
		if (blocknumber !== -1) {
			jsonresult = {status: 1, number: blocknumber};
		}
		else {
			jsonresult = {status: 0, error: "could not retrieve current block number"};
		}
	  	
	  	res.json(jsonresult);
	  	
	}

	web3_block(req, res) {
		var sessionuuid = req.get("sessiontoken");
		
		var blockid = req.params.id;

		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_block called for sessiontoken " + sessionuuid + " and blockid " + blockid);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session);
			
			var blockjson = ethnode.web3_getBlock(blockid, false);
		}
		catch(e) {
			global.log("exception in web3_block for sessiontoken " + sessionuuid +  ": " + e);
		}


		var jsonresult;
		
		if (blockjson) {
			jsonresult = {status: 1, data: blockjson};
		}
		else {
			jsonresult = {status: 0, error: "could not retrieve current block number"};
		}
	  	
	  	res.json(jsonresult);
	  	
	}

	web3_block_and_transactions(req, res) {
		var sessionuuid = req.get("sessiontoken");
		
		var blockid = req.params.id;

		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_block_and_transactions called for sessiontoken " + sessionuuid + " and blockid " + blockid);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session);
			
			var blockjson = ethnode.web3_getBlock(blockid, true);
		}
		catch(e) {
			global.log("exception in web3_block_and_transactions for sessiontoken " + sessionuuid +  ": " + e);
		}

		var jsonresult;
		
		if (blockjson) {
			jsonresult = {status: 1, data: blockjson};
		}
		else {
			jsonresult = {status: 0, error: "could not retrieve current block number"};
		}
	  	
	  	res.json(jsonresult);
	  	
	}

	// transactions
	web3_transaction(req, res) {
		var sessionuuid = req.get("sessiontoken");
		
		var txhash = req.params.id;

		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_transaction called for sessiontoken " + sessionuuid + " and transaction " + txhash);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session);
			
			var txjson = ethnode.web3_getTransaction(txhash);
		}
		catch(e) {
			global.log("exception in web3_transaction for sessiontoken " + sessionuuid +  ": " + e);
		}


		var jsonresult;
		
		if (txjson) {
			jsonresult = {status: 1, data: txjson};
		}
		else {
			jsonresult = {status: 0, error: "could not retrieve current block number"};
		}
	  	
	  	res.json(jsonresult);
	  	
	}

	web3_transaction_receipt(req, res) {
		var sessionuuid = req.get("sessiontoken");
		
		var txhash = req.params.id;

		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_transaction_receipt called for sessiontoken " + sessionuuid + " and transaction " + txhash);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session);
			
			var txjson = ethnode.web3_getTransactionReceipt(txhash);
		}
		catch(e) {
			global.log("exception in web3_transaction_receipt for sessiontoken " + sessionuuid +  ": " + e);
		}

		var jsonresult;
		
		if (txjson) {
			jsonresult = {status: 1, data: txjson};
		}
		else {
			jsonresult = {status: 0, error: "could not retrieve current block number"};
		}
	  	
	  	res.json(jsonresult);
	  	
	}

	// contracts
	web3_contract_load(req, res) {
		var sessionuuid = req.get("sessiontoken");
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_contract_load called for sessiontoken " + sessionuuid);
		
		var contractaddress = req.body.address;
		var abistring = req.body.abi;
		var abi = JSON.parse(abistring);

		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session);
			
			var contractinstance = ethnode.web3_contract_load_at(abi, contractaddress);
		}
		catch(e) {
			global.log("exception in web3_contract_load for sessiontoken " + sessionuuid +  ": " + e);
		}

		
		var jsonresult;
		
		if (contractinstance) {
			var contractinstanceuuid = session.guid();
			
			ethnode.putWeb3ContractInstance(contractinstanceuuid, contractinstance)
			//session.pushObject(contractinstanceuuid, contractinstance);

			jsonresult = {status:1, contractinstanceuuid: contractinstanceuuid};
			
		}
		else {
			jsonresult = {status: 0, error: "could not load contract for " + contractaddress};
		}
	  	
	  	res.json(jsonresult);
	  	
	}

	web3_contract_call(req, res) {
		var sessionuuid = req.get("sessiontoken");
		
		var contractaddress = req.params.id;
		
		var contractinstanceuuid = req.body.contractinstanceuuid;
		
		var abidefjsonstring  = req.body.abidef;
		var abidef = JSON.parse(abidefjsonstring);
		var methodname = abidef.name;
		
		var params = (req.body.params ? JSON.parse(req.body.params) : []);

		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_contract_call called for sessiontoken " + sessionuuid + " and address " + contractaddress 
				+ " and contractinstanceuuid " + contractinstanceuuid + " and method " + methodname);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session);
			
			var contractinstance = ethnode.getWeb3ContractInstance(contractinstanceuuid)
			//var contractinstance = session.getObject(contractinstanceuuid);
			
			var result = ethnode.web3_contract_dynamicMethodCall(contractinstance, abidef, params);
			
			//global.log("web3_contract_call called for sessiontoken "+ sessionuuid + " method " + methodname + " result is " + result);
		}
		catch(e) {
			global.log("exception in web3_contract_call for sessiontoken " + sessionuuid + " method " + methodname + " contractinstanceuuid " + contractinstanceuuid + ": " + e.stack);
		}

		var jsonresult;
		
		if (result) {
			jsonresult = {status: 1, result: result};
		}
		else {
			jsonresult = {status: 0, error: "could not get result for method " + methodname};
		}
	  	
	  	res.json(jsonresult);
	  	
	}


	//
	// truffle
	//
	truffle_loadartifact(req, res) {
		var sessionuuid = req.get("sessiontoken");
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		var artifactpath = req.body.artifactpath;
		
		
		global.log("truffle_loadartifact called for sessiontoken " + sessionuuid + " and artifactpath " + artifactpath);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session);
			
			var contractartifact = ethnode.truffle_loadArtifact(artifactpath);
			
		}
		catch(e) {
			global.log("exception in truffle_loadartifact for sessiontoken " + sessionuuid +  ": " + e);
		}

		
		// test
		//var Tests = require('../../test/tests.js');
		//Tests.testEthNode(global, session, artifactpath);
		// test
		
		var jsonresult;
		
		if (contractartifact) {
			var contractartifactuuid = session.guid();
			
			ethnode.putTruffleContractArtifact(contractartifactuuid, contractartifact);
			//session.pushObject(contractartifactuuid, contractartifact);
			
			jsonresult = {status: 1, artifact: contractartifactuuid};
			
		}
		else {
			jsonresult = {status: 0, error: "could not load artifact at path " + artifactpath};
		}

	  	
	  	res.json(jsonresult);
	}

	truffle_loadContract(req, res) {
		var sessionuuid = req.get("sessiontoken");
		
		var artifactuid = req.body.artifact;
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("truffle_loadContract called for sessiontoken " + sessionuuid + " and artifactuuid " + artifactuid);
		
		
		var jsonresult;
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session);
			
			var artifact = ethnode.getTruffleContractArtifact(artifactuid);
			//var artifact = session.getObject(artifactuid);

			var trufflecontract = ethnode.truffle_loadContract(artifact);
		}
		catch(e) {
			global.log("exception in truffle_loadContract for sessiontoken " + sessionuuid + " and artifactuuid " + artifactuid +  ": " + e);
		}
		
		if (trufflecontract) {
			var contractuuid = session.guid();
			
			ethnode.putTruffleContract(contractuuid, trufflecontract);
			//session.pushObject(contractuuid, trufflecontract);

			jsonresult = {status:1, contractuuid: contractuuid};
			
		}
		else {
			jsonresult = {status: 0, error: "could not load artifact for " + artifactuid};
		}
			
		
	  	
	  	res.json(jsonresult);
	}

	truffle_contract_at(req, res) {
		var sessionuuid = req.get("sessiontoken");
		
		var contractuuid = req.body.contractuuid;
		var address = req.body.address;

		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("truffle_contract_at called for sessiontoken " + sessionuuid + " and contractuuid " + contractuuid + " and address " + address);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session);
			
			var trufflecontract = ethnode.getTruffleContract(contractuuid);
			//var trufflecontract = session.getObject(contractuuid);
			
			if (trufflecontract) {
				var contractinstance = ethnode.truffle_contract_at(trufflecontract, address);
				
				var jsonresult;
				
				if (contractinstance) {
					var contractinstanceuuid = session.guid();
					
					ethnode.putTruffleContractInstance(contractinstanceuuid, contractinstance)
					//session.pushObject(contractinstanceuuid, contractinstance);
					
					jsonresult = {status: 1, contractinstanceuuid: contractinstanceuuid};
					
				}
				else{
					jsonresult = {status: 0, error: "could not load contract at address " + address};
				}
				
			}
			else {
				jsonresult = {status: 0, error: "could not find truffle contract with uuid " + contractuuid};
			}
		
		}
		catch(e) {
			global.log("exception in truffle_contract_at for sessiontoken " + sessionuuid+ " and contractuuid " + contractuuid + " and address " + address +  ": " + e);
		}
		

		if (!jsonresult) {
			jsonresult = {status: 0, error: "exception in truffle_contract_at for contract with uuid " + contractuuid};
		}
	  	
	  	res.json(jsonresult);
	}

	truffle_contract_new(req, res) {
		var sessionuuid = req.get("sessiontoken");
		
		var contractuuid = req.body.contractuuid;
		var params = (req.body.params ? JSON.parse(req.body.params) : []);

		var walletaddress = (req.body.walletaddress ? req.body.walletaddress : null);
		var password = (req.body.password ? req.body.password : null);
		var time = (req.body.time ? req.body.time : null);
		var duration = (req.body.duration ? req.body.duration : null);
		

		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("truffle_contract_new called for sessiontoken " + sessionuuid);
		global.log("wallet address: " + walletaddress);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session);
			
			var contract = ethnode.getTruffleContract(contractuuid);
			//var contract = session.getObject(contractuuid);
			
			// we unlock the wallet account
			if (walletaddress)
			ethnode.web3_unlockAccount(walletaddress, password, duration);
			
			try {
				var contractinstance = ethnode.truffle_contract_new(contract, params);
			}
			catch(e) {
				global.log("exception in truffle_contract_new for sessiontoken " + sessionuuid +  ": " + e);
			}
			
		}
		catch(e) {
			global.log("exception in truffle_contract_new: " + e);
		}
		

		var jsonresult;
		
		if (contractinstance) {
			var contractinstanceuuid = session.guid();
			
			ethnode.putTruffleContractInstance(contractinstanceuuid, contractinstance);
			//session.pushObject(contractinstanceuuid, contractinstance);
		
			jsonresult = {status: 1, contractinstanceuuid: contractinstanceuuid, address: contractinstance.address};
		}
		else {
			jsonresult = {status: 0, error: "could not deploy contract " + contractinstanceuuid};
		}
	  	
	  	res.json(jsonresult);
	}

	truffle_method_call(req, res) {
		var sessionuuid = req.get("sessiontoken");
		
		var contractaddress = req.params.id;
		
		var contractinstanceuuid = req.body.contractinstanceuuid;
		var methodname  = req.body.methodname;
		var params = (req.body.params ? JSON.parse(req.body.params) : []);

		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("truffle_method_call called for sessiontoken " + sessionuuid + " method " + methodname + " contractinstanceuuid " + contractinstanceuuid);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session);
			
			var contractinstance = ethnode.getTruffleContractInstance(contractinstanceuuid);
			//var contractinstance = session.getObject(contractinstanceuuid);
			
			var result = ethnode.truffle_method_call(contractinstance, methodname, params);
				
			global.log("truffle_method_call called for sessiontoken "+ sessionuuid + " method " + methodname + " result is " + result);

		}
		catch(e) {
			global.log("exception in truffle_method_call for sessiontoken " + sessionuuid + " method " + methodname + " contractinstanceuuid " + contractinstanceuuid + ": " + e.stack);
		}
		
		var jsonresult;
		
		if (result !== null) {
			jsonresult = {status: 1, result: result};
		}
		else {
			jsonresult = {status: 0, error: "could not get result for method " + methodname};
		}
	  	
		//global.log("truffle_method_call response is " + JSON.stringify(jsonresult));
	  	
	  	res.json(jsonresult);
	}

	truffle_method_sendTransaction(req, res) {
		var sessionuuid = req.get("sessiontoken");
		
		var contractaddress = req.params.id;
		
		var contractinstanceuuid = req.body.contractinstanceuuid;
		var methodname  = req.body.methodname;
		var params = (req.body.params ? JSON.parse(req.body.params) : []);

		var walletaddress = (req.body.walletaddress ? req.body.walletaddress : null);
		var password = (req.body.password ? req.body.password : null);
		var time = (req.body.time ? req.body.time : null);
		var duration = (req.body.duration ? req.body.duration : null);
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("truffle_method_sendTransaction called for sessiontoken " + sessionuuid + " method " + methodname + " contractinstanceuuid " + contractinstanceuuid);
		global.log("wallet address: " + walletaddress);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session);
			
			var contractinstance = ethnode.getTruffleContractInstance(contractinstanceuuid);;
			//var contractinstance = session.getObject(contractinstanceuuid);
			

			// we unlock the wallet account
			if (walletaddress)
			ethnode.web3_unlockAccount(walletaddress, password, duration);
			
			var result = ethnode.truffle_method_sendTransaction(contractinstance, methodname, params);
			
		}
		catch(e) {
			global.log("exception in truffle_method_sendTransaction: " + e);
		}

		var jsonresult;
		
		if (result !== null) {
			jsonresult = {status: 1, result: (result ? result.toString() : null)};
		}
		else {
			jsonresult = {status: 0, error: "could not get result for method " + methodname};
		}
	  	
	  	res.json(jsonresult);
	}

}

module.exports = EthNodeControllers;