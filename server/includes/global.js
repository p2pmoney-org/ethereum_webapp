/**
 * 
 */
'use strict';

var GlobalInstance;
//var GlobalWeb3;


class Global {
	
	constructor() {
		var process = require('process');
		var fs = require('fs');
		var path = require('path');
		
		this.execution_dir = (process.env.root_dir ? process.env.root_dir :  path.join(__dirname, '../..'));
		
		// log file
		this.logPath = null;
		
		try {
			var logPath = path.join(this.execution_dir, './logs', 'server.log');
		
			if (fs.existsSync(logPath)) {
				this.logPath = logPath;
			}	
			
		}
		catch(e) {
			this.log('exception checking log file: ' + e.message); 
		}

		// command line arguments
		this.commandline = process.argv;
		this.options = [];
		
		if (this.commandline) {
			
			for (var i = 0, len=this.commandline.length; i < len; i++) {
				var command = this.commandline[i];
				
				if (command.startsWith('--conf=')) {
					this.options['jsonfile'] = command.split('=')[1];
					this.options.push(command);
				}
			}
		}
		
		// json config file
		var jsonFileName;
		var jsonPath;
		var jsonFile;
		this.config = null;
		
		try {
			jsonFileName = (this.options['jsonfile'] !== undefined ? this.options['jsonfile'] : 'config.json');
			jsonPath = path.join(this.execution_dir, './settings', jsonFileName);
			jsonFile = fs.readFileSync(jsonPath, 'utf8');
			this.config = JSON.parse(jsonFile);
			
		}
		catch(e) {
			this.log('exception reading json file: ' + e.message); 
		}
		
		var config = this.config;
		
		this.service_name = (config && config["service_name"] ? config["service_name"] : 'ethereum_securities_webapp');
		this.server_listening_port = (config && config["server_listening_port"] ? config["server_listening_port"] : 8000);
		this.route_root_path = (config && config["route_root_path"] ? config["route_root_path"] : '/api');
		
		this.web3_provider_url = (config && config["web3_provider_url"] ? config["web3_provider_url"] : 'http://localhost');
		this.web3_provider_port= (config && config["web3_provider_port"] ? config["web3_provider_port"] : '8545');

		this.dapp_root_dir = (config && config["dapp_root_dir"] ? config["dapp_root_dir"] : null);
		
		// logging
		this.enable_log = (config && config["enable_log"] ? config["enable_log"] : 1);
		this.write_to_log_file = (config && config["write_to_log_file"] ? config["write_to_log_file"] : 0);
		
		
		// user database (json file)
		this.users = {};
		
		try {
			jsonFileName = 'users.json';
			jsonPath = path.join(this.execution_dir, './settings', jsonFileName);
			jsonFile = fs.readFileSync(jsonPath, 'utf8');
			this.users = JSON.parse(jsonFile);
			
		}
		catch(e) {
			this.log('exception reading json file: ' + e.message); 
		}
		
		
		// 
		// operation members
		//

	
		// web3
		this.web3instance = null;
	}
	
	initServer() {
		this.log("Initializing server environment");
		
		// copy files to standard dapp
		this.copyDappFiles();
		
	}
	
	processText(text) {
		var config = this.config;
		
	    // Create regex using the keys of the replacement object.
	    var regex = new RegExp(':(' + Object.keys(config).join('|') + ')', 'g');

	    // Replace the string by the value in object
	    return text.replace(regex, (m, $1) => config[$1] || m);
	}
	
	copyfile(fs, path, sourcepath, destdir) {
		var self = this;
		var global = this;
		
		this.log("copying file " + sourcepath);
		this.log("to directory " + destdir);
		
		//gets file name and adds it to destdir
		var filename = path.basename(sourcepath);
		
		// check destdir exists
		if (!fs.existsSync(destdir)) {
			fs.mkdirSync(destdir); // good for one level down
		}		
		
		var destpath = path.resolve(destdir, filename);
		
		/*var source = fs.createReadStream(sourcepath);
		var dest = fs.createWriteStream(path.resolve(destdir, filename));

		source.pipe(dest);
		source.on('end', function() { global.log(filename + ' succesfully copied'); });
		source.on('error', function(err) { global.log(err); });*/
		
		fs.readFile(sourcepath, 'utf8', function(err, data) {
			if (err) throw err;
			  
			if (data) {
				// process data to replace placeholders
				data = self.processText(data);
				  
				// then copy to dest
				fs.writeFile(destpath, data, (err) => {  
					if (err) throw err;

					global.log(filename + ' succesfully copied');
				});				  
			}
		});
	}
	
	copyDappFiles() {
		var fs = require('fs');
		var path = require('path');
		
		var sourcepath;
		var destdir;
		
		// replace xtr-config.js
		sourcepath = this.execution_dir + '/dapp/js/src/xtra/xtra-config.js';
		destdir = this.dapp_root_dir + '/app/js/src/xtra';
		
		this.copyfile(fs, path, sourcepath, destdir);
		
		// add ethereum-node-access.js
		sourcepath = this.execution_dir + '/dapp/js/src/xtra/lib/ethereum-node-access.js';
		destdir = this.dapp_root_dir + '/app/js/src/xtra/lib';
		
		this.copyfile(fs, path, sourcepath, destdir);
	}

	getWeb3ProviderFullUrl() {
		return this.web3_provider_url + ':' + this.web3_provider_port;
	};
	
	getWeb3Provider() {
		var Web3 = require('web3');

		var web3providerfullurl = this.getWeb3ProviderFullUrl();
		
		var web3Provider =   new Web3.providers.HttpProvider(web3providerfullurl);
		
		return web3Provider;
	}
	
	getWeb3Instance() {
		if (this.web3instance)
			return this.web3instance;
		
		var Web3 = require('web3');

		var web3Provider = this.getWeb3Provider();
		  
		this.web3instance = new Web3(web3Provider);		
		
		this.log("web3 instance created");
		
		return this.web3instance;
	}
	

	
	log(string) {
		if (this.enable_log == 0)
			return; // logging to console disabled
		
		var line = new Date().toISOString() + ": ";
		
		line += string;
		
		console.log(line);
		
		if ( (this.write_to_log_file != 0)  && (this.logPath != null )) {
			var fs = require('fs');

			// also write line in log/server.log
			fs.appendFileSync(this.logPath, line + '\r');
		}
	}
	
	static getGlobalInstance() {
		if (!GlobalInstance)
			GlobalInstance = new Global();
		
		return GlobalInstance;
	}
}

module.exports = Global;
