console.log('ethchainreader-load.js');

var Bootstrap = window.simplestore.Bootstrap;
var ScriptLoader = window.simplestore.ScriptLoader;

var bootstrapobject = Bootstrap.getBootstrapObject();
var rootscriptloader = ScriptLoader.getRootScriptLoader();


var modulescriptloader = ScriptLoader.findScriptLoader('moduleloader');

var ethreadermodulescriptloader = modulescriptloader.getChildLoader('ethchainreaderloader');

rootscriptloader.push_import(ethreadermodulescriptloader,'../../imports/js/src/xtra/modules/ethchainreader/module.js');
import  '../../imports/js/src/xtra/modules/ethchainreader/module.js';

ethreadermodulescriptloader.load_scripts();
