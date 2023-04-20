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

global.current_version = "0.40.21.2023.04.20";
global.version_support = ["0.40", "0.30", "0.20"];


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

	Service = require('./includes/crypto/service.js');
	global.registerServiceInstance(new Service());
	
	// optional services
	if (global.config['activate_ethnode'] != 0) {
		Service = require('./includes/ethnode/service.js');
		global.registerServiceInstance(new Service());
	}
	
	if (global.config['activate_cli_cont'] == 1) {
		// cli_cont accepts a lot of anonymous requests
		// and constitutes a security threat (e.g. access to local storage)
		// activate only if necessary
		Service = require('./includes/cli-cont/service.js');
		global.registerServiceInstance(new Service());
	}
	
	// initialization
	global.initServer();
}
catch(e) {
	global.log("ERROR during initServer: " + e);
	global.log(e.stack);
}




// dapp
global.log("");

var ethereum_webapp_service = global.getServiceInstance('ethereum_webapp');

var dapp_root_dir = ethereum_webapp_service.getServedDappDirectory();
var copy_dapp_files = ethereum_webapp_service.copy_dapp_files;
var overload_dapp_files = ethereum_webapp_service.overload_dapp_files;

global.log("****Files****");
global.log("DAPP root directory is " + dapp_root_dir);
global.log("Copy DAPP directory is " + copy_dapp_files);
global.log("Overload DAPP directory is " + overload_dapp_files);
global.log("Log enabled is " + global.enable_log);
global.log("Log write is " + global.write_to_log_file);
global.log("Log path is " + global.logPath);

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

if (global.config['authkey_server_url']) global.log("AUTHKEY server url is " + global.config['authkey_server_url']); else global.log("AUTHKEY server url is not defined");
if (global.config['authkey_server_api_path']) global.log("AUTHKEY server api path is " + global.config['authkey_server_api_path']); else global.log("AUTHKEY server api path is not defined");
if (global.config['authkey_server_passthrough']) global.log("AUTHKEY server passthrough is " + global.config['authkey_server_passthrough']); else global.log("AUTHKEY server passthrough is not defined");

var ethnode_service = global.getServiceInstance('ethnode');

if (ethnode_service) {
	if (global.config['ethnode_server_url']) global.log("ETHNODE server url is " + global.config['ethnode_server_url']); else global.log("ETHNODE server url is not defined");
	if (global.config['ethnode_server_api_path']) global.log("ETHNODE server api path is " + global.config['ethnode_server_api_path']); else global.log("ETHNODE server api path is not defined");
	if (global.config['web3_protected_read']) global.log("ETHNODE protected read is " + global.config['web3_protected_read']); else global.log("ETHNODE protected read is not defined");
	if (global.config['web3_protected_write']) global.log("ETHNODE protected write is " + global.config['web3_protected_write']); else global.log("ETHNODE protected write is not defined");
	
	// ethnode
		global.log("****Ethereum****");
	global.log("Web3 provider is " + ethnode_service.web3_provider_url);
	global.log("Web3 port is " + ethnode_service.web3_provider_port);
	global.log("Web3 chain id is " + ethnode_service.web3_provider_chain_id);
	global.log("Web3 network id is " + ethnode_service.web3_provider_network_id);
}

// client container
var cli_cont_service = global.getServiceInstance('client-container');

if (cli_cont_service) {
	global.log("****Client Container****");
	global.log("CLICONT local storage dir is " + global.config['local_storage_dir']);
}


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

