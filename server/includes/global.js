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
			var jsonConfigPath = (this.options['jsonfile'] !== undefined ? this.options['jsonfile'] : 'config.json');
			
			if (path.isAbsolute(jsonConfigPath)) {
				this.log("jsonConfigPath is " + jsonConfigPath)
				jsonPath = jsonConfigPath;
			}
			else {
				jsonFileName = (this.options['jsonfile'] !== undefined ? this.options['jsonfile'] : 'config.json');
				jsonPath = path.join(this.execution_dir, './settings', jsonFileName);
				
			}
			
			
			this.config_path = jsonPath;

			jsonFile = fs.readFileSync(jsonPath, 'utf8');
			this.config = JSON.parse(jsonFile);
			
		}
		catch(e) {
			this.log('exception reading json file: ' + e.message); 
		}
		
		//
		// configuration
		//
		var config = this.config;
		
		// logging
		this.enable_log = (config && (typeof config["enable_log"] != 'undefined') ? config["enable_log"] : 1);
		this.write_to_log_file = (config && (typeof config["write_to_log_file"] != 'undefined') ? config["write_to_log_file"] : 0);
		this.can_write_to_log_file = false;
		
		this.logPath = (config && (typeof config["log_path"] != 'undefined') ? config["log_path"] : null);
		
		var bCreateFile = false;

		try {
			if (!this.logPath) {
				var logPath = path.join(this.execution_dir, './logs', 'server.log');
				
				if (fs.existsSync(logPath)) {
					this.logPath = logPath;
					this.can_write_to_log_file = true;
				}	
			}
			else {
				if (this.enable_log && this.write_to_log_file ) {
					if (!fs.existsSync(this.logPath)) {
						bCreateFile = true; // normally never reached because existsSync would throw an error
					}
					else {
						this.can_write_to_log_file = true;
					}
				}
			}
			
			
		}
		catch(e) {
			bCreateFile = true;
			
			if (this.enable_log)
			this.log('exception checking log file: ' + e.message); 
		}
		
		if ( this.logPath && bCreateFile) {
			try {
				// we try to create the log file
				if (this.enable_log) {
					this.log('log file does not exist: ' + this.logPath);
					this.log('creating log file: ' + this.logPath);
					
					this.createfile(this.logPath);
					this.can_write_to_log_file = true;
				}
				
			}
			catch(e) {
				this.write_to_log_file = 0;
				this.log('exception creating log file: ' + e.message); 
			}
		}

		
		// configuration parameters
		this.service_name = (config && (typeof config["service_name"] != 'undefined') ? config["service_name"] : 'ethereum_securities_webapp');
		this.server_listening_port = (config && (typeof config["server_listening_port"] != 'undefined') ? config["server_listening_port"] : 8000);
		this.route_root_path = (config && (typeof config["route_root_path"] != 'undefined') ? config["route_root_path"] : '/api');
		
		this.web3_provider_url = (config && (typeof config["web3_provider_url"] != 'undefined') ? config["web3_provider_url"] : 'http://localhost');
		this.web3_provider_port= (config && (typeof config["web3_provider_port"] != 'undefined') ? config["web3_provider_port"] : '8545');

		this.dapp_root_dir = (config && (typeof config["dapp_root_dir"] != 'undefined') ? config["dapp_root_dir"] : null);
		this.overload_dapp_files = (config && (typeof config["overload_dapp_files"] != 'undefined') ? config["overload_dapp_files"] : 1);
		
		this.webapp_app_dir = (config && (typeof config["webapp_app_dir"] != 'webapp_app_dir') ? config["webapp_app_dir"] : path.join(this.execution_dir, './webapp/app'));
		this.copy_dapp_files = (config && (typeof config["copy_dapp_files"] != 'undefined') ? config["copy_dapp_files"] : 0);

		
		this.mysql_host = (config && (typeof config["mysql_host"] != 'undefined') ? config["mysql_host"] : "localhost");
		this.mysql_port = (config && (typeof config["mysql_port"] != 'undefined') ? config["mysql_port"] : 3306);
		this.mysql_database = (config && (typeof config["mysql_database"] != 'undefined') ? config["mysql_database"] : null);
		this.mysql_username = (config && (typeof config["mysql_username"] != 'undefined') ? config["mysql_username"] : null);
		this.mysql_password = (config && (typeof config["mysql_password"] != 'undefined') ? config["mysql_password"] : null);

		
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
		
		if (this.copy_dapp_files == 1) {
			this.log("Copying DAPP app directory")
			// copy dapp files to webapp dir
			this.copyDappFiles();
		}
		
		if (this.overload_dapp_files == 1) {
			this.log("Overloading DAPP files")
			// copy files to standard dapp
			this.overloadDappFiles();
		}
		
		// instantiate services
		var AuthKeyService = require('../../server/includes/authkey/authkey-service.js');
		var authkeyservice = AuthKeyService.instantiateService(this);
		
	}
	
	getServedDappDirectory() {
		if (this.copy_dapp_files == 1) {
			var path = require('path');

			return path.join(this.webapp_app_dir, '/../');
		}
		else {
			if (this.dapp_root_dir) {
				return this.dapp_root_dir;
			}
			else {
				return this.execution_dir + '/webapp';
			}
		}
	}
	
	processText(text) {
		var config = this.config;
		
	    // Create regex using the keys of the replacement object.
	    var regex = new RegExp(':(' + Object.keys(config).join('|') + ')', 'g');

	    // Replace the string by the value in object
	    return text.replace(regex, (m, $1) => config[$1] || m);
	}
	
	_checkFileExist(fs, filepath) {
		try {
			if (fs.existsSync(filepath))
				return true;
		}
		catch(e) {
		}
		
		// check if it's a link
		try {
			if (fs.readlinkSync(contractslink))
				return true;
		}
		catch(e) {
			
		}
		
		return false;
	}
	
	copyfile(fs, path, sourcepath, destdir) {
		var self = this;
		var global = this;
		
		this.log("copying file " + sourcepath);
		this.log("to directory " + destdir);
		
		//gets file name and adds it to destdir
		var filename = path.basename(sourcepath);
		
		// check destdir exists
		if (!this._checkFileExist(fs, destdir)) {
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
	
	createfile(filepath) {
		var fs = require('fs');
		var path = require('path');
		
		// create directory
		var dirpath = path.dirname(filepath);

		this.createdirectory(dirpath);
		
		// create file
		fs.openSync(filepath, 'w');
	}
	
	createdirectory(dirpath) {
		var shell = require('shelljs');
		shell.mkdir('-p', dirpath);
	}
	
	copydirectory(sourcedir, destdir) {
		var self = this;
		var fs = require('fs');
		
		if (this._checkFileExist(fs, sourcedir)) {
			
			if (!this._checkFileExist(fs, destdir)) {
				this.log('destination directory does not exist: ' + destdir);
				this.log('creating destination directory: ' + destdir);
				this.createdirectory(destdir);
			}
			
			var ncp = require('ncp').ncp;
			var finished = false;
			 
			ncp.limit = 5; 
			 
			self.log('copying all files from ' + sourcedir + ' to '+ destdir);
			
			ncp(sourcedir, destdir, function (err) {
				
				if (err) {
					finished = true;
					return self.log('error while copying dapp directory ' + err);
				}
			 
				finished = true;
				self.log(sourcedir + ' copied in '+ destdir);
			});
			
			// wait to turn into synchronous call
			while(!finished)
			{require('deasync').runLoopOnce();}
			
		}
		else {
			this.log('source directory does not exist: ' + sourcedir);
		}
		
	}
	
	copyDappFiles() {
		var path = require('path');
		var fs = require('fs');
		
		var sourcedir = path.join(this.dapp_root_dir, './app');
		var destdir = this.webapp_app_dir;
		
		this.copydirectory(sourcedir, destdir);
		
		// compiled contracts
		
		// remove copied simlink, if any
		var contractslink =  path.join(this.webapp_app_dir, './contracts');
		if (this._checkFileExist(fs, contractslink) ) {
			fs.unlink(contractslink);
		}
		
		sourcedir = path.join(this.dapp_root_dir, './build');
		destdir = path.join(this.webapp_app_dir, '../build');
		
		this.copydirectory(sourcedir, destdir);
		
	}
	
	overloadDappFiles() {
		var fs = require('fs');
		var path = require('path');
		
		var sourcepath;
		var destdir;
		
		// replace xtr-config.js
		sourcepath = this.execution_dir + '/dapp/js/src/xtra/xtra-config.js';
		destdir = (this.copy_dapp_files ? path.join(this.webapp_app_dir, './js/src/xtra') : path.join(this.dapp_root_dir, './app/js/src/xtra'));
		
		this.copyfile(fs, path, sourcepath, destdir);
		
		// add ethereum-node-access.js
		sourcepath = this.execution_dir + '/dapp/js/src/xtra/lib/ethereum-node-access.js';
		destdir = (this.copy_dapp_files ? path.join(this.webapp_app_dir, './js/src/xtra/lib') : path.join(this.dapp_root_dir, './app/js/src/xtra/lib'));
		
		this.copyfile(fs, path, sourcepath, destdir);
	}

	getWeb3ProviderFullUrl() {
		return this.web3_provider_url + ':' + this.web3_provider_port;
	}
	
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
	
	getMySqlConnection() {
		var MySqlConnection = require('./common/mysqlcon.js')
		
		var sqlcon = new MySqlConnection(this, this.mysql_host, this.mysql_port, this.mysql_database, this.mysql_username, this.mysql_password);
		
		return sqlcon;
	}
	

	
	log(string) {
		if (this.enable_log == 0)
			return; // logging to console disabled
		
		var line = new Date().toISOString() + ": ";
		
		line += string;
		
		console.log(line);
		
		if ( (this.write_to_log_file != 0)  && (this.can_write_to_log_file) && (this.logPath)) {
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
