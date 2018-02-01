/**
 * 
 */
'use strict';

var Global = require('./global.js');

var global = Global.getGlobalInstance();
var web3 = global.getWeb3Instance();

var TruffleContract = require('truffle-contract');

class EthereumNode {
	constructor(session) {
		this.session = session;
	}
	
	//
	// Web3
	//
	web3_getBalance(address) {
		global.log("EthereumNode.web3_getBalance called for " + address);
		var balance;
		
		var finished = false;
		var promise = web3.eth.getBalance(address, function(error, result) {
			
			if (!error) {
				balance = result;
				
				finished = true;
			} else {
				balance = 'error: ' + error;
				
				global.log('Web3 error: ' + error);
				finished = true;

			}
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}

		
		return balance;
	}
	
	
	//
	// Truffle
	//
	truffle_loadArtifact(artifactpath) {
		global.log("EthereumNode.truffle_loadArtifact called for " + artifactpath);
		
		var process = require('process');
		var fs = require('fs');
		var path = require('path');
		
		var dapp_root_dir = global.dapp_root_dir;
		
		var truffle_relative_build_dir = './build';
		
		var build_dir = path.join(dapp_root_dir, truffle_relative_build_dir);
		
		var jsonPath;
		var jsonFile;

		var data;
		
		try {
			jsonPath = path.join(build_dir, artifactpath);

			global.log("reading artifact " + jsonPath);
			
			//jsonFile = fs.readFileSync(jsonPath, 'utf8');
			jsonFile = fs.readFileSync(jsonPath);
			
			data = JSON.parse(jsonFile);
			
		}
		catch(e) {
			console.log('exception reading json file: ' + e.message); 
		}
		
		return data;
	}
	
	truffle_loadContract(artifact) {
		global.log("EthereumNode.truffle_loadContract called");
		//global.log('artifact is ' + artifact);
		var trufflecontract = TruffleContract(artifact);
		  
		var web3provider = global.getWeb3Provider();

		trufflecontract.setProvider(web3provider);
		
		return trufflecontract;
	}
	
	truffle_contract_at(trufflecontract, address) {
		global.log("EthereumNode.truffle_contract_at called for address " + address);
		
		var finished = false;
		var contractinstance = null;

		try {
			trufflecontract.at(address)
				.then(instance=> {
					contractinstance = instance;
					finished = true;
				})				
				.catch(err => {
					finished = true;
				    global.log('catched error in EthereumNode.truffle_contract_at ' + err);
				});
		}
		catch(e) {
			global.log('error in truffle_contract_at(): ' + e);
		}
		
		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}
		
		return contractinstance;
	}

	truffle_contract_new(trufflecontract, params) {
		var finished = false;
		var contractinstance = null;

		try {
			trufflecontract.new(...params)
			.then(instance=> {
				contractinstance = instance;
				finished = true;
			})				
			.catch(err => {
				finished = true;
			    global.log('catched error in EthereumNode.truffle_contract_new ' + err);
			});

		}
		catch(e) {
			global.log('error in truffle_contract_new(): ' + e);
		}
		
		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}
		
		return contractinstance;
	}

	truffle_method_call(constractinstance, methodname, params) {
		var funcname = constractinstance[methodname];
		
		var finished = false;
		var result = null;
		
		var promise = funcname.call(...params).then(function(res){
			
			if (res) {
				result = res;
				
				finished = true;
			} else {
				result = null;
				
				global.log('error: ' + err);
				finished = true;

			}
		}).catch(err => {
			finished = true;
		    global.log('catched error in EthereumNode.truffle_method_call ' + err);
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}

		return result;
	}
	
	truffle_method_sendTransaction(constractinstance, methodname, params) {
		var funcname = constractinstance[methodname];
		
		var finished = false;
		var result = null;
		
		var promise = funcname.sendTransaction(...params).then(function(res){
			
			if (res) {
				result = res;
				
				finished = true;
			} else {
				result = null;
				
				global.log('error: ' + err);
				finished = true;

			}
		}).catch(err => {
			finished = true;
		    global.log('catched error in EthereumNode.truffle_method_sendTransaction ' + err);
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}

		return result;
	}
}

module.exports = EthereumNode;