/**
 * 
 */
'use strict';


class RemoteAuthenticationServer {
	constructor(service) {
		this.service = service;
		this.global = service.global;
		
		this.rest_server_url = service.global.config['authkey_server_url'];
		this.rest_server_api_path = service.global.config['authkey_server_api_path'];
	}
	
	getSessionStatus(session) {
		var global = this.global;
		var sessionuuid = session.getSessionUUID();
		
		var rest_server_url = this.rest_server_url;
		var	rest_server_api_path = this.rest_server_api_path;
		
		var restcon = session.getRestConnection(rest_server_url, rest_server_api_path);
		
		var sessionstatus = [];
		var finished = false;
		
		sessionstatus['sessionuuid'] = sessionuuid;
		
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
		var sessionuuid = session.getSessionUUID();
		
		var rest_server_url = this.rest_server_url;
		var	rest_server_api_path = this.rest_server_api_path;
		
		var restcon = session.getRestConnection(rest_server_url, rest_server_api_path);
		
		var userdetails;
		var finished = false;
		
		try {
			var resource = "/session/" + sessionuuid + "/user";
			
			restcon.rest_get(resource, function (err, res) {
				if (res) {
					global.log('success calling ' + resource +' result is: ' + JSON.stringify(res));
					
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