/**
 * 
 */
'use strict';


class EthNodeControllers {
	
	constructor(global) {
		this.global = global;
		
		//this.ethereum_node = null;
	}
	
	getEthereumNode(session, web3providerurl) {
		var ethnodeservice = this.global.getServiceInstance('ethnode');
		
		return ethnodeservice.getEthereumNodeInstance(session, web3providerurl);
	}
	
	//
	// web 3
	//
	
	
	// root
	web3_root(req, res) {
		// GET
		var sessionuuid = req.get("sessiontoken");
		var web3providerurl = req.get("calltoken");
		//var address = req.params.id;
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;
		
		if (!sessionuuid) {
			// we allow calls without a session
			sessionuuid = global.guid(); // give a one-time sessionuuid
		}

		global.log("web3_node called for sessiontoken " + sessionuuid);
		var web3info = null;
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session, web3providerurl);
			
			web3info = {};
			
			var web3instance = ethnode.getWeb3Instance();
			
			web3info.web3_version = ethnode.web3_version;

			var execenv = global.getExecutionEnvironment();
			
			if (ethnode && (execenv == 'dev')) {
				web3info.web3_host = (web3instance && web3instance.currentProvider ? web3instance.currentProvider.host : null);
				web3info.web3_instance_version = (web3instance && web3instance.version ? web3instance.version : null);
			}
	
		}
		catch(e) {
			global.log("exception in web3_root for sessiontoken " + sessionuuid + ": " + e);
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
	web3_get_provider(req, res) {
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
			var ethnode = this.getEthereumNode(session);
			
			web3info = {};
			
			var web3instance = ethnode.getWeb3Instance();
			
			web3info.web3_version = ethnode.web3_version;

			var execenv = global.getExecutionEnvironment();
			
			if (ethnode && (execenv == 'dev')) {
				web3info.web3_host = (web3instance && web3instance.currentProvider ? web3instance.currentProvider.host : null);
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
	
	web3_add_provider(req, res) {
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
			
			if (session.isAuthenticated()) {
				var ethnodeservice = this.global.getServiceInstance('ethnode');
				
				// set new url
				var ethnode = this.getEthereumNode(session, web3url);
				
				// and return web3info

				var web3info = {};
				
				var web3instance = ethnode.getWeb3Instance();
				
				web3info.web3_version = ethnode.web3_version;

				var execenv = global.getExecutionEnvironment();
				
				if (ethnode && (execenv == 'dev')) {
					web3info.web3_host = (web3instance && web3instance.currentProvider ? web3instance.currentProvider.host : null);
				}
				
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
	
	web3_set_provider(req, res) {
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
			
			if (session.isAuthenticated()) {
				var ethnodeservice = this.global.getServiceInstance('ethnode');
				
				// set new url
				ethnodeservice.setWeb3ProviderFullUrl(session, url);
				
				// and return default web3info

				var web3info = {};
				
				var web3instance = ethnode.getWeb3Instance();
				
				web3info.web3_version = ethnode.web3_version;

				var execenv = global.getExecutionEnvironment();
				
				if (ethnode && (execenv == 'dev')) {
					web3info.web3_host = (web3instance && web3instance.currentProvider ? web3instance.currentProvider.host : null);
				}
				
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
	
	// node
	web3_node(req, res) {
		// GET
		var sessionuuid = req.get("sessiontoken");
		var web3providerurl = req.get("calltoken");
		//var address = req.params.id;
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;
		
		if (!sessionuuid) {
			// we allow calls without a session
			sessionuuid = global.guid(); // give a one-time sessionuuid
		}

		global.log("web3_node called for sessiontoken " + sessionuuid);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session, web3providerurl);
			
			var nodeinfo = ethnode.web3_getNodeInfo();
			
			var execenv = global.getExecutionEnvironment();
			
			if (nodeinfo && (execenv == 'dev')) {
				var web3instance = ethnode.getWeb3Instance();
				
				nodeinfo.web3host = (web3instance ? web3instance.host : null);
			}
	
		}
		catch(e) {
			global.log("exception in web3_node for sessiontoken " + sessionuuid + ": " + e);
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


	
	// account
	web3_account_balance(req, res) {
		// GET
		var sessionuuid = req.get("sessiontoken");
		var web3providerurl = req.get("calltoken");
		var address = req.params.id;
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_account_balance called for sessiontoken " + sessionuuid);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session, web3providerurl);
			
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
		// GET
		var sessionuuid = req.get("sessiontoken");
		var web3providerurl = req.get("calltoken");
		var address = req.params.id;
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_account_code called for sessiontoken " + sessionuuid);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session, web3providerurl);
			
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
			jsonresult = {status: 0, error: "could not retrieve code"};
		}
	  	
	  	res.json(jsonresult);
	  	
	}
	
	web3_account_transaction_count(req, res) {
		// GET
		var sessionuuid = req.get("sessiontoken");
		var web3providerurl = req.get("calltoken");
		var address = req.params.id;
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_account_transaction_count called for sessiontoken " + sessionuuid);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session, web3providerurl);
			
			var count = ethnode.web3_getTransactionCount(address);
		}
		catch(e) {
			global.log("exception in web3_account_transaction_count for sessiontoken " + sessionuuid + " and address " + address + ": " + e);
		}

		var jsonresult;
		
		if (count !== null) {
			jsonresult = {status: 1, count: count};
		}
		else {
			jsonresult = {status: 0, error: "could not retrieve count"};
		}
	  	
	  	res.json(jsonresult);
	  	
	}
	
	// blocks
	web3_block_current_number(req, res) {
		// GET
		var sessionuuid = req.get("sessiontoken");
		var web3providerurl = req.get("calltoken");
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_block_current_number called for sessiontoken " + sessionuuid);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session, web3providerurl);
			
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
		// GET
		var sessionuuid = req.get("sessiontoken");
		var web3providerurl = req.get("calltoken");
		
		var blockid = req.params.id;

		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_block called for sessiontoken " + sessionuuid + " and blockid " + blockid);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session, web3providerurl);
			
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
			jsonresult = {status: 0, error: "could not retrieve block with id " + blockid};
		}
	  	
	  	res.json(jsonresult);
	  	
	}

	web3_block_and_transactions(req, res) {
		// GET
		var sessionuuid = req.get("sessiontoken");
		var web3providerurl = req.get("calltoken");
		
		var blockid = req.params.id;

		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_block_and_transactions called for sessiontoken " + sessionuuid + " and blockid " + blockid);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session, web3providerurl);
			
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
			jsonresult = {status: 0, error: "could not retrieve block with id " + blockid};
		}
	  	
	  	res.json(jsonresult);
	  	
	}

	// transactions
	web3_transaction(req, res) {
		// GET
		var sessionuuid = req.get("sessiontoken");
		var web3providerurl = req.get("calltoken");
		
		var txhash = req.params.id;

		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_transaction called for sessiontoken " + sessionuuid + " and transaction " + txhash);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session, web3providerurl);
			
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
			jsonresult = {status: 0, error: "could not retrieve transaction with hash " + txhash};
		}
	  	
	  	res.json(jsonresult);
	  	
	}

	web3_transaction_receipt(req, res) {
		// GET
		var sessionuuid = req.get("sessiontoken");
		var web3providerurl = req.get("calltoken");
		
		var txhash = req.params.id;

		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_transaction_receipt called for sessiontoken " + sessionuuid + " and transaction " + txhash);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session, web3providerurl);
			
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
			jsonresult = {status: 0, error: "could not retrieve transaction receipt for " + txhash};
		}
	  	
	  	res.json(jsonresult);
	  	
	}

	web3_find_transaction(req, res) {
		// POST
		var sessionuuid = req.get("sessiontoken");
		var web3providerurl = req.get("calltoken");
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;
		
		var transactionuuid = (req.body.transactionuuid ? req.body.transactionuuid : null);

		global.log("web3_find_transaction called for sessiontoken " + sessionuuid + " and transactionuuid " + transactionuuid);

		
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session, web3providerurl);
			
			var result = ethnode.web3_findTransaction(transactionuuid);
		
		}
		catch(e) {
			global.log("exception in web3_find_transaction for sessiontoken " + sessionuuid +  ": " + e);
		}

		
		var jsonresult;
		
		if (result) {
			jsonresult = {status:1, data: result};
		}
		else {
			jsonresult = {status: 0, error: "could not find transaction " + transactionuuid};
		}
	  	
	  	res.json(jsonresult);
	  	
	}

	web3_user_transactions(req, res) {
		// POST
		var sessionuuid = req.get("sessiontoken");
		var web3providerurl = req.get("calltoken");
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;
		
		var useruuid = (req.body.useruuid ? req.body.useruuid : null);

		global.log("web3_user_transactions called for sessiontoken " + sessionuuid + " and useruuid " + useruuid);

		
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session, web3providerurl);
			
			var txarray = ethnode.web3_getUserTransactions(useruuid);
			
			var result = [];
			
			for (var i = 0; i < txarray.length; i++) {
				var tx = txarray[i];
				
				var transactionuuid = tx['transactionuuid'];
				var transactionhash = tx['transactionhash'];
				var creationdate = tx['creationdate'];
				
				var from = tx['from'];
				var to = tx['to'];
				var value = tx['value'];
				
				var status = tx['status'];
				
				var web3providerurl = tx.getWeb3ProviderUrl();
				
				var json = {transactionuuid: transactionuuid, transactionhash: transactionhash, creationdate: creationdate, from: from, to: to, value: value, status: status, web3providerurl: web3providerurl};
				
				result.push(json);
			}
		
		}
		catch(e) {
			global.log("exception in web3_user_transactions for sessiontoken " + sessionuuid +  ": " + e);
		}

		
		var jsonresult;
		
		if (result) {
			jsonresult = {status:1, data: result};
		}
		else {
			jsonresult = {status: 0, error: "could not find transactions for user " + useruuid};
		}
	  	
	  	res.json(jsonresult);
	  	
	}



	web3_sendtransaction(req, res) {
		// POST
		var sessionuuid = req.get("sessiontoken");
		var web3providerurl = req.get("calltoken");
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;
		
		var transactionuuid = (req.body.transactionuuid ? req.body.transactionuuid : null);

		global.log("web3_sendtransaction called for sessiontoken " + sessionuuid + " and transactionuuid " + transactionuuid);

		
		var raw = (req.body.raw ? req.body.raw : null);

		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session, web3providerurl);
			
			if (raw) {
				// transaction signed on the client
				var ethereumtransaction = ethnode.createEthereumTransactionInstance(session);
				
				ethereumtransaction.setRawData(raw);
				
				ethereumtransaction.setTransactionUUID(transactionuuid);
				
				// add additional data to log them
				var fromaddress = ( req.body.from ? req.body.from : null);
				var toaddress = (req.body.to ? req.body.to : null);
				
				var value = (req.body.value ? req.body.value : 0);
				
				var gas = (req.body.gas ? req.body.gas : 0);
				var gasPrice = (req.body.gasPrice ? req.body.gasPrice : 0);
				
				var txdata = (req.body.data ? req.body.data : null);
				var nonce = (req.nonce ? req.nonce : null);

				ethereumtransaction.setFromAddress(fromaddress);
				ethereumtransaction.setToAddress(toaddress);
				ethereumtransaction.setValue(value);
				ethereumtransaction.setGas(gas);
				ethereumtransaction.setGasPrice(gasPrice);
				ethereumtransaction.setData(txdata);
				ethereumtransaction.setNonce(nonce);
				

				
				// send raw transaction
				var result = ethnode.web3_sendRawTransaction(ethereumtransaction);
			}
			else {
				var fromaddress = req.body.from;
				var toaddress = (req.body.to ? req.body.to : null);
				
				var value = (req.body.value ? req.body.value : 0);
				
				var gas = (req.body.gas ? req.body.gas : 0);
				var gasPrice = (req.body.gasPrice ? req.body.gasPrice : 0);
				
				var txdata = req.body.data;
				var nonce = (req.nonce ? req.nonce : null);;
				
				var ethereumtransaction = ethnode.createEthereumTransactionInstance(session, fromaddress);
				
				ethereumtransaction.setFromAddress(fromaddress);
				ethereumtransaction.setToAddress(toaddress);
				ethereumtransaction.setValue(value);
				ethereumtransaction.setGas(gas);
				ethereumtransaction.setGasPrice(gasPrice);
				ethereumtransaction.setData(txdata);
				ethereumtransaction.setNonce(nonce);
				
				ethereumtransaction.setTransactionUUID(transactionuuid);
				
				// wallet if required to unlock with a password
				var walletaddress = (req.body.walletaddress ? req.body.walletaddress : null);
				var password = (req.body.password ? req.body.password : null);
				var time = (req.body.time ? req.body.time : null);
				var duration = (req.body.duration ? req.body.duration : null);
				
				global.log("wallet address: " + walletaddress);
				
				// we unlock the wallet account
				if (walletaddress) {
					ethnode.web3_unlockAccount(walletaddress, password, duration);
				}
				
				var result = ethnode.web3_sendTransaction(ethereumtransaction);
				
				// we relock the wallet account
				if (walletaddress) {
					ethnode.web3_lockAccount(walletaddress);
				}
			}
			
		}
		catch(e) {
			global.log("exception in web3_sendtransaction for sessiontoken " + sessionuuid +  ": " + e);
		}

		
		var jsonresult;
		
		if (result) {
			jsonresult = {status:1, transactionuuid: transactionuuid, transactionhash: result};
		}
		else {
			jsonresult = {status: 0, error: "could not send transaction " + transactionuuid};
		}
	  	
	  	res.json(jsonresult);
	  	
	}



	// contracts
	web3_artifact_load(req, res) {
		// POST
		var sessionuuid = req.get("sessiontoken");
		var web3providerurl = req.get("calltoken");
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		var artifactpath = req.body.artifactpath;
		
		
		global.log("web3_artifact_load called for sessiontoken " + sessionuuid + " and artifactpath " + artifactpath);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session, web3providerurl);
			
			var contractartifact = ethnode.web3_loadArtifact(artifactpath);
			
		}
		catch(e) {
			global.log("exception in web3_artifact_load for sessiontoken " + sessionuuid +  ": " + e);
		}

		
		var jsonresult;
		
		if (contractartifact) {
			var contractartifactuuid = session.guid();
			
			ethnode.putWeb3ContractArtifact(contractartifactuuid, contractartifact);
			
			var contractname = contractartifact.getContractName();
			var artifactpath = contractartifact.getArtifactPath();
			var abi = contractartifact.getAbi();
			var bytecode = contractartifact.getByteCode();
			
			jsonresult = {status: 1, artifactuuid: contractartifactuuid, contractname: contractname, artifactpath: artifactpath, abi: abi, bytecode: bytecode};
			
		}
		else {
			jsonresult = {status: 0, error: "could not load artifact at path " + artifactpath};
		}

	  	
	  	res.json(jsonresult);
	}

	web3_contract_load(req, res) {
		// POST
		var sessionuuid = req.get("sessiontoken");
		var web3providerurl = req.get("calltoken");
		
		var artifactuid = req.body.artifactuuid;
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_contract_load called for sessiontoken " + sessionuuid + " and artifactuuid " + artifactuid);
		
		
		var jsonresult;
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session, web3providerurl);
			
			var artifact = ethnode.getWeb3ContractArtifact(artifactuid);
			//var artifact = session.getObject(artifactuid);

			var web3contract = ethnode.web3_contract_load(artifact);
		}
		catch(e) {
			global.log("exception in web3_contract_load for sessiontoken " + sessionuuid + " and artifactuuid " + artifactuid +  ": " + e);
		}
		
		if (web3contract) {
			var contractuuid = session.guid();
			
			ethnode.putWeb3Contract(contractuuid, web3contract);
			
			jsonresult = {status:1, contractuuid: contractuuid};
			
		}
		else {
			jsonresult = {status: 0, error: "could not load artifact for " + artifactuid};
		}
	  	
	  	res.json(jsonresult);
	}

	web3_contract_at(req, res) {
		// POST
		var sessionuuid = req.get("sessiontoken");
		var web3providerurl = req.get("calltoken");
		
		var contractuuid = req.body.contractuuid;
		var address = req.body.address;

		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_contract_at called for sessiontoken " + sessionuuid + " and contractuuid " + contractuuid + " and address " + address);
		
		try {
			
			if (contractuuid) {
				var session = Session.getSession(global, sessionuuid);
				var ethnode = this.getEthereumNode(session, web3providerurl);
				
				var web3contract = ethnode.getWeb3Contract(contractuuid);
				//var trufflecontract = session.getObject(contractuuid);
				
				if (web3contract) {
					var contractinstance = ethnode.web3_contract_at(web3contract, address);
					
					var jsonresult;
					
					if (contractinstance) {
						var contractinstanceuuid = session.guid();
						
						ethnode.putWeb3ContractInstance(contractinstanceuuid, contractinstance)
						
						jsonresult = {status: 1, contractinstanceuuid: contractinstanceuuid};
						
					}
					else{
						jsonresult = {status: 0, error: "could not load contract at address " + address};
					}
					
				}
				else {
					jsonresult = {status: 0, error: "could not find web3 contract with uuid " + contractuuid};
				}
			}
			else {
				var abistring = req.body.abi;
				
				if (abistring) {
					var abi = JSON.parse(abistring);
				
					var contractinstance = ethnode.web3_contract_load_at(abi, contractaddress);
					
					var jsonresult;
					
					if (contractinstance) {
						var contractinstanceuuid = session.guid();
						
						ethnode.putWeb3ContractInstance(contractinstanceuuid, contractinstance)
						
						jsonresult = {status: 1, contractinstanceuuid: contractinstanceuuid};
						
					}
					else{
						jsonresult = {status: 0, error: "could not load contract at address " + address};
					}
				}
			}
		
		}
		catch(e) {
			global.log("exception in web3_contract_at for sessiontoken " + sessionuuid+ " and contractuuid " + contractuuid + " and address " + address +  ": " + e);
			//global.log(e.stack);
		}
		

		if (!jsonresult) {
			jsonresult = {status: 0, error: "exception in web3_contract_at for contract with uuid " + contractuuid};
		}
	  	
	  	res.json(jsonresult);
	}

	web3_contract_new(req, res) {
		// POST
		var sessionuuid = req.get("sessiontoken");
		var web3providerurl = req.get("calltoken");
		
		var contractuuid = req.body.contractuuid;
		var args = (req.body.args ? JSON.parse(req.body.args) : []);
		var txjson = (req.body.txjson ? JSON.parse(req.body.txjson) : {});

		var walletaddress = (req.body.walletaddress ? req.body.walletaddress : null);
		var password = (req.body.password ? req.body.password : null);
		var time = (req.body.time ? req.body.time : null);
		var duration = (req.body.duration ? req.body.duration : null);
		
		var transactionuuid = (req.body.transactionuuid ? req.body.transactionuuid : null);

		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_contract_new called for sessiontoken " + sessionuuid + " and transactionuuid " + transactionuuid);
		global.log("wallet address: " + walletaddress);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session, web3providerurl);
			
			var contract = ethnode.getWeb3Contract(contractuuid);
			//var contract = session.getObject(contractuuid);
			
			// we unlock the wallet account
			if (walletaddress) {
				ethnode.web3_unlockAccount(walletaddress, password, duration);
			}
			
			var ethereumtransaction = ethnode.createEthereumTransactionInstance(session);
			
			ethereumtransaction.setTxJson(txjson)
			
			ethereumtransaction.setTransactionUUID(transactionuuid);
			
			var callparams = args.slice();
			
			callparams.push(ethereumtransaction);

			var contractinstance = ethnode.web3_contract_new(contract, callparams);
			
			// we relock the wallet account
			if (walletaddress) {
				ethnode.web3_lockAccount(walletaddress);
			}
		}
		catch(e) {
			global.log("exception in web3_contract_new for sessiontoken " + sessionuuid +  ": " + e);
		}
		

		var jsonresult;
		
		if (contractinstance) {
			var contractinstanceuuid = session.guid();
			
			ethnode.putWeb3ContractInstance(contractinstanceuuid, contractinstance);
			
			jsonresult = {status: 1, contractinstanceuuid: contractinstanceuuid, address: contractinstance.address};
		}
		else {
			jsonresult = {status: 0, error: "could not deploy contract " + contractinstanceuuid};
		}
	  	
	  	res.json(jsonresult);
	}

	web3_contract_call(req, res) {
		// POST
		var sessionuuid = req.get("sessiontoken");
		var web3providerurl = req.get("calltoken");
		
		var contractaddress = req.params.id;
		
		var contractinstanceuuid = req.body.contractinstanceuuid;
		
		var methodname = req.body.methodname;
		
		var params = (req.body.params ? JSON.parse(req.body.params) : []);

		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_contract_call called for sessiontoken " + sessionuuid + " and address " + contractaddress 
				+ " and contractinstanceuuid " + contractinstanceuuid + " and method " + methodname);
		
		var result;
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session, web3providerurl);
			
			var contractinstance = ethnode.getWeb3ContractInstance(contractinstanceuuid)
			
			if (methodname) {
				result = ethnode.web3_method_call(contractinstance, methodname, params)
			}
			else {
				var abidefjsonstring  = req.body.abidef;
				if (abidefjsonstring) {
					var abidef = JSON.parse(abidefjsonstring);
					var methodname = abidef.name;
					
					result = ethnode.web3_contract_dynamicMethodCall(contractinstance, abidef, params);
				}
			}
			
			
			
			//global.log("web3_contract_call called for sessiontoken "+ sessionuuid + " method " + methodname + " result is " + result);
		}
		catch(e) {
			global.log("exception in web3_contract_call for sessiontoken " + sessionuuid + " method " + methodname + " contractinstanceuuid " + contractinstanceuuid + ": " + e);
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

	web3_contract_send(req, res) {
		// POST
		var sessionuuid = req.get("sessiontoken");
		var web3providerurl = req.get("calltoken");
		
		var contractaddress = req.params.id;
		
		var contractinstanceuuid = req.body.contractinstanceuuid;
		var methodname  = req.body.methodname;
		var params = (req.body.params ? JSON.parse(req.body.params) : []);
		var args = (req.body.args ? JSON.parse(req.body.args) : []);
		var txjson = (req.body.txjson ? JSON.parse(req.body.txjson) : {});

		var walletaddress = (req.body.walletaddress ? req.body.walletaddress : null);
		var password = (req.body.password ? req.body.password : null);
		var time = (req.body.time ? req.body.time : null);
		var duration = (req.body.duration ? req.body.duration : null);
		
		var transactionuuid = (req.body.transactionuuid ? req.body.transactionuuid : null);
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		global.log("web3_contract_send called for sessiontoken " + sessionuuid + " method " + methodname + " contractinstanceuuid " + contractinstanceuuid);
		global.log("txjson: " + (txjson ? JSON.stringify(txjson) : 'undefined'));
		global.log("wallet address: " + walletaddress);
		global.log("transactionuuid: " + transactionuuid);
		
		try {
			var session = Session.getSession(global, sessionuuid);
			var ethnode = this.getEthereumNode(session, web3providerurl);
			
			var contractinstance = ethnode.getWeb3ContractInstance(contractinstanceuuid);;
			//var contractinstance = session.getObject(contractinstanceuuid);
			

			// we unlock the wallet account
			if (walletaddress) {
				ethnode.web3_unlockAccount(walletaddress, password, duration);
			}
			
			var ethereumtransaction = ethnode.createEthereumTransactionInstance(session);
			
			ethereumtransaction.setTxJson(txjson)
			
			ethereumtransaction.setTransactionUUID(transactionuuid);
			
			var callparams = args.slice();
			
			callparams.push(ethereumtransaction);

			var result = ethnode.web3_method_sendTransaction(contractinstance, methodname, callparams);
			
			// we relock the wallet account
			if (walletaddress) {
				ethnode.web3_lockAccount(walletaddress);
			}
		}
		catch(e) {
			global.log("exception in web3_contract_send: " + e);
		}

		var jsonresult;
		
		if (result !== null) {
			jsonresult = {status: 1, transactionhash: (result ? result.toString() : null)};
		}
		else {
			jsonresult = {status: 0, error: "could not get result for method " + methodname};
		}
	  	
	  	res.json(jsonresult);
	}

}

module.exports = EthNodeControllers;