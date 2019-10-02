console.log('core-load.js');

var Bootstrap = window.simplestore.Bootstrap;
var ScriptLoader = window.simplestore.ScriptLoader;

var bootstrapobject = Bootstrap.getBootstrapObject();
var rootscriptloader = ScriptLoader.getRootScriptLoader();

var globalscriptloader = ScriptLoader.findScriptLoader('globalloader');

globalscriptloader.push_script('../../imports/js/src/config.js');
import '../../imports/js/src/config.js';

globalscriptloader.push_script('../../imports/js/src/constants.js', function() {
	var Constants = window.simplestore.Constants;
	Constants.push('lifecycle', {eventname: 'app start', time: Date.now()});
});
import '../../imports/js/src/constants.js';


//perform load
globalscriptloader.load_scripts();



// core load
var corescriptloader = rootscriptloader.getChildLoader('coreloader');

rootscriptloader.push_import(corescriptloader,'../../imports/includes/interface/cryptokey-encryption.js');
import '../../imports/includes/interface/cryptokey-encryption.js';

// external libraries for crypto
var cryptomodulescriptloader = corescriptloader.getChildLoader('cryptokeyencryptionmoduleloader-2');

rootscriptloader.push_import(cryptomodulescriptloader, '../../imports/includes/lib/ethereumjs-all-2017-10-31.min.js');
//import '../../imports/includes/lib/ethereumjs-all-2017-10-31.min.js';
var ethereumjs;

/*ethereumjs = require('ethereum.js');
ethereumjs.Util = require('ethereumjs-util');
ethereumjs.Wallet = require('ethereumjs-wallet');
ethereumjs.tx = require('ethereumjs-tx');

window.ethereumjs = ethereumjs;*/

rootscriptloader.push_import(cryptomodulescriptloader, '../../imports/includes/lib/keythereum.min-1.0.2.js');
import '../../imports/includes/lib/keythereum.min-1.0.2.js';

rootscriptloader.push_import(cryptomodulescriptloader, '../../includes/lib/bitcore.min-0.11.7.x.js');
import '../../includes/lib/bitcore.min-0.11.7.x.js';

rootscriptloader.push_import(cryptomodulescriptloader, '../../includes/lib/bitcore-ecies.min-0.9.2.x.js');
import '../../includes/lib/bitcore-ecies.min-0.9.2.x.js';


// duplicate window reference to window.simplestore
window.simplestore.ethereumjs = window.ethereumjs;

window.simplestore.keythereum = window.keythereum;

window.simplestore.bitcore = window.bitcore;
window.simplestore.bitcore_ecies = window.bitcore_ecies;


cryptomodulescriptloader.load_scripts();

// interfaces to access external services (crypto and storage)
rootscriptloader.push_import(corescriptloader,'../../imports/includes/interface/account-encryption.js');
import '../../imports/includes/interface/account-encryption.js';

rootscriptloader.push_import(corescriptloader,'../../imports/includes/interface/cryptokey-encryption.js');
import '../../imports/includes/interface/cryptokey-encryption.js';

rootscriptloader.push_import(corescriptloader,'../../imports/includes/interface/storage-access.js');
import '../../imports/includes/interface/storage-access.js';

//common module object (here to be coherent with browser load sequence)
rootscriptloader.push_import(corescriptloader,'../../imports/includes/modules/common/module.js');
import '../../imports/includes/modules/common/module.js';


corescriptloader.load_scripts(function () {
	// signal end of core framework load
	rootscriptloader.signalEvent('on_core_load_end');	
});





// common module
var commonmodulescriptloader = globalscriptloader.getChildLoader('commonmoduleloader-2');

rootscriptloader.push_import(commonmodulescriptloader, '../../imports/includes/modules/common/control/controllers.js');
import '../../imports/includes/modules/common/control/controllers.js';

rootscriptloader.push_import(commonmodulescriptloader, '../../imports/includes/modules/common/model/localstorage.js');
import '../../imports/includes/modules/common/model/localstorage.js';

rootscriptloader.push_import(commonmodulescriptloader, '../../imports/includes/modules/common/model/restconnection.js');
import '../../imports/includes/modules/common/model/restconnection.js';

rootscriptloader.push_import(commonmodulescriptloader, '../../imports/includes/modules/common/model/cryptokey.js');
import '../../imports/includes/modules/common/model/cryptokey.js';

rootscriptloader.push_import(commonmodulescriptloader, '../../imports/includes/modules/common/model/account.js');
import '../../imports/includes/modules/common/model/account.js';

rootscriptloader.push_import(commonmodulescriptloader, '../../imports/includes/modules/common/model/user.js');
import '../../imports/includes/modules/common/model/user.js';

rootscriptloader.push_import(commonmodulescriptloader, '../../imports/includes/modules/common/model/session.js'); // should be last
import '../../imports/includes/modules/common/model/session.js';

commonmodulescriptloader.load_scripts();




