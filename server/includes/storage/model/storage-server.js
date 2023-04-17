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

		this.authkey_server_passthrough = service.authkey_server_passthrough;
	}

	getStorageUser(session) {
		if (this.authkey_server_passthrough === true) {
			// get session user
			var user = session.getUser();

			if (!user)
				return;

			// then find what is the local persisted user
			var global = this.global;

			var authkeyservice = global.getServiceInstance('authkey');
			var authserver = authkeyservice.getAuthenticationServerInstance();

			var useruuid = user.getUserUUID();
			var _safe_useruuid =  authserver._getSafeUserUUID(session, useruuid)
			var _safe_userdetails = authserver.persistor.getUserArrayFromUUID(_safe_useruuid);
	
			var commonservice = global.getServiceInstance('common');
			var _safe_user = commonservice.createBlankUserInstance();

			_safe_user.setUserUUID(_safe_useruuid);
			_safe_user.setUserName(_safe_userdetails['username']);
			_safe_user.setUserEmail(_safe_userdetails['useremail']);
			_safe_user.setAccountStatus(_safe_userdetails['accountstatus'] ? _safe_userdetails['accountstatus'] : 2);

			return _safe_user;
		}

		return session.getUser();

	}
	
	async getStorageUserAsync(session) {
		if (this.authkey_server_passthrough === true) {
			// get session user
			var user = session.getUser();

			if (!user)
				return;

			// then find what is the local persisted user
			var global = this.global;

			var authkeyservice = global.getServiceInstance('authkey');
			var authserver = authkeyservice.getAuthenticationServerInstance();

			var useruuid = user.getUserUUID();
			var _safe_useruuid =  authserver._getSafeUserUUID(session, useruuid)
			var _safe_userdetails = await authserver.persistor.getUserArrayFromUUIDAsync(_safe_useruuid);
	
			var commonservice = global.getServiceInstance('common');
			var _safe_user = commonservice.createBlankUserInstance();

			_safe_user.setUserUUID(_safe_useruuid);
			_safe_user.setUserName(_safe_userdetails['username']);
			_safe_user.setUserEmail(_safe_userdetails['useremail']);
			_safe_user.setAccountStatus(_safe_userdetails['accountstatus'] ? _safe_userdetails['accountstatus'] : 2);

			return _safe_user;
		}

		return session.getUser();

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

	async getUserContentAsync(user, key) {
		if (!user)
			return;
		
		var global = this.global;
		
		var useruuid = user.getUserUUID();
		var keystring = key.toString();
		
		var array = await this.persistor.getUserKeyContentAsync(useruuid, keystring);
		
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
	
	async putUserContentAsync(user, key, content) {
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

		var ret = global.invokeHooks('putUserContent_hook', result, params); // legacy
		ret = await global.invokeAsyncHooks('putUserContent_asynchook', result, params);
		
		if (ret && result && result.length) {
			global.log('putUserContent_asynchook result is ' + JSON.stringify(result));
			
			contentstring = result.content;
		}
		

		await this.persistor.putUserKeyContentAsync(useruuid, keystring, contentstring);
	}

	deleteUserContent(user, key) {
		if (!user)
			return;
		
		var useruuid = user.getUserUUID();
		var keystring = key.toString();
		
		this.persistor.removeUserKeyContent(useruuid, keystring);
	}
		
	async deleteUserContentAsync(user, key) {
		if (!user)
			return;
		
		var useruuid = user.getUserUUID();
		var keystring = key.toString();
		
		await this.persistor.removeUserKeyContentAsync(useruuid, keystring);
	}
}

module.exports = StorageServer;