class ContainerLoad {
	constructor(clientglobalscope) {
		this.clientglobalscope = clientglobalscope;
	}
	
	loadScript() {
		
		this.script_code = "\n";
		this.script_code += "/***************/\n";
		this.script_code += "/*  load script*/\n";
		this.script_code += "/***************/\n\n\n";

		this.script_code += '\console.log(\'starting load script in scopeid: \' + GlobalClass.scopeid);\n';
		this.script_code += "var rootscriptloader = GlobalClass.getGlobalObject().ScriptLoader.getScriptLoader('rootloader');\n\n";


		//libs
		this.script_code += "var libscriptloader = rootscriptloader.getChildLoader('libloader');\n\n";

		// interfaces to abstract the previous libs
		this.script_code += "libscriptloader.push_script('./includes/interface/ethereum-node-access.js');\n\n";
		this.script_code += "libscriptloader.push_script('./includes/interface/account-encryption.js');\n\n";
		this.script_code += "libscriptloader.push_script('./includes/interface/cryptokey-encryption.js');\n\n";
		this.script_code += "libscriptloader.push_script('./includes/interface/storage-access.js');\n\n";


		//perform load
		this.script_code += "libscriptloader.load_scripts();\n\n";

		//modules
		this.script_code += "var modulescriptloader = libscriptloader.getChildLoader('moduleloader');\n\n";

		// common
		this.script_code += "modulescriptloader.push_script('./includes/modules/common/module.js');\n\n";
		
		//chain reader
		//modulescriptloader.push_script('./includes/modules/ethchainreader/module.js');

		//noticebook
		//modulescriptloader.push_script('/includes/modules/noticebook/module.js');

		//perform load
		this.script_code += "modulescriptloader.load_scripts();\n\n";
			
		return this.script_code;

	}
}

module.exports = ContainerLoad;