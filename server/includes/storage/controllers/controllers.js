/**
 * 
 */
'use strict';


class StorageControllers {
	
	constructor(global) {
		this.global = global;
	}
	
	getCalltokenJson(calltoken) {
		if (calltoken && (calltoken.charAt(0) == '{')) {
			// try to transform it into an object
			try {
				var calltokenjson = JSON.parse(calltoken);

				return calltokenjson;
			}
			catch(e) {
			}
		}
	}

	//
	// storage API
	//

	//
	// User storage API
	//
	async user_storage(req, res) {
		// POST
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		var calltoken = req.get("calltoken");
		var calltokenjson = this.getCalltokenJson(calltoken);
		
		global.log("user_storage called for sessiontoken " + sessionuuid);
		
		var key  = req.body.key;
		
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		var jsonresult;
		
		try {
			var section = Session.openSessionSection(global, sessionuuid, 'user_storage', calltokenjson);
			var session = await section.getSessionAsync();
			var isAuthenticated = await session.isAuthenticatedAsync();
			
			if (isAuthenticated) {
				var storageservice = global.getServiceInstance('storage');
				var storageserver = storageservice.getStorageServerInstance();
				
				var user = await storageserver.getStorageUserAsync(session);
				
				var content = await storageserver.getUserContentAsync(user, key);
				
				jsonresult = {status: 1, useruuid: user.getUserUUID(), key: key, content: content};
			}
			else {
				jsonresult = {status: 0, error: "session is not authenticated"};
			}

		}
		catch(e) {
			global.log("exception in user_storage for sessiontoken " + sessionuuid + ": " + e);
			jsonresult = {status: 0, error: "exception could not retrieve content"};
		}

		global.log("user_storage response is " + JSON.stringify(jsonresult));
		
		if (section) section.close();
		res.json(jsonresult);
	}

	async put_user_storage(req, res) {
		// PUT
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		var calltoken = req.get("calltoken");
		var calltokenjson = this.getCalltokenJson(calltoken);
		
		global.log("put_user_storage called for sessiontoken " + sessionuuid);
		
		var key  = req.body.key;
		var content  = req.body.content;
		
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		var jsonresult;
		
		try {
			var section = Session.openSessionSection(global, sessionuuid, 'put_user_storage', calltokenjson);
			var session = await section.getSessionAsync();
			var isAuthenticated = await session.isAuthenticatedAsync();
			
			if (isAuthenticated) {
				var storageservice = global.getServiceInstance('storage');
				var storageserver = storageservice.getStorageServerInstance();
				
				var user = await storageserver.getStorageUserAsync(session);
				
				await storageserver.putUserContentAsync(user, key, content);
				
				jsonresult = {status: 1, useruuid: user.getUserUUID(), key: key, content: content};
			}
			else {
				jsonresult = {status: 0, error: "session is not authenticated"};
			}

		}
		catch(e) {
			global.log("exception in put_user_storage for sessiontoken " + sessionuuid + ": " + e);
			
			jsonresult = {status: 0, error: "exception could not save content"};
		}

		//global.log("user_storage response is " + JSON.stringify(jsonresult));
		
		if (section) section.close();
		res.json(jsonresult);
	}

	async delete_user_storage(req, res) {
		// DELETE
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		var calltoken = req.get("calltoken");
		var calltokenjson = this.getCalltokenJson(calltoken);
		
		global.log("delete_user_storage called for sessiontoken " + sessionuuid);
		
		var key  = req.body.key;
		
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		var jsonresult;
		
		try {
			var section = Session.openSessionSection(global, sessionuuid, 'put_user_storage', calltokenjson);
			var session = await section.getSessionAsync();
			var isAuthenticated = await session.isAuthenticatedAsync();
			
			if (isAuthenticated) {
				var storageservice = global.getServiceInstance('storage');
				var storageserver = storageservice.getStorageServerInstance();
				
				var user = await storageserver.getStorageUserAsync(session);
				
				await storageserver.deleteUserContentAsync(user, key);
				
				jsonresult = {status: 1, useruuid: user.getUserUUID(), key: key};
			}
			else {
				jsonresult = {status: 0, error: "session is not authenticated"};
			}

		}
		catch(e) {
			global.log("exception in delete_user_storage for sessiontoken " + sessionuuid + ": " + e);
			jsonresult = {status: 0, error: "exception could not delete key content"};
		}

		//global.log("user_storage response is " + JSON.stringify(jsonresult));
		
		if (section) section.close();
		res.json(jsonresult);
	}
	
	
	// imports
	async user_import(req, res) {
		// PUT
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		var calltoken = req.get("calltoken");
		var calltokenjson = this.getCalltokenJson(calltoken);
		
		global.log("user_import called for sessiontoken " + sessionuuid);
		
		var key  = req.body.key;
		var content  = req.body.content;
		
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		var jsonresult;
		
		try {
			var section = Session.openSessionSection(global, sessionuuid, 'user_import', calltokenjson);
			var session = await section.getSessionAsync();
			var isAuthenticated = await session.isAuthenticatedAsync();
			
			if (isAuthenticated) {
				var storageservice = global.getServiceInstance('storage');
				var storageserver = storageservice.getStorageServerInstance();
				
				var user = await storageserver.getStorageUserAsync(session);
				
				await storageserver.putUserContentAsync(user, key, content);
				
				jsonresult = {status: 1, useruuid: user.getUserUUID(), key: key, content: content};
			}
			else {
				jsonresult = {status: 0, error: "session is not authenticated"};
			}

		}
		catch(e) {
			global.log("exception in user_import for sessiontoken " + sessionuuid + ": " + e);
			
			jsonresult = {status: 0, error: "exception could not import content"};
		}

		//global.log("user_storage response is " + JSON.stringify(jsonresult));
		
		if (section) section.close();
		res.json(jsonresult);
	}

	// exports
	async user_export(req, res) {
		// POST
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		var calltoken = req.get("calltoken");
		var calltokenjson = this.getCalltokenJson(calltoken);
		
		global.log("user_export called for sessiontoken " + sessionuuid);
		
		var key  = req.body.key;
		
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		var jsonresult;
		
		try {
			var section = Session.openSessionSection(global, sessionuuid, 'user_export', calltokenjson);
			var session = await section.getSessionAsync();
			var isAuthenticated = await session.isAuthenticatedAsync();
			
			if (isAuthenticated) {
				var storageservice = global.getServiceInstance('storage');
				var storageserver = storageservice.getStorageServerInstance();
				
				var user = await storageserver.getStorageUserAsync(session);
				
				var content = await storageserver.getUserContentAsync(user, key);
				
				jsonresult = {status: 1, useruuid: user.getUserUUID(), key: key, content: content};
			}
			else {
				jsonresult = {status: 0, error: "session is not authenticated"};
			}

		}
		catch(e) {
			global.log("exception in user_export for sessiontoken " + sessionuuid + ": " + e);
			jsonresult = {status: 0, error: "exception could not export content"};
		}

		global.log("user_export response is " + JSON.stringify(jsonresult));
		
		if (section) section.close();
		res.json(jsonresult);
	}

	
}

module.exports = StorageControllers;