/**
 * 
 */

'use strict';

var Global = require('../../server/includes/common/global.js');

var global = Global.getGlobalInstance();

var commonservice = global.getServiceInstance('common');
var Session = commonservice.Session;


exports.dapp = function(req, res) {
	res.sendFile(dapp_root_dir + 'index.html');
}


//global Routes
exports.config = function(req, res) {
	// GET
	var globalconfig = global.readJson('config');
	var config = {};
	
	if (globalconfig.server_env === 'dev') {
		config = globalconfig;
	}
	else {
		config.server_env = "prod";
		
		config.rest_server_url = globalconfig.rest_server_url;
		config.rest_server_api_path = globalconfig.rest_server_api_path;
	}
	
	var jsonresult = {status: 1, config:  config};

	res.json(jsonresult);
}

exports.config_network = function(req, res) {
	// GET
	var network_config = global.getNetworkConfig();
	
	var jsonresult = {status: 1, config:  network_config};

	res.json(jsonresult);
}




exports.version = function(req, res) {
	// GET
	var now = new Date();
	var nowstring = global.formatDate(now, 'YYYY-mm-dd HH:MM:SS');
	//var version = global.getConstant('CURRENT_VERSION');
	var version = global.getCurrentVersion();
	var versioninfo = global.getVersionInfo();
	
	
	var jsonresult = {status: 1, version:  version, versioninfo: versioninfo, servertime: nowstring};
  	
	try {
		if (global.config.server_env === 'dev') {
			var hostname = 'unknown';
			var os = require('os');

			hostname = os.hostname();
			
			jsonresult.hostname = hostname;
			
			var interfaces = os.networkInterfaces();
			var addresses = [];
			for (var k in interfaces) {
				for (var k2 in interfaces[k]) {
					var address = interfaces[k][k2];
					if (address.family === 'IPv4' && !address.internal) {
						addresses.push(address.address);
					}
				}
			}
			
			jsonresult.hostaddress = addresses;
		}

	}
	catch(e) {
	}
	
  	res.json(jsonresult);
  	
}

exports.version_support = function(req, res) {
	var version_support = global.getVersionSupported();
	
	var jsonlist = [];

	for (var i = 0; i < version_support.length; i++) {
		jsonlist.push({version:  version_support[i]});
	}
	
	var jsonresult = {status: 1
			, data: jsonlist};
	
	res.json(jsonresult);
}


exports.get_logs_server_tail = function(req, res) {
	// GET

	global.log("logs_server_tail called");
	
	var lines = [];
	
	if (global.config.server_env === 'dev') {
		lines = global.tail_log_file();
	}
	
	var jsonresult = {status: 1, lines:  lines};
  	
  	res.json(jsonresult);
  	
}


// network
exports.web3_get_network_config = function(req, res) {
	// GET
	var sessionuuid = req.get("sessiontoken");
	
	var global = this.global;
	var commonservice = global.getServiceInstance('common');
	var Session = commonservice.Session;
	
}


