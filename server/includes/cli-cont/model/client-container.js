/**
 * 
 */
'use strict';


class ClientContainer {
	constructor(clientglobalscope, containerserver) {
		this.clientglobalscope = clientglobalscope;
		this.containerserver = containerserver;
		
		this.containerid = clientglobalscope.scopeid;
		
		containerserver.log('Creating client container with scope id ' + this.getClientScopeId());
		
		this.scriptloadermap = Object.create(null);
		
		var ScriptLoader = require('./scriptloader.js');
		
		this.ScriptLoader = new ScriptLoader(this); // equivalent of static class
		clientglobalscope.ScriptLoader = this.ScriptLoader;
		
		this.script_code = '\n';
		this.script_code += '/**************************/\n';
		this.script_code += '/* client container script*/\n';
		this.script_code += '/**************************/\n\n\n';

		this.script_code += '\n\n';
		this.script_code += '\console.log(\'GlobalClass.scopeid is \' + GlobalClass.scopeid);\n';
		this.script_code += '\console.log(\'OtherGlobalClass.scopeid is \' + OtherGlobalClass.scopeid);\n';
		this.script_code += '\console.log(\'window.scopeid is \' + window.scopeid);\n';
		this.script_code += '\console.log(\'GlobalObject.scopeid is \' + GlobalClass.getGlobalObject().scopeid);\n';
	}
	
	getServerGlobal() {
		return this.containerserver.global;
	}
	
	getClientGlobal() {
		return this.clientglobalscope;
	}
	
	getClientScopeId() {
		return this.clientglobalscope.scopeid;
	}
	
	getContainerId() {
		return this.containerid;
	}
	
	getModuleObject(modulename) {
		return this.clientglobalscope.getModuleObjec(modulename);
	}
	
	addScript(filepath) {
		this.script_code += '\n';
		
		this.script_code += this.containerserver.loadFile(filepath);
	}
	
	load() {
		var ContainerLoad = this.containerserver.require_js_script('container-load.js');
		var containerload = new ContainerLoad(this.clientglobalscope);
		
		var script_code = containerload.loadScript();
		
		this._execute(script_code);
	}
	
	_execute(script_code) {
		try {
			// var specify global context for eval execution
			
			// window equivalent to work in a browser
			var window = this.clientglobalscope;
			
			var GlobalClass = this.GlobalClass;
			var OtherGlobalClass = this.GlobalClass;
			
			var Web3 = require('web3');
			//var TruffleContract = require('truffle-contract');
			
			var keythereum = require('keythereum');
			
			var ethereumjs;
			
			ethereumjs = require('ethereum.js');
			ethereumjs.Util = require('ethereumjs-util');
			ethereumjs.Wallet = require('ethereumjs-wallet');
			
			window.ethereumjs = ethereumjs; // because of account-encryption.js
			
			//var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
			//var xhr = new XMLHttpRequest();
			
			// execute compiled script
			//this.containerserver.log('***************************************************\n');
			//this.containerserver.log('script is: \n\n' + script_code + '\n\nEnd of script\n\n');
			this.containerserver.log('***************************************************');
			this.containerserver.log('BEGIN EVAL SCRIPT\n');
			
			var result = eval(script_code + '\n\n/* container ' +  this.containerid + '*/\n\n');
			
			this.containerserver.log('END EVAL SCRIPT\n');
			this.containerserver.log('***************************************************');
			
		}
		catch(e) {
			this.containerserver.log("exception in client container during execution of script: " + e);
		}
	}
	
	runScript(filepath) {
		var script_code = this.containerserver.loadFile(filepath);;
		
		this.containerserver.log('***************************************************');
		this.containerserver.log('runScript: ' + filepath);

		this._execute(script_code);
	}
	
	run() {
		
		// close script
		this.script_code += '\n\n';
		this.script_code += 'console.log(\'client container script finished executing\');\n';

		this.script_code += '\n';
		this.script_code += '/*********************************/\n';
		this.script_code += '/* end of client container script*/\n';
		this.script_code += '/*********************************/\n\n\n';

		this.containerserver.log('**************************************************************************************');
		this.containerserver.log('CLIENT CONTAINER CODE:');
		this.containerserver.log(this.script_code);
		this.containerserver.log('**************************************************************************************');
		
		this._execute(this.script_code);
	}
	
	getModuleObject(modulename) {
		var moduleobj = this.clientglobalscope.getModuleObject(modulename);
		
		return moduleobj;
	}
	
}


module.exports = ClientContainer;
