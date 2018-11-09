/**
 * 
 */
'use strict';


class StorageServer {
	constructor(service) {
		this.service = service;
		this.global = service.global;
		
		var Persistor = require('./interface/database-persistor.js');
		
		this.persistor =  new Persistor(service);
	}
	
	getUserContent(user, key) {
		if (!user)
			return;
		
		var useruuid = user.getUserUUID();
		var keystring = key.toString();
		
		var array = this.persistor.getUserKeyContent(useruuid, keystring);
		
		return (array && array['content'] ? array['content'] : null);
	}
	
	putUserContent(user, key, content) {
		if (!user)
			return;
		
		var useruuid = user.getUserUUID();
		var keystring = key.toString();
		var contentstring = content.toString();
		
		this.persistor.putUserKeyContent(useruuid, keystring, contentstring);
	}
	
	
	deleteUserContent(user, key) {
		if (!user)
			return;
		
		var useruuid = user.getUserUUID();
		var keystring = key.toString();
		
		this.persistor.removeUserKeyContent(useruuid, keystring);
	}
}

module.exports = StorageServer;