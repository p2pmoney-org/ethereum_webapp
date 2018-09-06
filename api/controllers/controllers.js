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
exports.version = function(req, res) {
	var now = new Date();
	var nowstring = global.formatDate(now, 'YYYY-mm-dd HH:MM:SS');
	
	var jsonresult = {status: 1, version:  global.getConstant('CURRENT_VERSION'), servertime: nowstring};
  	
  	res.json(jsonresult);
  	
}

