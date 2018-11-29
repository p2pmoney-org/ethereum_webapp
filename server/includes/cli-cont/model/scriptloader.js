'use strict';

var scriptloadermap = Object.create(null);

class ScriptLoader {
	
	constructor(clientcontainer) {
		this.clientcontainer = clientcontainer;
		
		this.loadername = null;
		this.parentloader = null;
		
		this.scripts = [];
		
		this.loadfinished = false;
	}
	
	_getServerGlobal() {
		return this.clientcontainer.getServerGlobal();
	}
	
	_getClientGlobal() {
		return this.clientcontainer.getClientGlobal();
	}
	
	
	load_scripts(callback) {
		var serverglobal = this._getServerGlobal();
		
		serverglobal.log('load of all scripts requested for scriptloader ' + (this.loadername ? this.loadername : 'with no name'));
		
		var clientcontainer = this.clientcontainer;
		
		for (var i = 0; i < this.scripts.length; i++) {
			var entry = this.scripts[i];
			var file = entry['file'];
			var posttreatment = entry['posttreatment'];
			
			//clientcontainer.addScript(file);
			clientcontainer.runScript(file);
			
			if (posttreatment)
				posttreatment();
		}
		
		if (callback)
			callback();
		
	}
	
	push_script(file, posttreatment) {
		var entry = [];
		
		entry['file'] = file;
		entry['posttreatment'] = posttreatment;
		
		this.scripts.push(entry);
	}
	
	getChildLoader(loadername) {
		var clientcontainer = this.clientcontainer;
		
		return clientcontainer.ScriptLoader.getScriptLoader(loadername, this);
	}
	
	// static in the browser
	getScriptLoader(loadername, parentloader) {
		if (!loadername)
			throw 'script loaders need to have a name';
		
		var clientcontainer = this.clientcontainer;
		
		if (!clientcontainer.ScriptLoader) {
			var scopeid = (clientcontainer.getClientScopeId ? clientcontainer.getClientScopeId() : 'unknown');
			var containertype = clientcontainer.constructor.name;
			
			var error = 'client container with scope id ' + scopeid + ' is not ready!'
			error += ' - type of clientcontainer is ' + containertype;
			
			try {
		        throw new Error();
		    } catch(e) {
		    	error += e.stack;
		    }
		    
			throw error;
		}
		
		if (clientcontainer.ScriptLoader.findScriptLoader(loadername))
			throw 'script loader ' + loadername + ' exists already, create under another name or use findScriptLoader to retrieve it';
		
		
		console.log('creating ScriptLoader ' + loadername + (parentloader ? ' with parent ' + parentloader.loadername : ' with no parent'));
		var scriptloader = new ScriptLoader(this.clientcontainer);
		
		scriptloader.loadername = loadername;
		scriptloader.parentloader = parentloader;
		
		// put in the map
		var scriptloadermap = this.clientcontainer.scriptloadermap;
		
		scriptloadermap[loadername] = scriptloader;
		
		return scriptloader;
	}
	
	findScriptLoader(loadername) {
		var scriptloadermap = this.clientcontainer.scriptloadermap;

		if (scriptloadermap[loadername])
			return scriptloadermap[loadername];
	}
	
}

module.exports = ScriptLoader;