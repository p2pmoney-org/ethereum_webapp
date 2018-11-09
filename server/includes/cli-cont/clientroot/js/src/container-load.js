class ContainerLoad {
	constructor(clientglobalscope) {
		this.clientglobalscope = clientglobalscope;
	}
	
	load() {
		var rootscriptloader = this.clientglobalscope.ScriptLoader.getScriptLoader('rootloader');


		//libs
		var libscriptloader = rootscriptloader.getChildLoader('libloader');

		// interfaces to abstract the previous libs
		libscriptloader.push_script('./includes/interface/ethereum-node-access.js');
		libscriptloader.push_script('./includes/interface/account-encryption.js');
		libscriptloader.push_script('./includes/interface/cryptokey-encryption.js');
		libscriptloader.push_script('./includes/interface/storage-access.js');


		//perform load
		libscriptloader.load_scripts();

		//modules
		var modulescriptloader = libscriptloader.getChildLoader('moduleloader');

		// common
		modulescriptloader.push_script('./includes/modules/common/module.js');
		
		//chain reader
		//modulescriptloader.push_script('./includes/modules/chainreader/module.js');

		//noticebook
		//modulescriptloader.push_script('/includes/modules/noticebook/module.js');

		//perform load
		modulescriptloader.load_scripts();

	}
}

module.exports = ContainerLoad;