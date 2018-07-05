/**
 * 
 */
'use strict';


class AuthKeyControllers {
	
	static authorize(req, res) {
		var AuthKeyService = require('../../server/includes/authkey/authkey-service.js');
		var service = AuthKeyService.getService();
		var version = service.getVersion();
	  	
		var jsonresult = {status: 1, version:  version};
		
	  	res.json(jsonresult);
	}
	
	
}

module.exports = AuthKeyControllers;