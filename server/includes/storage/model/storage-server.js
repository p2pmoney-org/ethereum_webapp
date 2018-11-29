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
		
		var global = this.global;
		
		var useruuid = user.getUserUUID();
		var keystring = key.toString();
		
		var array = this.persistor.getUserKeyContent(useruuid, keystring);
		
		var usercontent = (array && array['content'] ? array['content'] : null);
		
		// invoke hook before returning content
		var result = [];
		
		var params = [];
		
		params.push(user);
		params.push(key);
		params.push(usercontent);

		var ret = global.invokeHooks('getUserContent_hook', result, params);
		
		if (ret && result && result.length) {
			global.log('getUserContent_hook result is ' + JSON.stringify(result));
			
			usercontent = result.content;
		}
		
		return usercontent;
	}
	
	putUserContent(user, key, content) {
		if (!user)
			return;
		
		var global = this.global;
		
		var useruuid = user.getUserUUID();
		var keystring = key.toString();
		var contentstring = content.toString();
		
		// invoke hook before saving content
		var result = [];
		
		var params = [];
		
		params.push(user);
		params.push(key);
		params.push(contentstring);

		var ret = global.invokeHooks('putUserContent_hook', result, params);
		
		if (ret && result && result.length) {
			global.log('putUserContent_hook result is ' + JSON.stringify(result));
			
			contentstring = result.content;
		}
		

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