/**
 * 
 */
'use strict';

var _deasync = class {
	constructor(global) {
		this.global = global;
		
		this.deasync_module = require('deasync');
	}
	
	runLoopOnce(caller) {
		//this.global.log('_deasync.runLoopOnce' + (caller ? ' type of caller ' + (caller.constructor.name != 'String' ? caller.constructor.name : caller) : ''));
		
		return this.deasync_module.runLoopOnce();
	}
	
	sleep(time, caller) {
		//this.global.log('_deasync.sleep' + (caller ? ' type of caller ' + (caller.constructor.name != 'String' ? caller.constructor.name : caller) : ''));

		return this.deasync_module.sleep(time);
	}
}

var globalinstance;
//var GlobalWeb3;


class Global {
	
	constructor() {
		
		this.globalscope = global; // nodejs global
		
		this.execution_variables_map = Object.create(null);
		
		// overload console.log
		this.overrideConsoleLog();

		// base and execution directories
		var process = require('process');
		var fs = require('fs');
		var path = require('path');
		
		this.base_dir = (Global.ETHEREUM_WEBAPP_BASE_DIR ? Global.ETHEREUM_WEBAPP_BASE_DIR : (process.env.root_dir ? process.env.root_dir :  path.join(__dirname, '../../..')));
		this.execution_dir = (Global.ETHEREUM_WEBAPP_EXEC_DIR ? Global.ETHEREUM_WEBAPP_EXEC_DIR : (process.env.root_dir ? process.env.root_dir :  path.join(__dirname, '../../..')));
		
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
		this.config = {};
		
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
		
		// execution enviroment
		this.server_env = (config && (typeof config["server_env"] != 'undefined') ? config["server_env"] : 'prod');
		this.client_env = (config && (typeof config["client_env"] != 'undefined') ? config["client_env"] : 'prod');
		this.execution_env = this.server_env;
		
		this.sticky_session = (config && (typeof config["sticky_session"] != 'undefined') && (config["sticky_session"] == 0) ? false : true);
		this.session_time_length = (config && (typeof config["session_time_length"] != 'undefined') ? parseInt(config["session_time_length"]) : 2*60*60*1000);
		this.session_obsolence_length = (config && (typeof config["session_obsolence_length"] != 'undefined') ? parseInt(config["session_obsolence_length"]) : 24*60*60*1000);
		
		// logging
		this.enable_log = (config && (typeof config["enable_log"] != 'undefined') ? parseInt(config["enable_log"]) : 1);
		this.write_to_log_file = (config && (typeof config["write_to_log_file"] != 'undefined') ? parseInt(config["write_to_log_file"]) : (this.execution_env != 'dev' ? 0 : 1));
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
		this.service_name = (config && (typeof config["service_name"] != 'undefined') ? config["service_name"] : 'ethereum_webapp');
		this.service_uuid = (config && (typeof config["service_uuid"] != 'undefined') ? config["service_uuid"] : this.guid());
		this.server_listening_port = (config && (typeof config["server_listening_port"] != 'undefined') ? parseInt(config["server_listening_port"]) : 8000);
		this.route_root_path = (config && (typeof config["route_root_path"] != 'undefined') ? config["route_root_path"] : '/api');

		//this.web3_provider_url = (config && (typeof config["web3_provider_url"] != 'undefined') ? config["web3_provider_url"] : 'http://localhost');
		//this.web3_provider_port= (config && (typeof config["web3_provider_port"] != 'undefined') ? config["web3_provider_port"] : '8545');

		
		this.mysql_host = (config && (typeof config["mysql_host"] != 'undefined') ? config["mysql_host"] : "localhost");
		this.mysql_port = (config && (typeof config["mysql_port"] != 'undefined') ? parseInt(config["mysql_port"]) : 3306);
		this.mysql_database = (config && (typeof config["mysql_database"] != 'undefined') ? config["mysql_database"] : null);
		this.mysql_username = (config && (typeof config["mysql_username"] != 'undefined') ? config["mysql_username"] : null);
		this.mysql_password = (config && (typeof config["mysql_password"] != 'undefined') ? config["mysql_password"] : null);
		this.mysql_table_prefix = (config && (typeof config["mysql_table_prefix"] != 'undefined') ? config["mysql_table_prefix"] : null);

		
		
		// 
		// operation members
		//
		
		// services
		this.services = [];
	
		// hooks
		this.hook_arrays = [];

		// deasync mechanism
		this._deasync = null;
	}
	
	initServer() {
		this.log("Initializing server environment");
		
		// register common service
		var Service = require('./service.js');
		this.registerServiceInstance(new Service());
		
		// init services
		this.initServices();
		
		// call hook to let services complete their initialization
		// once all services have been loaded and all hooks have
		// been registered
		var result = [];
		
		var params = [];
		
		params.push(this);

		var ret = this.invokeHooks('postInitServer_hook', result, params); // sync post init

		if (ret && result && result.length) {
			console.log('postInitServer_hook result is ' + JSON.stringify(result));			
		}

		// spawn async post init
		this.invokeAsyncHooks('postInitServer_asynchook', result, params);

	}
	
	initServices() {
		this.loadAllServices();
		
		// ask modules to register hooks
		this.registerServicesHooks();
	}
	
	exit() {
		var process = require('process');

		process.exit(1);		
	}
	
	reload() {
		// dirty exit to restart process
		this.exit();
	}

	async sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	getExecutionGlobalScope() {
		return this.globalscope;
	}
	
	getExecutionEnvironment() {
		return this.execution_env;
	}
	
	setExecutionEnvironment(env) {
		if (!env)
			return;
		
		switch(env) {
			case 'dev':
				this.execution_env = 'dev';
				break;
				
			default:
				break;
		}
	}
	
	getExecutionGlobalScope() {
		return global; // nodejs global
	}
	
	getExecutionVariable(key) {
		if (key in this.execution_variables_map) {
			return this.execution_variables_map[key];
		}
	}
	
	setExecutionVariable(key, value) {
		this.execution_variables_map[key] = value;
	}
	
	areSessionsSticky() {
		return this.sticky_session;
	}
	
	createCacheObject(name) {
		var CacheObject = require('./model/cacheobject.js');
		
		return new CacheObject(this, name);
	}

	getBaseDir() {
		return this.base_dir;
	}

	getExecutionDir() {
		return this.execution_dir;
	}
	
	readJson(jsonname) {
		var fs = require('fs');
		var path = require('path');

		var jsonFileName;
		var jsonPath;
		var jsonFile;
		
		var jsoncontent;
		
		try {
			jsonFileName = jsonname + ".json";
			
			jsonPath = path.join(this.execution_dir, './settings', jsonFileName);
	
	
			jsonFile = fs.readFileSync(jsonPath, 'utf8');
			jsoncontent = JSON.parse(jsonFile);
	
		}
		catch(e) {
			this.log('exception reading json file: ' + e.message); 
		}
		
		return jsoncontent;
	}
	
	saveJson(jsonname, jsoncontent) {
		var bSuccess = false;
		var fs = require('fs');
		var path = require('path');

		var jsonFileName;
		var jsonPath;
		var jsonFile;
		
		var finished = false;
		
		try {
			jsonFileName = jsonname + ".json";
			
			jsonPath = path.join(this.execution_dir, './settings', jsonFileName);
		
			var jsonstring = JSON.stringify(jsoncontent);

			fs.writeFile(jsonPath, jsonstring, 'utf8', function() {
				bSuccess = true;
			
				finished = true;
			});
			
		}
		catch(e) {
			this.log('exception writing json file: ' + e.message); 
			finished = true;
		}
		
		// wait to turn into synchronous call
		while(!finished)
		{this.deasync().runLoopOnce();}

		return bSuccess;
	}

	async saveJsonAsync(jsonname, jsoncontent, bPretty) {
		var bSuccess = false;
		var fs = require('fs');
		var path = require('path');

		var jsonFileName;
		var jsonPath;
		var jsonFile;
		
		try {
			jsonFileName = jsonname + ".json";
			
			jsonPath = path.join(this.execution_dir, './settings', jsonFileName);
		
			var jsonstring = (bPretty === true ? JSON.stringify(jsoncontent, null, 4) : JSON.stringify(jsoncontent));

			await new Promise( (resolve, reject) => {
				fs.writeFile(jsonPath, jsonstring, 'utf8', (err) => {
					if (err)
					reject(err);
					else {
						bSuccess = true;
				
						resolve(true);
					}
				});
			});
				

			
		}
		catch(e) {
			this.log('exception writing json file: ' + e.message); 
		}

		return bSuccess;
	}
	
	readVariableFile(filepath) {
		var fs = require('fs');
		var path = require('path');

		var fileContent;
		
		var array = {};
		
		try {
			
			if (this._checkFileExist(fs, filepath)) {
				fileContent = fs.readFileSync(filepath, 'utf8');
				
				var lines = fileContent.split('\n');
			    
				for (var i = 0; i < lines.length; i++) {
					var line = lines[i];
					
					if ( (!line.startsWith('#')) && (line.indexOf('=') > -1))  {
						var pair = line.split('=');
						
						array[pair[0]] = pair[1];

					}
			    }
				
				
			}
			else {
				this.log('file does not exist: ' + filepath);
			}
	
		}
		catch(e) {
			this.log('exception reading variable file: ' + e.message); 
		}
		
		return array;
	}
	
	_processedvalue(value) {
		var objectConstructor = {}.constructor;
		
		if (value && value.constructor === objectConstructor)
			return JSON.stringify(value);
		else
			return value.toString();
	}
	
	processText(text) {
		var config = this.config;
		
	    // Create regex using the keys of the replacement object.
	    var regex = new RegExp(':(' + Object.keys(config).join('|') + ')', 'g');

	    // Replace the string by the value in object
	    return text.replace(regex, (m, $1) => this._processedvalue(config[$1]) || m);
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
		
		//this.log("copying file " + sourcepath);
		//this.log("to directory " + destdir);
		
		//gets file name and adds it to destdir
		var filename = path.basename(sourcepath);
		
		// check destdir exists
		if (!this._checkFileExist(fs, destdir)) {
			fs.mkdirSync(destdir); // good for one level down
		}		
		
		var destpath = path.resolve(destdir, filename);
		
		fs.readFile(sourcepath, 'utf8', function(err, data) {
			if (err) throw err;
			  
			if (data) {
				// process data to replace placeholders
				data = self.processText(data);
				  
				// then copy to dest
				fs.writeFile(destpath, data, (err) => {  
					if (err) throw err;

					//self.log(filename + ' succesfully copied');
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
	
	executeCmdLine(cmdline) {
		var child_process = require('child_process');
		var output = false;
		
		var finished = false;
		var self = this;
		self.log('executing command line: ' + cmdline);
		
		var batch = child_process.exec(cmdline, function(error, stdout, stderr){ 
			self.log('stdout is ' + JSON.stringify(stdout));
			output = stdout; 
			finished = true;
		});
		
	    
	    // wait to turn into synchronous call
		while(!finished)
		{this.deasync().runLoopOnce();}

		return output;
	}
	
	async executeCmdLineAsync(cmdline) {
		var child_process = require('child_process');
		var output = false;
		
		var self = this;
		self.log('executing command line: ' + cmdline);

		await new Promise( (resolve, reject) => {
			child_process.exec(cmdline, function(error, stdout, stderr){ 
				self.log('stdout is ' + JSON.stringify(stdout));
				output = stdout; 
				resolve(true);
			});
		});

		return output;
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
			 
			//self.log('copying all files from ' + sourcedir + ' to '+ destdir);
			
			ncp(sourcedir, destdir, function (err) {
				
				if (err) {
					finished = true;
					return self.log('error while copying dapp directory ' + err);
				}
			 
				finished = true;
				//self.log(sourcedir + ' copied in '+ destdir);
			});
			
			// wait to turn into synchronous call
			while(!finished)
			{this.deasync().runLoopOnce();}
			
		}
		else {
			this.log('source directory does not exist: ' + sourcedir);
		}
		
	}

	async copydirectoryAsync(sourcedir, destdir) {
		var self = this;
		var fs = require('fs');
		
		if (this._checkFileExist(fs, sourcedir)) {
			
			if (!this._checkFileExist(fs, destdir)) {
				this.log('destination directory does not exist: ' + destdir);
				this.log('creating destination directory: ' + destdir);
				this.createdirectory(destdir);
			}
			
			var ncp = require('ncp').ncp;
			 
			ncp.limit = 5; 
			 
			//self.log('copying all files from ' + sourcedir + ' to '+ destdir);

			await new Promise( (resolve, reject) => {
				ncp(sourcedir, destdir, function (err) {
				
					if (err) {
						self.log('error while copying dapp directory ' + err);
						resolve(false);
					}
				 
					resolve(true);
					//self.log(sourcedir + ' copied in '+ destdir);
				});
			});
			
			
		}
		else {
			this.log('source directory does not exist: ' + sourcedir);
		}
		
	}
	
	require(module) {
		var process = require('process');
		// set the proper node_module path for module
		//this.log("loading module " + module + " NODE_PATH is " + process.env.NODE_PATH);
		
		if (process.env.NODE_PATH)
			return require(process.env.NODE_PATH + '/' + module);
		else
			return require(module);
	}

	flushMySqlConnectionPool() {
		this.mysqlconnectionpool = [];
	}
	
	async getMySqlConnectionAsync() {
		if (!this.mysqlconnectionpool) {
			this.mysqlconnectionpool = [];
		}
		
		var sqlcon;

		if (this.mysqlconnectionpool.length) {
			// just maintain a pool of one
			// could do round robin on several connections
			sqlcon = this.mysqlconnectionpool[this.mysqlconnectionpool.length - 1];

			let isActive = sqlcon.connectionactive; // no async op here to prevent race condition

			if (isActive) 
			return sqlcon;
			else {
				let isconnecting = sqlcon.isconnecting;
				
				if (isconnecting) {
					// wait for end of connection
					isActive = await sqlcon.isActiveAsync();

					if (isActive)
					return sqlcon;
					else {
						this.log('mysqlconnectionasyncpool element failed to open connection');
						sqlcon = null;
					}
				}
				else {
					// connection is dead
					this.log('flushing mysqlconnectionasyncpool of length: ' + this.mysqlconnectionpool.length);
					this.flushMySqlConnectionPool();
	
					await sqlcon.closeAsync();
					sqlcon = null;
				}
			}
		}
		
		var MySqlConnection = require('./model/mysqlcon.js')
		
		sqlcon = new MySqlConnection(this, this.mysql_host, this.mysql_port, this.mysql_database, this.mysql_username, this.mysql_password);
		
		if (this.mysql_table_prefix)
			sqlcon.setTablePrefix(this.mysql_table_prefix);
		
		this.mysqlconnectionpool.push(sqlcon);
		
		this.log('growing mysqlconnectionasyncpool to ' + this.mysqlconnectionpool.length);
		
		// increment to never end connection
		await sqlcon.openAsync();
		
		return sqlcon;
	}

	getMySqlConnection() {
		if (!this.mysqlconnectionpool) {
			this.mysqlconnectionpool = [];
		}
		
		var sqlcon;

		if (this.mysqlconnectionpool.length) {
			// just maintain a pool of one
			// could do round robin on several connections
			sqlcon = this.mysqlconnectionpool[0];

			let isActive = sqlcon.isActive();

			if (isActive) 
			return sqlcon;
			else {
				this.log('flushing mysqlconnectionpool of length: ' + this.mysqlconnectionpool.length);
				sqlcon.close();
				sqlcon = null;
				this.flushMySqlConnectionPool();
			}
		}
		
		var MySqlConnection = require('./model/mysqlcon.js')
		
		var sqlcon = new MySqlConnection(this, this.mysql_host, this.mysql_port, this.mysql_database, this.mysql_username, this.mysql_password);
		
		if (this.mysql_table_prefix)
			sqlcon.setTablePrefix(this.mysql_table_prefix);
		
		this.mysqlconnectionpool.push(sqlcon);
		
		this.log('growing mysqlconnectionpool to ' + this.mysqlconnectionpool.length);
		
		// increment to never end connection
		sqlcon.open();
		
		return sqlcon;
	}
	
	overrideConsoleLog() {
		if (this.overrideconsolelog == true)
			return;
		
		this.overrideconsolelog = true;
		
		// capture current log function
		this.orgconsolelog = console.log;
		
		var self = this;
		
		console.log = function(message) {
			    self.log(message);
		}; 
	}
	
	releaseConsoleLog() {
		this.overrideconsolelog = false;
		
		console.log = this.orgconsolelog ; 
	}
	
	enableLog(choice) {
		if (choice === true)
			this.enable_log = 1;
		else
			this.enable_log = 0;
	}
	
	log(string) {
		if (((this.enable_log != 10)) && ((this.enable_log == 0) || (this.execution_env != 'dev')))
			return; // logging to console disabled, not force log with 10
		
		var line = new Date().toISOString() + ": ";
		
		line += string;
		
		if (this.overrideconsolelog)
			this.orgconsolelog(line); // we've overloaded console.log
		else
			console.log(line);
		
		if ( (this.write_to_log_file != 0)  && (this.can_write_to_log_file) && (this.logPath)) {
			var fs = require('fs');

			// also write line in log/server.log
			fs.appendFileSync(this.logPath, line + '\r');
		}
	}
	
	log_directory() {
		var path = require('path');
		return path.dirname(this.logPath);
	}
	
	append_to_file(filepath, chunk) {
		var fs = require("fs");
		
		fs.appendFileSync(filepath, chunk);
	}
	
	read_file(filepath) {
		var fs = require("fs");
		var path = require('path');

		var content;
		
		try {

			content = fs.readFileSync(filepath, 'utf8');
	
		}
		catch(e) {
			this.log('exception reading file: ' + e.message); 
		}
		
		return content;
	}

	
	tail_file(filepath, nlines) {
		var fs = require("fs");

		let getLastLines = function (filename, lineCount, callback) {
		  let stream = fs.createReadStream(filename, {
		    flags: "r",
		    encoding: "utf-8",
		    fd: null,
		    mode: 438, // 0666 in Octal
		    bufferSize: 64 * 1024
		  });

		  let data = "";
		  let lines = [];
		  
		  stream.on("data", function (moreData) {
		    data += moreData;
		    
		    let worklines = data.split('\r');
		    
		    let end = worklines.length;
		    let start = (worklines.length - lineCount > 0 ? worklines.length - lineCount : 0);
		    
		    lines = worklines.slice(start, end);
		    
		    data = lines.join('\r');
		  });

		  stream.on("error", function () {
		    callback("Error");
		  });

		  stream.on("end", function () {
		    callback(null, lines);
		  });

		};
		
		var finished = false;
		var result = [];

		getLastLines(filepath, nlines, function (err, lines) {
			if (!err)
				result = lines;
			
			finished = true;
		});		
		
		// wait to turn into synchronous call
		while(!finished)
		{this.deasync().runLoopOnce();}
		
		return result;
	}

	async tail_fileAsync(filepath, nlines) {
		var fs = require("fs");

		let getLastLines = function (filename, lineCount, callback) {
		  let stream = fs.createReadStream(filename, {
		    flags: "r",
		    encoding: "utf-8",
		    fd: null,
		    mode: 438, // 0666 in Octal
		    bufferSize: 64 * 1024
		  });

		  let data = "";
		  let lines = [];
		  
		  stream.on("data", function (moreData) {
		    data += moreData;
		    
		    let worklines = data.split('\r');
		    
		    let end = worklines.length;
		    let start = (worklines.length - lineCount > 0 ? worklines.length - lineCount : 0);
		    
		    lines = worklines.slice(start, end);
		    
		    data = lines.join('\r');
		  });

		  stream.on("error", function () {
		    callback("Error");
		  });

		  stream.on("end", function () {
		    callback(null, lines);
		  });

		};
		
		var result = [];

		await new Promise( (resolve, reject) => {
			getLastLines(filepath, nlines, function (err, lines) {
				if (!err)
					result = lines;
				
				resolve(true);
			});
		});		
		
		return result;
	}

	
	tail_log_file(filename = 'server', nlines = 200) {
		var logPath;
		
		if (filename == 'server')
			logPath = this.logPath;
		else
			logPath = this.log_directory() + '/' + filename + '.log';
		
		var lines = this.tail_file(logPath, nlines);
		
		return lines;
	}

	async tail_log_fileAsync(filename = 'server', nlines = 200) {
		var logPath;
		
		if (filename == 'server')
			logPath = this.logPath;
		else
			logPath = this.log_directory() + '/' + filename + '.log';
		
		var lines = await this.tail_fileAsync(logPath, nlines);
		
		return lines;
	}
	

	
	createTracker(name) {
		var Tracker = class {
			constructor(global, name, uuid) {
				this.global = global;
				this.name = name
				this.uuid = uuid
				this.start = Date.now();
			}
			
			log(string) {
				var global = this.global;

				if (global.execution_env != 'dev')
					return;
				
				var now = Date.now();
				var diff = (now - this.start) + ' ms';
				
				global.log('Step At ' + diff + ' tracker ' + this.uuid + (this.name ? ' - ' + this.name : '') + (string ? ': ' + string : ''));
			}
		}
		
		var uuid = this.guid();
		return new Tracker(this, name, uuid);
	}
	
	async guidAsync() {
		// could be used to look at a incremented seed
		return this.generateUUID(8) + '-' + this.generateUUID(4) + '-' + this.generateUUID(4) + '-' +
		this.generateUUID(4) + '-' + this.generateUUID(12);
	}
	
	guid() {
		  return this.generateUUID(8) + '-' + this.generateUUID(4) + '-' + this.generateUUID(4) + '-' +
		  this.generateUUID(4) + '-' + this.generateUUID(12);
	}
	
	generateUUID(length) {
		function s4() {
		    return Math.floor((1 + Math.random()) * 0x10000)
		      .toString(16)
		      .substring(1);
		  }
		
		var uuid = '';
		
		while (uuid.length < length) {
			uuid += s4();
		}
		
		return uuid.substring(0, length);
	}
	
	formatDate(date, format) {
		var d = date;
		
		switch(format) {
			case 'YYYY-mm-dd HH:MM:SS':
			return d.getFullYear().toString()+"-"
			+((d.getMonth()+1).toString().length==2?(d.getMonth()+1).toString():"0"+(d.getMonth()+1).toString())+"-"
			+(d.getDate().toString().length==2?d.getDate().toString():"0"+d.getDate().toString())+" "
			+(d.getHours().toString().length==2?d.getHours().toString():"0"+d.getHours().toString())+":"
			+(d.getMinutes().toString().length==2?d.getMinutes().toString():"0"+d.getMinutes().toString())+":"
			+(d.getSeconds().toString().length==2?d.getSeconds().toString():"0"+d.getSeconds().toString());
			
			default:
				return date.toString(format);
		}
	}
	
	// deasync
	deasync() {
		console.log('DO NOT USE deasync!!!');
		//debugger;
		// uncomment to track use and rewire calls
		// to async version of methods
		if (this._deasync)
			return this._deasync;
		
		this._deasync = new _deasync(this);
		
		return this._deasync;
	}
	
	// global values
	getConstant(name) {
		var Constants = require('./constants.js');
		
		var val = Constants[name];
		
		return val;
	}
	
	getConfigValue(key) {
		return this.config[key];
	}
	
	setConfigValue(key, value) {
		this.config[key] = value;
	}
	
	getCurrentVersion() {
		//return this.getConstant('CURRENT_VERSION');
		return (this.current_version ? this.current_version : "undefined");
	}
	
	getVersionInfo() {
		var versioninfos = [];
		
		var versioninfo = {};
		
		versioninfo.label = 'ethereum webapp';
		versioninfo.value = this.getCurrentVersion();
		
		versioninfos.push(versioninfo);
		
		// call hook to let services publish
		// their version info if they wish to
		var result = [];
		
		var params = [];
		
		params.push(versioninfos);

		var ret = this.invokeHooks('getVersionInfo_hook', result, params);

		if (ret && result && result.length) {
			console.log('getVersionInfo_hook result is ' + JSON.stringify(result));			
		}
		
		return versioninfos
	}
	
	getVersionSupported() {
		return (this.version_support ? this.version_support : [this.getCurrentVersion()]);
	}
	
	getNetworkConfig() {
		var global = this;
		
		// compute url and path
		
		// main rest (e.g. storage)
		var rest_server_url = global.getConfigValue('rest_server_url');
		var rest_server_api_path = global.getConfigValue('rest_server_api_path');

		// authkey
		var authkey_server_url = global.getConfigValue('authkey_server_url');
		var authkey_server_api_path = global.getConfigValue('authkey_server_api_path');
		
		var auth_server_url = global.getConfigValue('auth_server_url');
		var auth_server_api_path = global.getConfigValue('auth_server_api_path');
		
		var key_server_url = global.getConfigValue('key_server_url');
		var key_server_api_path = global.getConfigValue('key_server_api_path');
		
		
		// auth
		if (!auth_server_url) {
			if (authkey_server_url)
				auth_server_url = authkey_server_url;
			else
				auth_server_url = rest_server_url;
		}
		
		if (!auth_server_api_path) {
			if (authkey_server_api_path)
				auth_server_api_path = authkey_server_api_path;
			else
				auth_server_api_path = rest_server_api_path;
		}

		// key
		if (!key_server_url) {
			if (authkey_server_url)
				key_server_url = authkey_server_url;
			else
				key_server_url = rest_server_url;
		}
		
		if (!key_server_api_path) {
			if (authkey_server_api_path)
				key_server_api_path = authkey_server_api_path;
			else
				key_server_api_path = rest_server_api_path;
		}
		
		// ethnode
		var ethnode_server_url = global.getConfigValue('ethnode_server_url');
		var ethnode_server_api_path = global.getConfigValue('ethnode_server_api_path');
		
		if (!ethnode_server_url)
			ethnode_server_url = rest_server_url;
		
		if (!ethnode_server_api_path)
			ethnode_server_api_path = rest_server_api_path;


		
		// fill network_config
		var network_config = {};
		
		network_config.name = global.getConfigValue('service_name');
		network_config.uuid = global.getConfigValue('service_uuid');
		
		network_config.restserver = {};
		network_config.restserver.activate = true;
		network_config.restserver.rest_server_url = rest_server_url;
		network_config.restserver.rest_server_api_path = rest_server_api_path;
		
		network_config.authserver = {};
		network_config.authserver.activate = true;
		network_config.authserver.rest_server_url = auth_server_url;
		network_config.authserver.rest_server_api_path = auth_server_api_path;
		
		network_config.keyserver = {};
		network_config.keyserver.activate = true;
		network_config.keyserver.rest_server_url = key_server_url;
		network_config.keyserver.rest_server_api_path = key_server_api_path;
		
		
		// invoke hook to let services put their config
		var result = [];
		
		var params = [];
		
		params.push(network_config);

		var ret = global.invokeHooks('config_network_hook', result, params);
		
		return network_config;
	}
	
	// services
	getServiceInstance(servicename) {
		if (!servicename)
		return;
		
		return (this.services[servicename] ? this.services[servicename] : null);
	}
	
	registerServiceInstance(service) {
		console.log('Global.registerServiceInstance called for ' + (service ? service.name : 'invalid'));
		
		if (!service)
			throw 'passed a null value to registerServiceInstance';
		
		if (!service.name)
			throw 'service needs to have a name property';
		
		if ((!service.loadService) || (typeof service.loadService != 'function'))
			throw 'service needs to have a loadService function';
		
		this.services[service.name] = service; // for direct access by name in getServiceInstance
		this.services.push(service); //for iteration on the array
		
		// we set global property
		service.global = this;
	}
	
	getClass() {
		return Global;
	}
	
	loadAllServices() {
		console.log('Global.loadAllServices called');
				
		for (var i=0; i < this.services.length; i++) {
			var service = this.services[i];
			
			service.loadService();
		}
		
		return true;
	}
	
	//
	// hooks mechanism
	//
	registerServicesHooks() {
		console.log('Global.registerServicesHooks called');
		
		// call registerHooks function for all services if functions exists
		for (var i=0; i < this.services.length; i++) {
			var service = this.services[i];
			
			if (service.registerHooks)
				service.registerHooks();
		}
	}
	
	getHookArray(hookentry) {
		var entry = hookentry.toString();
		
		if (!this.hook_arrays[hookentry])
			this.hook_arrays[hookentry] = [];
			
		return this.hook_arrays[hookentry];
	}
	
	_findServiceHookEntry(hookentry, servicename) {
		var hookarray = this.getHookArray(hookentry);
		
		if (!hookarray)
			return;
		
		for (var i=0; i < hookarray.length; i++) {
			var entry = hookarray[i];
			var __servicename = entry['servicename'];
			
			if (__servicename == servicename)
				return entry;
		}		
	}
	
	_sortHookEntryArray(hookentry) {
		var hookarray = this.getHookArray(hookentry);
		
		if (!hookarray)
			return;
		
		// sort descending order
		hookarray.sort(function(entrya,entryb) {return (entryb['priority'] - entrya['priority']);});
		
	}
	
	registerHook(hookentry, servicename, hookfunction) {
		var hookarray = this.getHookArray(hookentry);
		
		if (typeof hookfunction === "function") {
			var hookfunctionname = hookfunction.toString();
			var entry = [];
			var bAddEntry = true;
			
			if (typeof this._findServiceHookEntry(hookentry, servicename)  !== 'undefined') {
				// overload existing entry
				console.log('overloading hook '+ hookentry + ' for ' + servicename);

				entry = this._findServiceHookEntry(hookentry, servicename);
				bAddEntry = false;
			}
			
			entry['servicename'] = servicename;
			entry['functionname'] = hookfunctionname;
			entry['function'] = hookfunction;
			entry['priority'] = 0; // default
			
			//console.log('registering hook '+ hookentry + ' for ' + servicename);
			
			if (bAddEntry) {
				console.log('registering hook '+ hookentry + ' for ' + servicename);
				
				hookarray.push(entry);
			}
			
			// sort array
			this._sortHookEntryArray(hookentry)
		}
	}
	
	modifyHookPriority(hookentry, servicename, priority) {
		
		if (!Number.isInteger(priority))
			return;
		
		var entry = this._findServiceHookEntry(hookentry, servicename);
		
		if (entry) {
			entry['priority'] = priority;
			
			// sort array
			this._sortHookEntryArray(hookentry)
		}
		
	}
	
	invokeHooks(hookentry, result, inputparams) {
		console.log('Global.invokeHooks called for ' + hookentry);

		if ((!result) || (Array.isArray(result) === false))
			throw 'invokeHooks did not receive an array as result parameter for hookentry: ' + hookentry;

		var hookarray = this.getHookArray(hookentry);
		var ret_array = {};

		for (var i=0; i < hookarray.length; i++) {
			var entry = hookarray[i];
			var func = entry['function'];
			var servicename = entry['servicename'];
			var service = this.getServiceInstance(servicename);
			
			if (service) {
				var ret = func.call(service, result, inputparams);
				
				ret_array[servicename] = ret;
				
				if (result[result.length-1] && (result[result.length-1].service == servicename) && (result[result.length-1].stop === true))
					break;
			}
			
		}
		
		return true;
	}
	
	invokeAsyncHooks(hookentry, result, inputparams) {
		console.log('Global.invokeAsyncHooks called for ' + hookentry);
		
		if ((!result) || (Array.isArray(result) === false))
			throw 'invokeAsyncHooks did not receive an array as result parameter for hookentry: ' + hookentry;

		var hookarray = this.getHookArray(hookentry);
		result.ret_array = [];
		
		
		// much easier with async/await
		/*for (var i = 0; i < hookarray.length; i++) {
			var entry = hookarray[i];
			var func = entry['function'];
			var servicename = entry['servicename'];
			var service = this.getServiceInstance(servicename);
			
			if (service) {
				var ret = await func.call(service, result, inputparams)
				.catch(err =>{
				});
				
				result.ret_array[servicename] = ret;
				result.ret_array.push(ret);
				
				if (result[result.length-1] && (result[result.length-1].service == servicename) && (result[result.length-1].stop === true))
					break;
			}
			
		}
				
		return true;*/
		
		
		return hookarray.reduce( (previousPromise, entry) => {
			var servicename;
			
			return previousPromise.then(() => {
				var func = entry['function'];
				var servicename = entry['servicename'];
				var service = this.getServiceInstance(servicename);
					
				if (service) {
					return func.call(service, result, inputparams);
				}
			})
			.then((ret) => {
				if (ret) {
					result.ret_array[servicename] = ret;
					result.ret_array.push(ret);
					
					if (result[result.length-1] && (result[result.length-1].service == servicename) && (result[result.length-1].stop === true))
						throw 'break';
				}
				return ret;
			});
		}, Promise.resolve())
		.then(()=>{
			return true;
		})
		.catch(err => {
			if (err != 'break')
				console.log('error while processing invokeAsyncHooks for ' + hookentry + ': ' + err);
		});
		
	}

	// static
	static getGlobalInstance() {
		if (!globalinstance)
			globalinstance = new Global();
		
		return globalinstance;
	}
	
	static registerServiceClass(servicename, classname, classprototype) {
		Global.getGlobalInstance().getServiceInstancet(servicename)[classname] = classprototype;
		
		classprototype.getClass = function() {
			return classprototype;
		}
		
		classprototype.getClassName = function() {
			return classname;
		}
		
		classprototype.getGlobalInstance = function() {
			return Global.getGlobalInstance();
		}
	}

}

//var GlobalClass = Global;

module.exports = Global;
