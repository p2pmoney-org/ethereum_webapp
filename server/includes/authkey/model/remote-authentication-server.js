/**
 * 
 */
'use strict';


class RemoteAuthenticationServer {
	constructor(service) {
		this.service = service;
		this.global = service.global;
		
		// default remote authentication
		this.rest_server_url = service.global.config['authkey_server_url'];
		this.rest_server_api_path = service.global.config['authkey_server_api_path'];
	}

	_getSessionRestDetails(session) {
		var global = this.global;

		var rest_server_url;
		var	rest_server_api_path;

		if ((global.getConfigValue('authkey_server_passthrough') === true) && session.auth_url_hash && (session.auth_url_hash != 'default')) {
			rest_server_url = session.auth_url;
			rest_server_api_path = ''; // we do not try to find the path back from url
		}
		else {
			// default
			rest_server_url = this.rest_server_url;
			rest_server_api_path = this.rest_server_api_path;
		}

		return {rest_server_url, rest_server_api_path};
	}

	_getSessionRestConnection(session) {
		var global = this.global;

		var rest_details = this._getSessionRestDetails(session);
		var rest_server_url = rest_details.rest_server_url;
		var	rest_server_api_path = rest_details.rest_server_api_path;

		var restcon;
		
		if ((global.getConfigValue('authkey_server_passthrough') === true) && session.auth_url_hash && (session.auth_url_hash != 'default')) {
			var parentsession = session.getParentSession();

			if (parentsession)
				restcon  = parentsession.getRestConnection(rest_server_url, rest_server_api_path);
			else
				throw new Error('child session is not set correctly for remote authentication');
		}
		else {
			restcon  = session.getRestConnection(rest_server_url, rest_server_api_path);
		}

		return restcon;
	}

	_getSessionUUID(session) {
		var global = this.global;

		var sessionuuid;

		if ((global.getConfigValue('authkey_server_passthrough') === true) && session.auth_url_hash && (session.auth_url_hash != 'default')) {
			var parentsession = session.getParentSession();

			if (parentsession)
				sessionuuid = parentsession.getSessionUUID();
			else
				throw new Error('child session is not set correctly for remote authentication');
		}
		else {
			sessionuuid = session.getSessionUUID();
		}

		return sessionuuid;
	}
	
	getSessionStatus(session) {
		var global = this.global;
		var sessionuuid = this._getSessionUUID(session);
		
		var restcon = this._getSessionRestConnection(session);
		
		var sessionstatus = [];
		var finished = false;
		
		sessionstatus['sessionuuid'] = sessionuuid;

		console.log('RemoteAuthenticationServer.getSessionStatus called for ' + sessionuuid + ' on ' + restcon.rest_server_url);
		
		try {
			var resource = "/session/" + sessionuuid;
			
			restcon.rest_get(resource, function (err, res) {
				if (res) {
					global.log('success calling ' + resource + ' result is: ' + JSON.stringify(res));
					
					sessionstatus['isauthenticated'] = res['isauthenticated'];
					sessionstatus['isanonymous'] = res['isanonymous'];

					finished = true;
				}
				else {
					global.log('rest error calling ' + resource);
					finished = true;
				}
				
			});
		}
		catch(e) {
			global.log('rest exception: ' + e);
			finished = true;
		}
		
		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce();}
		
		return sessionstatus;
	}
	
	getUserDetails(session) {
		var global = this.global;
		var self = this;
		var sessionuuid = this._getSessionUUID(session);
		
		var rest_details = this._getSessionRestDetails(session);
		var rest_server_url = rest_details.rest_server_url;
		var	rest_server_api_path = rest_details.rest_server_api_path;
		
		// look if it is in cache
		var cachename = 'authkey_remoteuserdetails';
		var userdetailcache = global.getExecutionVariable(cachename);
		
		if (!userdetailcache) {
			userdetailcache = global.createCacheObject(cachename);
			userdetailcache.setValidityLimit(300000); // 5 mn
			global.setExecutionVariable(cachename, userdetailcache);
		}

		var key = sessionuuid + '@' + rest_server_url + rest_server_api_path;
		
		var userdetails = userdetailcache.getValue(key);
		
		if ((userdetails) && (userdetails['useruuid']))
			return userdetails;
		
		// not in cache (or dimmed obsolete)
		var restcon = this._getSessionRestConnection(session);
		
		var finished = false;
		
		console.log('RemoteAuthenticationServer.getUserDetails called for ' + sessionuuid + ' on ' + restcon.rest_server_url);

		try {
			var resource = "/session/" + sessionuuid + "/user";
			
			restcon.rest_get(resource, function (err, res) {
				if (res) {
					global.log('success calling ' + resource +' result is: ' + JSON.stringify(res));
					
					if (res['status'] == 1)
					userdetails = res;

					finished = true;
				}
				else {
					global.log('rest error calling ' + resource);
					finished = true;
				}
				
			});
		}
		catch(e) {
			global.log('rest exception: ' + e);
			finished = true;
		}
		
		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce();}
		
		// put in cache
		if ((userdetails) && (userdetails['useruuid']))
		userdetailcache.putValue(key, userdetails);
		
		return userdetails;
	}
	
	getUser(session) {
		var userdetails = this.getUserDetails(session);
		
		if (!userdetails)
			return;
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		
		var user = this._getUserFromArray(commonservice, userdetails);
		
		return user;
	}
	
	_getUserFromArray(commonservice, userdetails) {
		var user = commonservice.createBlankUserInstance();
		
		if (userdetails) {
			if (userdetails['username'])
				user.setUserName(userdetails['username']);
			
			if (userdetails['useremail'])
				user.setUserEmail(userdetails['useremail']);
			
			if (userdetails['useruuid'])
				user.setUserUUID(userdetails['useruuid']);
			
			user.setAccountStatus(userdetails['accountstatus'] ? userdetails['accountstatus'] : 2);
		}
		
		
		return user;
	}
	
}

module.exports = RemoteAuthenticationServer;