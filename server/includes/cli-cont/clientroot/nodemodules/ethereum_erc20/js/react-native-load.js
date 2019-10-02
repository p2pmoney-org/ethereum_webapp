'use strict';

console.log('react-native-load.js');


class ReactNativeLoad {
	constructor() {
		this.name = 'reactnativeload';
		
		var glob = global;
		
		
		console.log('ReactNativeLoad constructor');
	}
	
	init(callback) {
		console.log('ReactNativeLoad.init called');
		
		try {
			var self = this;
			
			// bootstrap of framework
			
			// prevent automatic load before we return from import
			window.global_scope_no_load = true;
			window.dapp_browser_no_load = true;

			var _globalscope = global; // nodejs global
			
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
			
			// dapps
			let modulescriptloader = ScriptLoader.findScriptLoader('moduleloader');
			
			// dappmodulesloader
			ScriptLoader.reclaimScriptLoaderName('dappmodulesloader'); // in case another node module used this name
			var dappsscriptloader = modulescriptloader.getChildLoader('dappmodulesloader');

			require('./loaders/dapps-load.js');

			
			
			// end of modules load
			rootscriptloader.registerEventListener('on_dapps_module_load_end', function(eventname) {
				
				var _nodeobject = GlobalClass.getGlobalObject();
				
				_nodeobject.loadModule('dapps', modulescriptloader, function() {
					console.log('dapps loadModule finished')
				});
				
			});
			
			
			// erc20 module ready
			rootscriptloader.registerEventListener('on_erc20_module_ready', function(eventname) {
				
				if (callback)
					callback(null, self);
				
			});

			
			// put in bootstrap window.simplestore now it exists
			/*window.simplestore.ReactNativeLoad = this;


			// load sequence
			var Bootstrap = window.simplestore.Bootstrap;
			var ScriptLoader = window.simplestore.ScriptLoader;
			
			var bootstrapobject = Bootstrap.getBootstrapObject();
			var rootscriptloader = ScriptLoader.getRootScriptLoader();
			
			this._initLoadObjects(bootstrapobject, rootscriptloader);


			//include global object here
			require('./loaders/boot-load.js');
			
			var globalscriptloader = rootscriptloader.getChildLoader('globalloader');
			
			var modulescriptloader = globalscriptloader.getChildLoader('moduleloader');
			modulescriptloader.load_scripts();

			// listen to events
			rootscriptloader.registerEventListener('on_bootstrap_load_end', function(eventname) {
				console.log('ReactNativeLoad: bootstrap files loaded');
			});
				
			rootscriptloader.registerEventListener('on_core_load_end', function(eventname) {
				console.log('ReactNativeLoad: core modules files loaded');
			});
				
			rootscriptloader.registerEventListener('on_global_object_initializing', function(eventname) {
				console.log('ReactNativeLoad: global object is initializing');
			});
				
			rootscriptloader.registerEventListener('on_global_object_ready', function(eventname) {
				console.log('ReactNativeLoad: global object is now ready');
			});
			
			rootscriptloader.registerEventListener('on_dapps_module_load_end', function(eventname) {
				console.log('ReactNativeLoad: dapps module has been loaded');
			});
			

			// xtra config
			require('./loaders/xtra-load.js');
			

			// include all common js files here 
			require('./loaders/core-load.js');

			globalscriptloader.load_scripts();


			// then load libs and modules
			var global = window.simplestore.Global.getGlobalObject();
			
			// libs
			require('./loaders/libs-load.js');
			
			// ethereum
			require('./loaders/ethnode-load.js');
			//require('./loaders/ethchainreader-load.js');
			
			// dapps
			var dappsscriptloader = modulescriptloader.getChildLoader('dappmodulesloader');

			require('./loaders/dapps-load.js');

			dappsscriptloader.load_scripts();
			
			
			//  finalize intialization
			global.finalizeGlobalScopeInit(function(res) {
				console.log("ReactNativeLoad finished initialization of GlobalScope");
				if (callback) callback(null, self);
			});*/
			
		}
		catch(e) {
			console.log('exception in ReactNativeLoad.init: ' + e);
			console.log(e.stack);
		}
		
		this._checkLoad();
		
	}
	
	_initLoadObjects(bootstrapobject, rootscriptloader) {
		rootscriptloader.imported_script_files = [];
		
		rootscriptloader.push_import = function(scriptloader, scriptfile) {
			
			if (scriptloader) 
				scriptloader.push_script(scriptfile);
			
			rootscriptloader.imported_script_files.push(scriptfile);
		}
	}
	
	_checkLoad() {
		var Bootstrap = window.simplestore.Bootstrap;
		var ScriptLoader = window.simplestore.ScriptLoader;
		
		var bootstrapobject = Bootstrap.getBootstrapObject();
		var rootscriptloader = ScriptLoader.getRootScriptLoader();
		
		var imported_script_files = rootscriptloader.imported_script_files;

		for (var i = 0; i < imported_script_files.length; i++) {
			console.log('script file has been imported: ' + imported_script_files[i]);
		}
		
		// get list of scripts that have been pushed
		var fillPushed = function(scriptfilearray, scriptloader) {
			var scripts = scriptloader.scripts;
			
			for (var k = 0; k < scripts.length; k++) {
				var scriptfile = scripts[k].file;
				
				if (scriptfilearray.indexOf(scriptfile) === -1)
					scriptfilearray.push(scriptfile);
			}
		};
		
		var pushed_script_files = [];
		
		var scriptloaders = ScriptLoader.getScriptLoaders();
		
		
		for (var j = 0; j < scriptloaders.length; j++) {
			var scriptloader = scriptloaders[j];
			fillPushed(pushed_script_files, scriptloader);
		}
		
		// check if we have imported all of them
		var missing_script_files = [];
		
		for (var i = 0; i < pushed_script_files.length; i++) {
			var scriptfile = pushed_script_files[i];
			
			if (imported_script_files.indexOf(scriptfile) === -1) {
				missing_script_files.push(scriptfile);
			}
		}
		
		for (var i = 0; i < missing_script_files.length; i++) {
			var scriptfile = missing_script_files[i];
			
			console.log('script file has NOT been imported: ' + scriptfile);
		}
	}

	

}

module.exports = ReactNativeLoad;