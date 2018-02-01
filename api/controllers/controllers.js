/**
 * 
 */

'use strict';

var Global = require('../../server/includes/global.js');

var global = Global.getGlobalInstance();

var Session = require('../../server/includes/session.js');


exports.dapp = function(req, res) {
	res.sendFile(dapp_root_dir + 'index.html');
}


//global Routes
exports.version = function(req, res) {
	var jsonresult = {status: 1, version:  "0.0.1"};
  	
  	res.json(jsonresult);
  	
}

// web 3
exports.web3_balance = function(req, res) {
	var sessionuuid = req.get("sessiontoken");
	var address = req.params.id;
	
	global.log("web3_balance called for sessiontoken " + sessionuuid);
	
	var session = Session.getSession(sessionuuid);
	var ethnode = session.getEthereumNode();
	
	var balance = ethnode.web3_getBalance(address);

	var jsonresult;
	
	if (balance !== null) {
		jsonresult = {status: 1, balance: balance};
	}
	else {
		jsonresult = {status: 0, error: "could not retrieve balance"};
	}
  	
  	res.json(jsonresult);
  	
}

//truffle
exports.truffle_loadartifact = function(req, res) {
	var sessionuuid = req.get("sessiontoken");
	
	global.log("truffle_loadartifact called for sessiontoken " + sessionuuid);
	
	var artifactpath = req.body.artifactpath;
	
	var session = Session.getSession(sessionuuid);
	var ethnode = session.getEthereumNode();
	
	var contractartifact = ethnode.truffle_loadArtifact(artifactpath);
	
	// test
	//var Tests = require('../../test/tests.js');
	//Tests.testEthNode(global, session, artifactpath);
	// test
	
	var jsonresult;
	
	if (contractartifact) {
		var contractartifactuuid = session.guid();
		session.pushObject(contractartifactuuid, contractartifact);
		
		jsonresult = {status: 1, artifact: contractartifactuuid};
		
	}
	else {
		jsonresult = {status: 0, error: "could not load artifact at path " + artifactpath};
	}

  	
  	res.json(jsonresult);
  	
}

exports.truffle_loadContract = function(req, res) {
	var sessionuuid = req.get("sessiontoken");
	
	var artifactuid = req.body.artifact;
	
	global.log("truffle_loadContract called for sessiontoken " + sessionuuid + " and artifactuuid " + artifactuid);
	
	var session = Session.getSession(sessionuuid);
	var ethnode = session.getEthereumNode();
	
	var artifact = session.getObject(artifactuid);
	
	var jsonresult;
	
	var trufflecontract = ethnode.truffle_loadContract(artifact);
	
	if (trufflecontract) {
		var contractuuid = session.guid();
		session.pushObject(contractuuid, trufflecontract);

		jsonresult = {status:1, contractuuid: contractuuid};
		
	}
	else {
		jsonresult = {status: 0, error: "could not load artifact for " + artifactuid};
	}
		
	
  	
  	res.json(jsonresult);
}

exports.truffle_contract_at = function(req, res) {
	var sessionuuid = req.get("sessiontoken");
	
	var contractuuid = req.body.contractuuid;
	var address = req.body.address;

	global.log("truffle_contract_at called for sessiontoken " + sessionuuid + " and contractuuid " + contractuuid + " and address " + address);
	
	var session = Session.getSession(sessionuuid);
	var ethnode = session.getEthereumNode();
	
	var trufflecontract = session.getObject(contractuuid);
	
	var contractinstance = ethnode.truffle_contract_at(trufflecontract, address);
	
	var jsonresult;
	
	if (contractinstance) {
		var contractinstanceuuid = session.guid();
		session.pushObject(contractinstanceuuid, contractinstance);
		
		jsonresult = {status: 1, contractinstanceuuid: contractinstanceuuid, address: contractinstance.address};
		
	}
	else{
		jsonresult = {status: 0, error: "could not load contract at address " + address};
	}

  	
  	res.json(jsonresult);
}

exports.truffle_contract_new = function(req, res) {
	var sessionuuid = req.get("sessiontoken");
	
	var contractuuid = req.body.contractuuid;
	var params = (req.body.params ? JSON.parse(req.body.params) : []);;

	global.log("truffle_contract_new called for sessiontoken " + sessionuuid);
	
	var session = Session.getSession(sessionuuid);
	var ethnode = session.getEthereumNode();
	
	var constractinstance = session.getObject(contractuuid);
	
	var contract = ethnode.truffle_contract_new(constractinstance, params);

	var jsonresult;
	
	if (contractinstance) {
		var contractinstanceuuid = session.guid();
		session.pushObject(contractinstanceuuid, contractinstance);
	
		jsonresult = {status: 1, contractinstanceuuid: contractinstanceuuid, address: contractinstance.address};
	}
	else {
		jsonresult = {status: 0, error: "could not deploy contract " + contractinstanceuuid};
	}
  	
  	res.json(jsonresult);
}

exports.truffle_method_call = function(req, res) {
	var sessionuuid = req.get("sessiontoken");
	
	var contractaddress = req.params.id;
	
	var contractinstanceuuid = req.body.contractinstanceuuid;
	var methodname  = req.body.methodname;
	var params = (req.body.params ? JSON.parse(req.body.params) : []);

	global.log("truffle_method_call called for sessiontoken " + sessionuuid + " method " + methodname + " constractinstanceuuid " + contractinstanceuuid);
	
	var session = Session.getSession(sessionuuid);
	var ethnode = session.getEthereumNode();
	
	var constractinstance = session.getObject(contractinstanceuuid);
	
	var result = ethnode.truffle_method_call(constractinstance, methodname, params);
	
	global.log("truffle_method_call called for sessiontoken "+ " method " + methodname + " result is " + result);

	var jsonresult;
	
	if (result !== null) {
		jsonresult = {status: 1, result: result};
	}
	else {
		jsonresult = {status: 0, error: "could not get result for method " + methodname};
	}
  	
  	res.json(jsonresult);
}

exports.truffle_method_sendTransaction = function(req, res) {
	var sessionuuid = req.get("sessiontoken");
	
	var contractaddress = req.params.id;
	
	var contractinstanceuuid = req.body.contractinstanceuuid;
	var methodname  = req.body.methodname;
	var params = (req.body.params ? JSON.parse(req.body.params) : []);

	global.log("truffle_method_sendTransaction called for sessiontoken " + sessionuuid + " method " + methodname + " constractinstanceuuid " + contractinstanceuuid);
	
	var session = Session.getSession(sessionuuid);
	var ethnode = session.getEthereumNode();
	
	var constractinstance = session.getObject(contractinstanceuuid);
	
	var result = ethnode.truffle_method_sendTransaction(constractinstance, methodname, params);

	var jsonresult;
	
	if (result !== null) {
		jsonresult = {status: 1, result: result};
	}
	else {
		jsonresult = {status: 0, error: "could not get result for method " + methodname};
	}
  	
  	res.json(jsonresult);
}


// session
exports.session_authenticate = function(req, res) {
	var sessionuuid = req.get("sessiontoken");
	
	global.log("session_authenticate called for sessiontoken " + sessionuuid);
	
	var username  = req.body.username;
	var password = req.body.password;
	
	var session = Session.getSession(sessionuuid);
	
	var jsonresult;
	
	if (session.authenticate(username, password)) {
		var user = session.getUser();
		
		jsonresult = {status: 1, username: user['name'], private_key: user['private_key'], public_key: user['public_key'], address: user['address']};
	}
	else {
		jsonresult = {status: 0, error: "could not authenticate this session with the provided credentials"};
	}
	
	global.log("session_authenticate response is " + JSON.stringify(jsonresult));
  	
  	res.json(jsonresult);
}

exports.session_getUser = function(req, res) {
	var sessionuuid = req.get("sessiontoken");
	
	global.log("session_authenticate called for sessiontoken " + sessionuuid);
	
	var username  = req.body.username;
	var password = req.body.username;
	
	var session = Session.getSession(sessionuuid);
	
	var jsonresult;
	var user =session.getUser();
	
	if (user) {
		jsonresult = {status: 1, username: user['name'], private_key: user['private_key'], public_key: user['public_key'], address: user['address']};
	}
	else {
		jsonresult = {status: 0, error: "session is anonymous"};
	}
  	
  	res.json(jsonresult);
}



