/**
 * 
 */
'use strict';


class ClientContainerServer {
	constructor(service) {
		this.service = service;
		this.global = service.global;
		
		var path = require('path');
		this.app_root_dir = path.join(__dirname, '../../cli-cont-appdir/');
	}
	
	log(string) {
		var global = this.global;
		
		global.log(string);
	}
	
	loadFile(filepath) {
		var global = this.global;
		
		var fs = require('fs');
		var path = require('path');

		var fullPath;
		var content;
		
		try {
			fullPath = path.join(this.app_root_dir, filepath);
	
			content = fs.readFileSync(fullPath, 'utf8');
		}
		catch(e) {
			global.log('exception reading file: ' + e.message); 
		}
		
		return content;
	}
	
	// client global scope
	_getAllMethods(clss) {
		return Object.getOwnPropertyNames(clss);
	}
	
	_copyClass(original) {
		var copied = function() {};
		
		// statics part
		//Object.setPrototypeOf(copied, original.toString());
		Object.setPrototypeOf(copied, original);
		
		class clone extends original {};
		
		// methods
		
		this.global.log('original = ' + this._getAllMethods(original));
		this.global.log('copied = ' + this._getAllMethods(copied));
		this.global.log('clone = ' + this._getAllMethods(clone));

		return clone;
		
	}
	_copyObject(original) {
		var copied = Object.assign(
			Object.create(
					Object.getPrototypeOf(original)
			),
			original
		);
		return copied;
	}
	
	app_script_fullpath(relativepath) {
		var path = require('path');
		var fullpath = path.join(this.app_root_dir, relativepath);
		return fullpath;
	}
	
	require_app_script(relativepath) {
		var fullpath = this.app_script_fullpath(relativepath);
		return require(this.app_root_dir + relativepath);
	}
	
	js_script_fullpath(relativepath) {
		var path = require('path');
		var fullpath = path.join(__dirname, '../clientroot/js/src/', relativepath);
		return fullpath;
	}
	
	require_js_script(relativepath) {
		var fullpath = this.js_script_fullpath(relativepath);
		return require(fullpath);
	}
	
	getClientContainer(serversession) {
		if (serversession.clientcontainer)
			return serversession.clientcontainer;
		
		// we spawn a new environment from a closure in this function
		var serverglobal = this.global;
		
		serverglobal.log('ClientContainerServer.getClientContainer called for sessionuuid ' + serversession.getSessionUUID());
		
		var finished = false;
		
		// create a copy of Global class
		// and instance global object
		// to put them in the client container
		var GlobalClass = this.require_app_script('./includes/modules/common/global.js');
		var ClientGlobalClass = this._copyClass(GlobalClass);
		var clientglobalscope = new ClientGlobalClass();
		
		var scopeid = Math.floor((1 + Math.random()) * 0x100000000).toString(16).substring(1)
		ClientGlobalClass.scopeid = scopeid;
		clientglobalscope.scopeid = scopeid;
		
		var ClientContainer = require('./client-container.js');
		var clientcontainer = new ClientContainer(clientglobalscope, this);
		
		clientcontainer.GlobalClass = ClientGlobalClass;
		clientcontainer.GlobalObject = clientglobalscope;
		
		ClientGlobalClass.getGlobalObject = function() { return clientglobalscope; };
		
		// fill clientglobalscope
		clientglobalscope.setIsInNodejs(false);
		clientglobalscope.setIsInBrowser(false);
		
		var Config = this.require_js_script('config.js');
		clientglobalscope.Config = Config;
		
		// execute container load
		clientcontainer.load();
		
		// initialize inner global object
		clientglobalscope.finalizeGlobalScopeInit(function(res) {
			serverglobal.log("finished initialization of client GlobalScope for server session " + serversession.getSessionUUID());
			
			finished = true;
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}

		// run
		clientcontainer.run();
		
		// put the container in the server session
		serversession.clientcontainer = clientcontainer;
		

		return clientcontainer;
	}
	
}

module.exports = ClientContainerServer;