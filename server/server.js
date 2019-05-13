/**
 * 
 */
'use strict';


//setting environment variables
var process = require('process');

// instantiating global object
var Global = require('./includes/common/global.js');

// setting global var in Global
if (process.env.ETHEREUM_WEBAPP_BASE_DIR) {
	Global.ETHEREUM_WEBAPP_BASE_DIR = process.env.ETHEREUM_WEBAPP_BASE_DIR;
}

if (process.env.ETHEREUM_WEBAPP_EXEC_DIR) {
	Global.ETHEREUM_WEBAPP_EXEC_DIR = process.env.ETHEREUM_WEBAPP_EXEC_DIR;
}


//instantiating global object
var global = Global.getGlobalInstance();

global.current_version = "0.11.0.2019.05.13";
global.version_support = ["0.11.0", "0.10.0"];


//force logging
/*global.releaseConsoleLog();
global.enableLog(true);
global.setExecutionEnvironment('dev');*/


if (global.execution_env) {
	// DEBUG
	Error.stackTraceLimit = Infinity;
	// DEBUG
}


global.log("*********");
global.log("Starting server: " + global.service_name);

global.log("");
global.log("Base directory: " + global.base_dir);
global.log("Execution directory: " + global.execution_dir);
global.log("Configuration file: " + global.config_path);
global.log("Execution environment: " + global.execution_env);
global.log("*********");
global.log("");
global.log("****Server initialization*****");


try {

	// register services
	var Service;
	
	// local services
	Service = require('./local/webapp/service.js');
	global.registerServiceInstance(new Service());
	
	// standard services
	Service = require('./includes/admin/service.js');
	global.registerServiceInstance(new Service());
	
	Service = require('./includes/authkey/service.js');
	global.registerServiceInstance(new Service());
	
	Service = require('./includes/storage/service.js');
	global.registerServiceInstance(new Service());
	
	Service = require('./includes/ethnode/service.js');
	global.registerServiceInstance(new Service());
	
	//Service = require('./includes/cli-cont/service.js');
	//global.registerServiceInstance(new Service());
	
	Service = require('./includes/crypto/service.js');
	global.registerServiceInstance(new Service());
	
	// initialization
	global.initServer();
}
catch(e) {
	global.log("ERROR during initServer: " + e);
	global.log(e.stack);
}




// dapp
global.log("");


var dapp_root_dir = global.getServiceInstance('ethereum_webapp').getServedDappDirectory();

global.log("****Files****");
global.log("DAPP root directory is " + dapp_root_dir);
global.log("Log enabled is " + global.enable_log);
global.log("Log write is " + global.write_to_log_file);
global.log("Log path is " + global.logPath);

global.log("****Ethereum****");
global.log("Web3 provider is " + global.web3_provider_url);
global.log("Web3 port is " + global.web3_provider_port);

global.log("****Mysql****");
global.log("Mysql host is " + global.mysql_host);
global.log("Mysql port is " + global.mysql_port);
global.log("Mysql database is " + global.mysql_database);
global.log("Mysql username is " + global.mysql_username);
//global.log("Mysql password is " + global.mysql_password);

global.log("****REST****");
global.log("API root path is " + global.route_root_path);
global.log("REST server url is " + global.config['rest_server_url']);
global.log("REST server api path is " + global.config['rest_server_api_path']);

if (global.config['authkey_server_url']) global.log("AUTHKEY server url is " + global.config['authkey_server_url']);
if (global.config['authkey_server_api_path']) global.log("AUTHKEY server api path is " + global.config['authkey_server_api_path']);


global.log("*********");


//
// Express
//

global.log("");

global.log("****Loading express*****");

try {
	// starting express
	var app = global.getServiceInstance('ethereum_webapp').startWebApp();
	
	// express middleware
	global.getServiceInstance('ethereum_webapp').startMiddleware();
	
	//admin ui
	// (should be after middleware because of bodyParser)
	global.getServiceInstance('admin').startAdminUI(app);
}
catch(e) {
	global.log("ERROR during express load: " + e);
	global.log(e.stack);
}


global.log("*********");

