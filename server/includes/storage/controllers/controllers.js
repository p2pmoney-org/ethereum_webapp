/**
 * 
 */
'use strict';


class StorageControllers {
	
	constructor(global) {
		this.global = global;
	}
	
	//
	// storage API
	//

	//
	// User storage API
	//
	user_storage(req, res) {
		// POST
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		
		global.log("user_storage called for sessiontoken " + sessionuuid);
		
		var key  = req.body.key;
		
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		var jsonresult;
		
		try {
			var session = Session.getSession(global, sessionuuid);
			
			if (session.isAuthenticated()) {
				var storageservice = global.getServiceInstance('storage');
				var storageserver = storageservice.getStorageServerInstance();
				
				var user = session.getUser();
				
				var content = storageserver.getUserContent(user, key);
				
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
	  	
	  	res.json(jsonresult);
	}

	put_user_storage(req, res) {
		// PUT
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		
		global.log("put_user_storage called for sessiontoken " + sessionuuid);
		
		var key  = req.body.key;
		var content  = req.body.content;
		
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		var jsonresult;
		
		try {
			var session = Session.getSession(global, sessionuuid);
			
			if (session.isAuthenticated()) {
				var storageservice = global.getServiceInstance('storage');
				var storageserver = storageservice.getStorageServerInstance();
				
				var user = session.getUser();
				
				storageserver.putUserContent(user, key, content);
				
				jsonresult = {status: 1, useruuid: user.getUserUUID(), key: key, content: content};
			}
			else {
				jsonresult = {status: 0, error: "session is not authenticated"};
			}

		}
		catch(e) {
			global.log("exception in put_user_storage for sessiontoken " + sessionuuid + ": " + e);
			
			jsonresult = {status: 0, error: "exception could not retrieve content"};
		}

		//global.log("user_storage response is " + JSON.stringify(jsonresult));
	  	
	  	res.json(jsonresult);
	}

	delete_user_storage(req, res) {
		// DELETE
		var global = this.global;
		var sessionuuid = req.get("sessiontoken");
		
		global.log("delete_user_storage called for sessiontoken " + sessionuuid);
		
		var key  = req.body.key;
		
		var commonservice = global.getServiceInstance('common');
		var Session = commonservice.Session;

		var jsonresult;
		
		try {
			var session = Session.getSession(global, sessionuuid);
			
			if (session.isAuthenticated()) {
				var storageservice = global.getServiceInstance('storage');
				var storageserver = storageservice.getStorageServerInstance();
				
				var user = session.getUser();
				
				storageserver.deleteUserContent(user, key);
				
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
	  	
	  	res.json(jsonresult);
	}
	

}

module.exports = StorageControllers;