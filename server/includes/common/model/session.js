/**
 * 
 */
'use strict';

var SessionSection = class {
	constructor(global, sessionuuid, name) {
		this.global = global;
		this.sessionuuid = sessionuuid;
		this.name = name;
		
		this.events = [];
		
		this.uuid = global.guid();

		this.session = null;
		
		this.record('section_opened_on');
		
		global.log('opening session section ' + this.uuid + (this.name ? ' with name "' + this.name : '"'));
		
		if (typeof SessionSection.opensectionnum === "undefined") {
			SessionSection.opensectionnum = 1;
			SessionSection.opensectionmax = 1;
		}
		else
			SessionSection.opensectionnum++;
		
		if (SessionSection.opensectionmax < SessionSection.opensectionnum)
			SessionSection.opensectionmax = SessionSection.opensectionnum;
		
		global.log('number of concurrent session section = ' + SessionSection.opensectionnum + ' (max seen = ' + SessionSection.opensectionmax + ')');

		
	}
	
	getSession() {
		if (this.session)
			return this.session;
		
		var global = this.global;

		var requested_on = Date.now();
		this.record('session_requested_on');
		
		this.session = Session.getSession(this.global, this.sessionuuid);
		
		var retrieved_on = Date.now();
		this.record('session_retrieved_on');
		
		global.log('retrieving session ' + (this.name ? 'for "' + this.name + '" ' : '') + 'took ' + (retrieved_on - requested_on) + ' ms');
		
		return this.session;
	}
	
	record(eventname) {
		var global = this.global;
		var now = Date.now();

		this.events.push({name: eventname, time: now});
	}
	
	close() {
		var global = this.global;

		global.log('closing session section ' + this.uuid + (this.name ? ' with name "' + this.name + '"': ''));
		
		this.record('section_opened_on');
		
		var opened_on = this.events[0].time;
		var closed_on = Date.now();
		
		global.log('session section ' +  (this.name ? '"' +this.name + '" ' : '') + 'stayed open for ' + (closed_on - opened_on) + ' ms');
			
		SessionSection.opensectionnum--;
		
		global.log('number of concurrent session section = ' + SessionSection.opensectionnum);	}
	
};

var _SessionInitLatch = class {
	
	constructor(global, session) {
		this.global = global;
		this.session = session;
		
		this.released = false;
		this.released_at = null;
		
		this.waitstarted = null;
	}
	
	await(maxtime, callback) {
		var global = this.global;
		var session = this.session;
		
		var self = this;
		
		this.waitstarted = Date.now();

		while((!session.initializationfinished) && (maxtime > 0 ? ((Date.now() - this.waitstarted) < maxtime) : true)) {
			global.deasync().runLoopOnce(this);
		}
		
		this.released = true;
		this.released_at = Date.now();

		if (callback)
			callback(this);
		
	}
	
	static get(session) {
		if (!_SessionInitLatch.map)
			_SessionInitLatch.map = Object.create(null);
		
		var key = session.getSessionUUID();
		
		if (!_SessionInitLatch.map[key]) {
			var global = session.getGlobalInstance();
			_SessionInitLatch.map[key] = new _SessionInitLatch(global, session);
		}
		
		// remove old latches
    	var now = Date.now();
    	
		for (var key in _SessionInitLatch.map) {
		    if (!_SessionInitLatch.map[key]) continue;
			
		    var latch = _SessionInitLatch.map[key];
		    
		    if ((latch) && (latch.session) && (latch.session.isready))
		    	if (((now - latch.released_at) > 10000) && ((now - latch.waitstarted) > 20000))
		    	delete _SessionInitLatch.map[key];
		}
		
		return _SessionInitLatch.map[key];
	}
};


class SessionMap {
	constructor(global) {
		this.global = global;
		
		this.map = Object.create(null); // use a simple object to implement the map
	}
	
	getSession(uuid) {
		var key = uuid.toString().toLowerCase();
		
		if (key in this.map) {
			var session = this.map[key];
			
			session.ping();
			
			// time to check on the database
			if (session.isAuthenticated()) {
				if (!session.checkAuthenticationStatus())
					session.logout();
			}
			
			return session;
		}
		else {
			var global = this.global;
			
			global.log('session not found in map: ' + key);
		}
	}
	
	pushSession(session, bfastpush = false) {
		this.garbage();

		var key = session.session_uuid.toString().toLowerCase();
		
		var global = this.global;
		global.log('Pushing session in map: ' + key);

		this.map[key] = session;
		
		if (bfastpush === true)
			return;
		
		// should put session in map before saving
		// to avoid re-entrance when mysql's async
		// is letting another call be processed

		// check if it exists in the persistence layer
		var array = Session._sessionRecord(global, key);
		
		if (array && (array['uuid'])) {
			session._init(array);
		}
		
		session.ping();

		session.save();
	}
	
	removeSession(session) {
		var key = session.session_uuid.toString().toLowerCase();
		
		var global = this.global;
		global.log('Removing session from map: ' + key);

		delete this.map[key];
	}
	
	count() {
		return Object.keys(this.map).length
	}
	
	empty() {
		this.map = Object.create(null);
	}
	
	garbage() {
		var session;
		var self = this;

		Object.keys(this.map).forEach(function(key) {
		    session = self.map[key];
		    
		    if (session.isObsolete())
		    	self.removeSession(session);
		});		
	}
}

//var _sessionmap;

class Session {
	constructor(global) {
		this.global = global;
		
		this.ethereum_node = null;
		
		this.session_uuid = null;
		
		
		this.useruuid = null;
		this.user = null;
		
		this.creation_date = Date.now();
		this.last_ping_date = Date.now();
		
		this.issticky = global.areSessionsSticky();
		
		// initialization
		this.isready = false;

		// authentication
		this.isauthenticated = false;
		
		// object map
		this.objectmap = Object.create(null);
		
		this.sessionvar = {}; // saved in persistence layer
	}
	
	getGlobalInstance() {
		return this.global;
	}
	
	getSessionUUID() {
		return this.session_uuid;
	}
	
	guid() {
		return this.global.guid();
	}
	
	// persistence
	isSticky() {
		return (this.issticky !== false);
	}
	
	openSection(name) {
		var global = this.global;
		var sessionuuid = this.sessionuuid;
		var section = Session.openSessionSection(global, sessionuuid);
		
		section.session = this;
	}
	
	closeSection(section) {
		section.close();
	}
	
	/*_acquiremutex(mutextype) {
		var global = this.global;
		
		// we create a mutex to acquire a lock
		var SessionMutex = require('./sessionmutex.js');
		
		var sessionmutex = SessionMutex.get(this, mutextype);
		
		global.log('test mutex ' + sessionmutex.instanceuuid + ' to be acquired');
		sessionmutex.acquire(5000, function(mutex) {
			global.log('test mutex ' + mutex.instanceuuid + ' has been acquired');
			setTimeout(function() {
				sessionmutex.release(function() {
					global.log('test mutex ' + mutex.instanceuuid + ' released after 3 seconds');
				});
			  }, 500);
			
		});

		global.log('mutex ' + sessionmutex.instanceuuid + ' of type ' + mutextype + ' to be acquired');
		sessionmutex.acquire(5000, function(mutex) {
			global.log('mutex ' + mutex.instanceuuid + ' of type ' + mutextype + ' has been acquired');
		});
		
		return sessionmutex;
	}*/
	
	save() {
		var global = this.global;
		
		global.log('Session.save called');

		var commonservice = global.getServiceInstance('common');
		var server = commonservice.getServerInstance();
		var persistor = server.getPersistor();
		
		if (persistor.canPersistData()) {
			/*if (this.issticky === false) {
				global.log('Session.save SESSION IS NOT STICKY!!!');
				
				// we acquire a write lock
				var sessionmutex = this._acquiremutex('session_write');
			}*/
			
			var array = {};
			
			array['sessionuuid'] = this.session_uuid;
			
			var user = this.getUser();
			array['useruuid'] = (user ? user.getUserUUID() : null);
			
			array['createdon'] = this.creation_date;
			array['lastpingon'] = this.last_ping_date;
			
			array['isauthenticated'] = this.isauthenticated;
			
			var jsonstring = JSON.stringify(this.sessionvar);
			array['sessionvariables'] =  Buffer.from(jsonstring, 'utf8');
			
			persistor.putSession(array);
			
			/*if (sessionmutex)
				sessionmutex.release();*/
		}
		
	}
	
	_saveState() {
		this.global.log('Session._saveState called');

		var commonservice = this.global.getServiceInstance('common');
		var server = commonservice.getServerInstance();
		var persistor = server.getPersistor();
		
		if (persistor.canPersistData()) {
			/*if (this.issticky === false) {
				global.log('Session._saveState SESSION IS NOT STICKY!!!');
				
				// we acquire a write lock
				var sessionmutex = this._acquiremutex('session_write');
			}*/
			
			var array = {};
			
			array['sessionuuid'] = this.session_uuid;
			
			var user = this.getUser();
			array['useruuid'] = (user ? user.getUserUUID() : null);
			
			array['createdon'] = this.creation_date;
			array['lastpingon'] = this.last_ping_date;
			
			array['isauthenticated'] = this.isauthenticated;
			
			persistor.putSessionState(array);
			
			if (sessionmutex)
				sessionmutex.release();
		}
		
	}
	
	_saveVariables() {
		this.global.log('Session._saveVariables called');

		var commonservice = this.global.getServiceInstance('common');
		var server = commonservice.getServerInstance();
		var persistor = server.getPersistor();
		
		if (persistor.canPersistData()) {
			/*if (this.issticky === false) {
				global.log('Session._saveVariables SESSION IS NOT STICKY!!!');
				
				// we create a mutex to acquire a write lock
				var sessionmutex = this._acquiremutex('session_write');
			}*/
			
			var array = {};
			
			array['sessionuuid'] = this.session_uuid;
			
			var user = this.getUser();
			array['useruuid'] = (user ? user.getUserUUID() : null);
			
			array['createdon'] = this.creation_date;
			array['lastpingon'] = this.last_ping_date;
			
			array['isauthenticated'] = this.isauthenticated;
			
			var jsonstring = JSON.stringify(this.sessionvar);
			array['sessionvariables'] =  Buffer.from(jsonstring, 'utf8');
			
			
			persistor.putSessionVariables(array);
			
			/*if (sessionmutex)
				sessionmutex.release();*/
		}
		
	}
	
	_init(array) {
		this.global.log('Session._init called');

		if (array['useruuid'] !== undefined)
			this.useruuid = array['useruuid'];
		
		if (array['lastpingon'] !== undefined)
			this.last_ping_date = array['lastpingon'];
		
		if (array['isauthenticated'] !== undefined)
			this.isauthenticated = array['isauthenticated'];
		
		if (array['sessionvariables'] !== undefined) {
			try {
				var jsonstring = array['sessionvariables'].toString('utf8');
				this.sessionvar = JSON.parse(jsonstring);
			}
			catch(e) {
				
			}
		}
		
		//this.global.log('read sessionvar is ' + JSON.stringify(this.sessionvar));
	}
	
	_read() {
		var commonservice = this.global.getServiceInstance('common');
		var server = commonservice.getServerInstance();
		var persistor = server.getPersistor();
		
		if (persistor.canPersistData()) {
			var array = persistor.getSession(this.sessionuuid);
			
			this._init(array);
		}
		
	}
	
	getClass() {
		return Session;
	}
	


	// session var
	pushObject(key, object) {
		var keystring = key.toString().toLowerCase();
		this.objectmap[keystring] = object;
	}
	
	getObject(key) {
		if (key in this.objectmap) {
			return this.objectmap[key];
		}
	}
	
	removeObject(key) {
		var keystring = key.toString().toLowerCase();
		delete this.map[key];
	}
	
	setSessionVariable(key, value) {
		var global = this.global;
		
		this.sessionvar[key] = value;
		
		// save sessionvariables
		this.save();
	}
	
	getSessionVariable(key) {
		var global = this.global;
		
		/*if (this.issticky === false) {
			//global.log('Session.getSessionVariable SESSION IS NOT STICKY key ' + key);
			
			// we force to read variables from database in case another process
			// changed the value of the key
			this._read();
		}*/
		
		if (key in this.sessionvar) {
			return this.sessionvar[key];
		}
	}
	
	getSessionVariables() {
		var array = [];
		
		for (var key in this.sessionvar) {
		    if (!this.sessionvar[key]) continue;
		    
		    var entry = {};
		    entry.key = key;
		    entry.value = this.sessionvar[key];
		    array.push(entry);
		}
		
		return array;
	}
	
	
	// ientification and authentication
	isAnonymous() {
		var global = this.global;
		
		// invoke hooks to let services interact with the session object
		var orguseruuid = this.useruuid;
			
		var result = [];
		
		var params = [];
		
		params.push(this);

		var ret = global.invokeHooks('isSessionAnonymous_hook', result, params);
		
		if (ret && result && result.length) {
			global.log('isSessionAnonymous_hook result is ' + JSON.stringify(result));
		}
		
		var newuseruuid = this.useruuid;
		
		if (orguseruuid != newuseruuid) {
			// a hook changed the useruuid
			this.save();
		}

		// current check
		var user = this.getUser();
		return (user === null);
	}
	
	isAuthenticated() {
		var global = this.global;
		
		if (this.isAnonymous())
			return false;
		
		// invoke hooks to let services interact with the session object
		var orgisauthenticated = this.isauthenticated;
		var orguseruuid = this.useruuid;
		
		var result = [];
		
		var params = [];
		
		params.push(this);

		var ret = global.invokeHooks('isSessionAuthenticated_hook', result, params);
		
		if (ret && result && result.length) {
			global.log('isSessionAuthenticated_hook result is ' + JSON.stringify(result));
		}
		
		var newisauthenticated  = this.isauthenticated;
		var newuseruuid = this.useruuid;
		
		if (orgisauthenticated != newisauthenticated) {
			// a hook changed the authentication flag
			this.save();
		}

		// current check
		var now = Date.now();
		
		if ((now - this.last_ping_date) < 2*60*60*1000) {
			
			if (this.isauthenticated)
				return true;
			else
				return false;
		}
		else {
			this.isauthenticated = false;
			return false;
		}
	}
	
	checkAuthenticationStatus() {
		if (this.isauthenticated)
			return true;
		else
			return false;
	}
	
	logout() {
		this.isauthenticated = false;
		
		this.save();
	}
	
	isObsolete() {
		var now = Date.now();
		return ((now - this.last_ping_date) > 24*60*60*1000)
	}
	
	ping() {
		this.last_ping_date = Date.now();
		
		//this._saveState();
		// should update only lastpingon
	}
	
	impersonateUser(user) {
		this.user = user;
		this.useruuid = user.getUserUUID();;
		this.isauthenticated = true;
		
		this.save();
	}
	
	disconnectUser() {
		this.user = null;
		this.useruuid = null;
		this.isauthenticated = false;
		
		this.save();
	}
	
	getUser() {
		if (this.useruuid && !this.user) {
			// restored from database
			var commonservice = this.global.getServiceInstance('common');

			this.user = commonservice.createBlankUserInstance();
			
			// TODO: should access original auth service to get user details
			this.user.setUserUUID(this.useruuid);
		}
			
		return this.user;
	}
	
	getUserUUID() {
		return this.useruuid;
	}
	
	// mysql calls
	getMySqlConnection() {
		var global = this.global;
		
		return global.getMySqlConnection();
	}
	
	// rest calls
	getRestConnection(rest_server_url, rest_server_api_path) {
		var RestConnection = require('./restconnection.js');
		
		return new RestConnection(this, rest_server_url, rest_server_api_path);
	}
	
	// privileges
	hasSuperAdminPrivileges() {
		if (this.isAnonymous())
			return false;
		
		if (!this.isAuthenticated())
			return false;
		
		var user = this.getUser();
		
		return user.isSuperAdmin();
	}
	
	// static
	static createBlankSession(global) {
		var session = new Session(global);
		session.session_uuid = session.guid();
		
		var sessionmap = Session.getSessionMap(global);

		sessionmap.pushSession(session);
		
		return session;
	}
	
	static getSessionMap(global) {
		if (!global) {
			console.log('global is null');
			console.trace('must pass valid global');
			
			throw 'Session.getSessionMap called with a null value';
		}
		
		if (global._sessionmap)
			return global._sessionmap;
		
		global._sessionmap = new SessionMap(global);
		
		return global._sessionmap;
	}
	
	static _sessionRecord(global, sessionuuid) {
		var commonservice = global.getServiceInstance('common');
		var server = commonservice.getServerInstance();
		var persistor = server.getPersistor();
		
		global.log('Session._sessionRecord called for ' + sessionuuid);
		
		if (persistor.canPersistData()) {
			global.log('Session._sessionRecord reading in persistor session ' + sessionuuid);
			var array = persistor.getSession(sessionuuid);
			global.log('Session._sessionRecord session ' + sessionuuid + ' array is ' + JSON.stringify(array));
		}
		else {
			global.log('Session._sessionRecord session ' + sessionuuid + ' persistor says can not persist data');
		}
		
		return array;
	}
	
	static getSession(global, sessionuuid) {
		var session;
		
		if (!sessionuuid) {
			// create on-the-fly a new session object
			return new Session(global);
		}
		
		if (global.areSessionsSticky()) {
			// sticky sessions (stateful server mode)
			var sessionmap = Session.getSessionMap(global);
			
			var key = sessionuuid.toString();
			var mapvalue = sessionmap.getSession(key);
			
			var account;
			
			if (mapvalue !== undefined) {
				// is already in map
				session = mapvalue;
			}
			else {
				// create a new session object
				session = new Session(global);
				session.session_uuid = sessionuuid;
				
				global.log('creating session object for ' + sessionuuid);
				
				// we push the object right away
				// to avoid having persistence async operation creating a re-entry
				sessionmap.pushSession(session, true); // fast push to avoid calls to mysql
				
			}
			
			if (session.isready === false) {
				session.initializationfinished = false;
				
				global.log('creating session initialization promise for sticky session ' + sessionuuid);
				
				// we may go through this section several times because of issues with re-entrance
				// and nodejs/javascript mono-threaded approach of stacking execution bits
				
				/// create a latch to start unstacking calls once one of them has finished the initialization
				var sessionlatch = _SessionInitLatch.get(session);
				
				global.log('session sessionlatch retrieved for sticky session ' + sessionuuid);
				
				var promise = new Promise(function _initStickySessionObject(resolve, reject) {
					try {
						global.log('starting initialization of sticky session object for ' + sessionuuid);

						// check to see if it's in the persistence layer
						var array = Session._sessionRecord(global, sessionuuid);
						
						if (array && (array['uuid'])) {
							session._init(array);
						}
						
						session.ping();

						session.save();

						// invoke hooks to let services interact with the new session object
						var result = [];
						
						var params = [];
						
						params.push(session);

						var ret = global.invokeHooks('createSession_hook', result, params);
						
						if (ret && result && result.length) {
							global.log('createSession_hook result is ' + JSON.stringify(result));
						}
						
						session.isready = true; // end of pseudo lock on session initialization
						
						global.log('sticky session ' + sessionuuid + ' is now ready!');

						resolve(true);
					}
					catch(e) {
						var error = 'exception in session creation promise: ' + e;
						global.log(error);
						
						reject(error);
				}
				})
				.then(function (res) {
					global.log('session ' + sessionuuid + ' resolved the initialization promise');

					session.initializationfinished = true;
					
					return Promise.resolve(true);
				})
				.catch(function (err) {
					global.log("error in session initialization for sessionuuid " + sessionuuid + ": " + err);
					
					session.initializationfinished = true;
					
					return Promise.reject("error in session initialization for sessionuuid " + sessionuuid + ": " + err);
				});
				
				global.log('session initialization promise created for session ' + sessionuuid);
				
				sessionlatch.await(10000, function() {
					global.log('session going out of initialization latch for session ' + sessionuuid);
				});
				
				global.log('session initialized for session ' + sessionuuid);
				
			}
			
		}
		else {
			// non sticky session (stateless server mode)
			// we don't keep sessions in memory beyond each call
			var calluuid = global.guid();
			
			// create a new session object
			session = new Session(global);
			session.session_uuid = sessionuuid;
			
			session._calluuid = calluuid;
			
			global.log('creating non sticky session object for ' + sessionuuid + ' call ' + calluuid);
			
			var initializationfinished = false;
			
			global.log('creating session initialization promise for non sticky session ' + sessionuuid + ' call ' + calluuid);
			var initializationpromise = new Promise(function _initTransientSessionObject(resolve, reject) {
				try {
					global.log('starting initialization of non sticky session object for ' + sessionuuid + ' call ' + calluuid);

					// check to see if it's in the persistence layer
					var array = Session._sessionRecord(global, sessionuuid);
					
					if (array && (array['uuid'])) {
						session._init(array);
					}
					
					//session.ping();

					//session.save();

					// invoke hooks to let services interact with the new session object
					var result = [];
					
					var params = [];
					
					params.push(session);

					var ret = global.invokeHooks('createSession_hook', result, params);
					
					if (ret && result && result.length) {
						global.log('createSession_hook result is ' + JSON.stringify(result));
					}
					
					session.isready = true;
					
					global.log('non sticky session object for ' + sessionuuid + ' call ' + calluuid + ' is ready');

					resolve(true);
				}
				catch(e) {
					var error = 'exception in session creation promise: ' + e;
					global.log(error);
					
					reject(error);
				}
			})
			.then( (res) => {
				global.log('session ' + sessionuuid + ' is now ready!');

				initializationfinished = true;
			})
			.catch( (err) => {
				console.log("error in session initialization for sessionuuid " + sessionuuid + ": " + err);
				
				initializationfinished = true;
			});
			
			global.log('session initialization promise created for session ' + sessionuuid);

			while(!initializationfinished)
			{require('deasync').runLoopOnce();}
			
			global.log('session object initialized for session ' + sessionuuid + ' call ' + calluuid);
		}
		

		
		return session;
	}
	
	static putSession(global, session) {
		var sessionuuid = session.getSessionUUID();
		
		if (Session.getSession(global, sessionuuid))
			throw 'session has already been pushed: ' + sessionuuid;
		
		var sessionmap = Session.getSessionMap(global);
		
		sessionmap.pushSession(session);
	}
	
	static openSessionSection(global, sessionuuid, sectionname) {
		return new SessionSection(global, sessionuuid, sectionname);
	}

}


module.exports = Session;