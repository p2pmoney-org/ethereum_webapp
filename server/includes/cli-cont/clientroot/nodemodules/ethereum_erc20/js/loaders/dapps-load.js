console.log('dapps-load.js');

var Bootstrap = window.simplestore.Bootstrap;
var ScriptLoader = window.simplestore.ScriptLoader;

var bootstrapobject = Bootstrap.getBootstrapObject();
var rootscriptloader = ScriptLoader.getRootScriptLoader();

var modulescriptloader = ScriptLoader.findScriptLoader('moduleloader');

var dappsscriptloader = ScriptLoader.findScriptLoader('dappmodulesloader');


rootscriptloader.push_import(dappsscriptloader,'../../imports/dapps/module.js');
import '../../imports/dapps/module.js';

var modulescriptloader = dappsscriptloader.getChildLoader('erc20dapploader-2');

rootscriptloader.push_import(dappsscriptloader,'../../imports/dapps/erc20/module.js');
import '../../imports/dapps/erc20/module.js';

rootscriptloader.push_import(dappsscriptloader,'../../imports/dapps/erc20/includes/module.js');
import '../../imports/dapps/erc20/includes/module.js';

rootscriptloader.push_import(dappsscriptloader,'../../imports/dapps/erc20/includes/control/controllers.js');
import '../../imports/dapps/erc20/includes/control/controllers.js';

rootscriptloader.push_import(dappsscriptloader,'../../imports/dapps/erc20/includes/model/erc20token.js');
import '../../imports/dapps/erc20/includes/model/erc20token.js';
rootscriptloader.push_import(dappsscriptloader,'../../imports/dapps/erc20/includes/model/interface/erc20token-contractinterface.js');
import '../../imports/dapps/erc20/includes/model/interface/erc20token-contractinterface.js';
rootscriptloader.push_import(dappsscriptloader,'../../imports/dapps/erc20/includes/model/interface/erc20token-localpersistor.js');
import '../../imports/dapps/erc20/includes/model/interface/erc20token-localpersistor.js';

dappsscriptloader.load_scripts(function() {
	rootscriptloader.signalEvent('on_dapps_module_load_end');
});


