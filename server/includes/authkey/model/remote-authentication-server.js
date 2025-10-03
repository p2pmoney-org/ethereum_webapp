/**
 * 
 */
'use strict';


class RemoteAuthenticationServer {
	constructor(service) {
		this.service = service;
		this.global = service.global;
		
		// default remote authentication
		this.rest_server_url = service.authkey_server_url;
		this.rest_server_api_path = service.authkey_server_api_path;
		
		this.authkey_server_passthrough = service.authkey_server_passthrough;
	}

	_getSessionRestDetails(session) {
		var global = this.global;
		global.log('OBSOLETE: use _getSessionAuthRestDetailsAsync');

		var rest_server_url;
		var	rest_server_api_path;

		if ((this.authkey_server_passthrough === true) && session.auth_url_hash && (session.auth_url_hash != 'default')) {
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

	async _getSessionAuthRestDetailsAsync(session, session_section) {
		var global = this.global;

		var authkey_rest_server_url;
		var	authkey_rest_server_api_path;

		if (this.authkey_server_passthrough === true) {
			// since legacy calls do not pass a session_section, we assume that the session is authenticated
			// on only one external authentication server and keep the first calltoken passed, if any,
			// this is a lazzy calltoken discovery
			let lazzy_session_section_calltoken = this.service._getSessionLazzyCallTokenMap(session);

			if (session_section) {
				let calltoken = session_section.getCallToken();

				if ((calltoken) && (calltoken.auth !== '_local_')) {
					authkey_rest_server_url = calltoken.auth;
					authkey_rest_server_api_path = ''; // we do not try to find the path back from url

					// check if we already set a lazzy token for root session
					let root_session = await session_section.getRootSessionAsync();
					if (root_session) {
						let root_session_uuid = root_session.getSessionUUID();
						let _lazzy_session_section_calltoken = this.service._getSessionLazzyCallTokenMap(root_session);
	
						if (!_lazzy_session_section_calltoken[root_session_uuid]) {
							_lazzy_session_section_calltoken[root_session_uuid] = {calltoken};
							global.log('setting lazzy calltoken thanks to session_section ' + session_section.name + ' into session ' + session_section.session_uuid);
						}
					}

				}
				else if ((calltoken) && (calltoken.auth === '_local_')) {
					authkey_rest_server_url = null; // do not make rest calls
					authkey_rest_server_api_path = null;
				}
				else if (session.auth_url_hash && (session.auth_url_hash != 'default')) {
					authkey_rest_server_url = session.auth_url;
					authkey_rest_server_api_path = ''; // we do not try to find the path back from url
				}
				else {
					// no calltoken in session_section and no auth_url in session
					global.log('client did not pass a calltoken for session_section ' + session_section.name + ' and session ' + session_section.session_uuid);

					if (session.auth_url_hash && (session.auth_url_hash != 'default')) {
						authkey_rest_server_url = session.auth_url;
						authkey_rest_server_api_path = ''; // we do not try to find the path back from url
						global.log('using session.auth_url for session_section ' + session_section.name + ' and session ' + session_section.session_uuid);
					}
					else if (lazzy_session_section_calltoken[session.session_uuid] && lazzy_session_section_calltoken[session.session_uuid].calltoken) {
						authkey_rest_server_url = lazzy_session_section_calltoken[session.session_uuid].calltoken.auth;
						authkey_rest_server_api_path = ''; // we do not try to find the path back from url
						
						global.log('using lazzy calltoken for session_section ' + session_section.name + ' and session ' + session_section.session_uuid);
					}
				}

			}
			else {
				// legacy call missing a session_section
				if (session.auth_url_hash && (session.auth_url_hash != 'default')) {
					authkey_rest_server_url = session.auth_url;
					authkey_rest_server_api_path = ''; // we do not try to find the path back from url
				}
				else if (lazzy_session_section_calltoken[session.session_uuid] && lazzy_session_section_calltoken[session.session_uuid].calltoken) {
					authkey_rest_server_url = lazzy_session_section_calltoken[session.session_uuid].calltoken.auth;
					authkey_rest_server_api_path = ''; // we do not try to find the path back from url
					
					global.log('no session_section, using lazzy calltoken for session ' + session_section.session_uuid);
				}
			}
		}

		if (!authkey_rest_server_url) {
			// default
			authkey_rest_server_url = this.rest_server_url;
			authkey_rest_server_api_path = this.rest_server_api_path;
		}

		let json = {authkey_rest_server_url, authkey_rest_server_api_path};

		// legacy
		json.rest_server_url = authkey_rest_server_url;
		json.rest_server_api_path = authkey_rest_server_api_path;

		return json;
	}

	async _getSessionAuthRestConnectionAsync(session, session_section) {
		var global = this.global;

		var rest_details = await this._getSessionAuthRestDetailsAsync(session, session_section);
		var rest_server_url = rest_details.rest_server_url;
		var	rest_server_api_path = rest_details.rest_server_api_path;

		var restcon;
		
		if (this.authkey_server_passthrough === true) {
			if (session.auth_url_hash && (session.auth_url_hash != 'default')) {
				var parentsession = session.getParentSession();

				if (parentsession) {
					restcon  = parentsession.getRestConnection(rest_server_url, rest_server_api_path);
				}
				else
					throw new Error('child session is not set correctly for remote authentication');
			}
			else {
				restcon  = session.getRestConnection(rest_server_url, rest_server_api_path);
			}
	
			// add a _local_ calltoken to notify it is a final call for another authkey_server_passthrough
			// necessary to avoid infinite loops when calling back itself
			let calltoken = {auth: '_local_'};
			let calltokenstring = JSON.stringify(calltoken);
			restcon.addToHeader({key: 'calltoken', value: calltokenstring});

		}
		else {
			// standard, fixed authentication server authorization
			restcon  = session.getRestConnection(rest_server_url, rest_server_api_path);
		}

		return restcon;
	}

	_getSessionUUID(session) {
		var global = this.global;

		var sessionuuid;

		if ((this.authkey_server_passthrough === true) && session.auth_url_hash && (session.auth_url_hash != 'default')) {
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

	async getSessionStatusAsync(session, session_section) {
		var global = this.global;
		var sessionuuid = this._getSessionUUID(session);
		
		var restcon = await this._getSessionAuthRestConnectionAsync(session, session_section);
		
		var sessionstatus = [];
		
		sessionstatus['sessionuuid'] = sessionuuid;

		console.log('RemoteAuthenticationServer.getSessionStatusAsync called for ' + sessionuuid + ' on ' + restcon.rest_server_url);
		
		try {
			var resource = "/session/" + sessionuuid;

			sessionstatus = await new Promise( (resolve, reject) => {
				restcon.rest_get(resource, function (err, res) {
					let status = [];
					if (res) {
						global.log('success calling ' + resource + ' result is: ' + JSON.stringify(res));
						
						status['isauthenticated'] = res['isauthenticated'];
						status['isanonymous'] = res['isanonymous'];
	
						resolve(status);
					}
					else {
						global.log('rest error calling ' + resource);
						reject(err);
					}
			});
			

				
			});
		}
		catch(e) {
			global.log('rest exception: ' + e);
		}
		
		return sessionstatus;
	}
	
	getSessionStatus(session) {
		var global = this.global;
		global.log('OBSOLETE: use getSessionStatusAsync');
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

	async getUserDetailsAsync(session, session_section) {
		var global = this.global;

		if (session_section && session_section.calltoken && (session_section.calltoken.auth === '_local_') && session.user) {
			// it's a re-entrant call
			return session.user;
		}
 
		var sessionuuid = this._getSessionUUID(session);
		
		var rest_details = await this._getSessionAuthRestDetailsAsync(session, session_section);
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
		if (rest_server_url) {
			var restcon = await this._getSessionAuthRestConnectionAsync(session, session_section);
		
			console.log('RemoteAuthenticationServer.getUserDetailsAsync called for ' + sessionuuid + ' on ' + restcon.rest_server_url);
	
			try {
				var resource = "/session/" + sessionuuid + "/user";
				
				userdetails = await new Promise( (resolve, reject) => {
					restcon.rest_get(resource, function (err, res) {
						if (res) {
							global.log('success calling ' + resource +' result is: ' + JSON.stringify(res));
							
							if (res['status'] == 1)
							resolve(res);
							else
							reject('no result');
						}
						else {
							global.log('rest error calling ' + resource);
							reject(err);
						}
						
					});
				});
	
			}
			catch(e) {
				global.log('rest exception: ' + e);
			}
		}

		
		// put in cache
		if ((userdetails) && (userdetails['useruuid']))
		userdetailcache.putValue(key, userdetails);
		
		return userdetails;
	}
	
	getUserDetails(session) {
		var global = this.global;
		global.log('OBSOLETE: use getUserDetailsAsync');
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
		var finished = false;
		
		this.getUserDetailsAsync(session)
		.then((res) => {
			userdetails = res;
			finished = true;
		})
		.catch(err => {
			finished = true;
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce();}
		
		// put in cache
		if ((userdetails) && (userdetails['useruuid']))
		userdetailcache.putValue(key, userdetails);
		
		return userdetails;
	}
	
	async getUserAsync(session, session_section) {
		var userdetails = await this.getUserDetailsAsync(session, session_section);
		
		if (!userdetails)
			return;
		
		var global = this.global;
		var commonservice = global.getServiceInstance('common');
		
		var user = this._getUserFromArray(commonservice, userdetails);
		
		return user;
	}
	
	getUser(session) {
		var userdetails = this.getUserDetails(session);
		
		if (!userdetails)
			return;
		
		var global = this.global;
		global.log('OBSOLETE: use getUserAsync');
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