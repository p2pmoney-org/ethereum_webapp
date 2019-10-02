'use strict';

console.log('react-native-load.js');


class NodeLoad {
	constructor() {
		this.name = 'nodeload';
	}
	
	init(callback) {
		console.log('NodeLoad.init called');
		
		var self = this;
		var _globalscope = global; // nodejs global
		var _noderequire = require; // to avoid problems when react-native processes files
		
		// get ethereum_core
		var Ethereum_core = require('../../ethereum_core');
		var ethereum_core = Ethereum_core.getObject();
		
		if (ethereum_core.initialized === false) {
			console.log('WARNING: ethereum_core should be initialized before initializing ethereum_erc20');
		}
		
		// get node module objects
		var Bootstrap = _globalscope.simplestore.Bootstrap;
		var ScriptLoader = _globalscope.simplestore.ScriptLoader;

		var bootstrapobject = Bootstrap.getBootstrapObject();
		var rootscriptloader = ScriptLoader.getRootScriptLoader();
		
		var GlobalClass = _globalscope.simplestore.Global;

		// loading dapps
		let modulescriptloader = ScriptLoader.findScriptLoader('moduleloader');
		
		let erc20modulescriptloader = modulescriptloader.getChildLoader('erc20moduleloader');
		
		// setting script root dir to this node module
		// instead of ethereum_core/imports
		var path = _noderequire('path');
		var script_root_dir = path.join(__dirname, '../imports');
		erc20modulescriptloader.setScriptRootDir(script_root_dir);
		
		
		//modulescriptloader.setScriptRootDir(script_root_dir); // because erc20 uses modulescriptloader instead of erc20modulescriptloader

		// dappmodulesloader
		ScriptLoader.reclaimScriptLoaderName('dappmodulesloader'); // in case another node module used this name
		let dappsscriptloader = erc20modulescriptloader.getChildLoader('dappmodulesloader');
		
		// let /dapps/module push scripts in 'dappmodulesloader' then load them
		erc20modulescriptloader.push_script('./dapps/module.js', function () {
			console.log('dapps module loaded');
		});
		
		erc20modulescriptloader.load_scripts(function () {
			var _nodeobject = GlobalClass.getGlobalObject();
			
			// loading dapps pushed in 'dappmodulesloader'
			dappsscriptloader.load_scripts(function() {
				
				_nodeobject.loadModule('dapps', erc20modulescriptloader, function() {
					rootscriptloader.signalEvent('on_dapps_module_load_end');
					
				});
				
			});
		});
		
		// end of modules load
		rootscriptloader.registerEventListener('on_erc20_module_ready', function(eventname) {
			if (callback)
				callback(null, self);
		});

		
	}
		
}


module.exports = NodeLoad;




