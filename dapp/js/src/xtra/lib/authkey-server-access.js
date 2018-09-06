'use strict';

class Xtra_AuthKeyServerAccess {
	constructor(session) {
		this.session = session;
		
		this.credentials_storage = new CredentialsStorage();
		
		this.rest_auth_connection = null;
		this.rest_key_connection = null;
	}
	
	getRestAuthConnection() {
		if (this.rest_auth_connection)
			return this.rest_auth_connection;
		
	    var rest_server_url = this.session.getXtraConfigValue('rest_server_url');
	    var rest_server_api_path = this.session.getXtraConfigValue('rest_server_api_path');

	    this.rest_auth_connection = this.session.createRestConnection(rest_server_url, rest_server_api_path);
		
		return this.rest_auth_connection;
	}
	
	rest_auth_get(resource, callback) {
		var rest_connection = this.getRestAuthConnection();
		
		return rest_connection.rest_get(resource, callback);
	}
	
	rest_auth_post(resource, postdata, callback) {
		var rest_connection = this.getRestAuthConnection();
		
		return rest_connection.rest_post(resource, postdata, callback);
	}
	
	getRestKeyConnection() {
		if (this.rest_key_connection)
			return this.rest_key_connection;
		
	    var rest_server_url = this.session.getXtraConfigValue('rest_server_url');
	    var rest_server_api_path = this.session.getXtraConfigValue('rest_server_api_path');

	    this.rest_key_connection = this.session.createRestConnection(rest_server_url, rest_server_api_path);
		
		return this.rest_key_connection;
	}
	
	rest_key_get(resource, callback) {
		var rest_connection = this.getRestKeyConnection();
		
		return rest_connection.rest_get(resource, callback);
	}
	
	rest_key_post(resource, postdata, callback) {
		var rest_connection = this.getRestKeyConnection();
		
		return rest_connection.rest_post(resource, postdata, callback);
	}

	
	

	//
	// rest Auth API
	//
	auth_version(callback) {
		console.log("Xtra_AuthKeyServerAccess.auth_version called");
		
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/version";
				
				self.rest_auth_get(resource, function (err, res) {
					if (res) {
						var version = res['version'];
						
						if (callback)
							callback(null, version);
						
						return resolve(version);
					}
					else {
						reject('rest error calling ' + resource);
					}
					
				});
			}
			catch(e) {
				reject('rest exception: ' + e);
			}
		});
		
		return promise;
		
	}
	
	
	auth_session_authenticate(username, password, callback) {
		console.log("Xtra_AuthKeyServerAccess.auth_session_authenticate called");
		
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/session/authenticate";
				
				var postdata = [];
				
				postdata = {username: username, password: password};
				
				self.rest_auth_post(resource, postdata, function (err, res) {
					if (res) {
						
						if (callback)
							callback(null, res);
						
						return resolve(res);
					}
					else {
						reject('rest error calling ' + resource);
					}
					
				});
			}
			catch(e) {
				reject('rest exception: ' + e);
			}
		});
		
		return promise;
		
	}
	
	auth_session_logout(useruuid, callback) {
		console.log("Xtra_AuthKeyServerAccess.auth_session_logout called");
		
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/session/logout";
				
				var postdata = [];
				
				postdata = {useruuid: useruuid};
				
				self.rest_auth_post(resource, postdata, function (err, res) {
					if (res) {
						
						if (callback)
							callback(null, res);
						
						return resolve(res);
					}
					else {
						reject('rest error calling ' + resource);
					}
					
				});
			}
			catch(e) {
				reject('rest exception: ' + e);
			}
		});
		
		return promise;
		
	}
	
	//
	// rest Key API
	//
	key_version(callback) {
		console.log("Xtra_AuthKeyServerAccess.key_version called");
		
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/version";
				
				self.rest_key_get(resource, function (err, res) {
					if (res) {
						var version = res['version'];
						
						if (callback)
							callback(null, version);
						
						return resolve(version);
					}
					else {
						reject('rest error calling ' + resource);
					}
					
				});
			}
			catch(e) {
				reject('rest exception: ' + e);
			}
		});
		
		return promise;
		
	}
	
	key_session_keys(callback) {
		console.log("Xtra_AuthKeyServerAccess.key_session_keys called");
		
		var self = this
		var session = this.session;

		var promise = new Promise(function (resolve, reject) {
			
			try {
				var resource = "/key/session/keys";
				
				self.rest_auth_get(resource, function (err, res) {
					if (res) {
						
						if (callback)
							callback(null, res);
						
						return resolve(res);
					}
					else {
						reject('rest error calling ' + resource);
					}
					
				});
			}
			catch(e) {
				reject('rest exception: ' + e);
			}
		});
		
		return promise;
		
	}

}

console.log("Xtra_AuthKeyServerAccess is loaded");

if ( typeof GlobalClass !== 'undefined' && GlobalClass )
GlobalClass.registerModuleClass('authkey', 'Xtra_AuthKeyServerAccess', Xtra_AuthKeyServerAccess);
else
module.exports = Xtra_AuthKeyServerAccess; // we are in node js
