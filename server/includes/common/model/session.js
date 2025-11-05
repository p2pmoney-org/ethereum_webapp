/**
 * 
 */
'use strict';

var SessionSection = class {
	constructor(global, sessionuuid, name, calltoken) {
		this.global = global;
		this.session_uuid = sessionuuid;
		this.sessionuuid = sessionuuid; // for obsolete code not using SessionSection.getSessionUUID
		this.name = name;

		// while we don't pass the context down to the the RemoteAuthentication server
		var authkeyservice = global.getServiceInstance('authkey');
		this.authkey_server_passthrough = authkeyservice.authkey_server_passthrough;

		this.calltoken = calltoken;

		if (calltoken && calltoken.auth) {
			var authurl = calltoken.auth;

			this.auth_url_hash = authkeyservice.getAuthUrlHash(authurl);
		}
		
		this.events = [];
		
		this.uuid = global.guid();

		this.session = null;

		this.no_reentrancy = false;

		this.isanonymous = null;
		this.isauthenticated = null;

		this.section_variables = {};
		
		this.record('section_opened_on');
		
		global.log('opening session section ' + this.uuid + (this.name ? ' with name "' + this.name + '"': ''));
		
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

	getSessionUUID() {
		return this.session_uuid;
	}

	getCallToken() {
		return this.calltoken;
	}

	setNoReentrancy(choice) {
		this.no_reentrancy = choice;
	}
	
	// async version
	async getSessionAsync() {
		if (this.session)
			return this.session;
		
		var global = this.global;

		let requested_on = Date.now();
		this.record('session_requested_on');

		let mainsession;

		if (this.no_reentrancy === true) {
			// we get mainsession directly from the SessionMap
			// to avoid a deadly loop when using Session.getSessionAsync
			let sessionmap = Session.getSessionMap(this.global);

			let key = this.session_uuid.toString();
			mainsession = sessionmap.map[key];
		}
		else {
			mainsession = await Session.getSessionAsync(this.global, this.session_uuid, this);
		}
		

		if (this.authkey_server_passthrough === true) {
			// we allow other authentication servers than the default one
			if (!this.auth_url_hash || (this.auth_url_hash == 'default'))
			this.session = mainsession;
			else {
				// transient variables (not saved in database)
				var childsessionmap = mainsession.getChildSessionMap();

				if (childsessionmap[this.auth_url_hash])
					this.session = childsessionmap[this.auth_url_hash];
				else {
					// note: as long as we do not pass the SessionSection down
					// to the the RemoteAuthentication server, we are
					// forced to spawn a new session to keep the authentication
					// context in this child session instead of in the section
					this.session = await Session.createBlankSessionAsync(global);

					this.session.auth_url_hash = this.auth_url_hash;
					this.session.auth_url = this.calltoken.auth;
					this.session.attachAsChild(mainsession);

					childsessionmap[this.auth_url_hash] = this.session;
				}
			}
		}
		else {
			this.session = mainsession;
		}
		
		
		let retrieved_on = Date.now();
		this.record('session_retrieved_on');
		
		global.log('retrieving session ' + (this.name ? 'for "' + this.name + '" ' : '') + 'took ' + (retrieved_on - requested_on) + ' ms');
		
		return this.session;
	}

	async getRootSessionAsync() {
		if (this.section_variables.root_session)
			return this.section_variables.root_session;
			

		// we get mainsession directly from the SessionMap
		// to avoid a deadly loop when using Session.getSessionAsync
		var sessionmap = Session.getSessionMap(this.global);

		var key = this.session_uuid.toString();
		var mainsession = sessionmap.map[key];
	
		if (mainsession.getParentSession()) {
			return Promise.reject("session section has a session uuid that is not a root session!");
		}

		this.section_variables.root_session = mainsession;

		return this.section_variables.root_session;
	}

	async getRestConnectionAsync(rest_server_url, rest_server_api_path) {
		let mainsession = await this.getRootSessionAsync();
		
		return mainsession.getRestConnection(rest_server_url, rest_server_api_path);
	}

	async getAuthKeyRestConnectionAsync(rest_server_url, rest_server_api_path) {
		let mainsession = await this.getRootSessionAsync();

		return mainsession.getAuthKeyRestConnectionAsync(rest_server_url, rest_server_api_path, this.calltoken);
	}


	// sync version
	getSession() {
		if (this.session)
			return this.session;
		
		var global = this.global;

		var requested_on = Date.now();
		this.record('session_requested_on');
		
		var mainsession = Session.getSession(this.global, this.session_uuid);

		if (this.authkey_server_passthrough === true) {
			// we allow other authentication servers than the default one
			if (!this.auth_url_hash || (this.auth_url_hash == 'default'))
			this.session = mainsession;
			else {
				// transient variables (not saved in database)
				var childsessionmap = mainsession.getChildSessionMap();

				if (childsessionmap[this.auth_url_hash])
					this.session = childsessionmap[this.auth_url_hash];
				else {
					// note: as long as we do not pass the SessionSection down
					// to the the RemoteAuthentication server, we are
					// forced to spawn a new session to keep the authentication
					// context in this child session instead of in the section
					this.session = Session.createBlankSession(global);

					this.session.auth_url_hash = this.auth_url_hash;
					this.session.auth_url = this.calltoken.auth;
					this.session.attachAsChild(mainsession);

					childsessionmap[this.auth_url_hash] = this.session;
				}
			}
		}
		else {
			this.session = mainsession;
		}
		
		
		var retrieved_on = Date.now();
		this.record('session_retrieved_on');
		
		global.log('retrieving session ' + (this.name ? 'for "' + this.name + '" ' : '') + 'took ' + (retrieved_on - requested_on) + ' ms');
		
		return this.session;
	}

	_safe_session() {
		// to get session from section or session objects
		return this.getSession();
	}

	_root_session() {
		// to get the mainsession, while we have the workaround for remote authentication
		var session = this.session;
		return session._root_session();
	}
	

	
	async _safe_sessionAsync() {
		// to get session from section or session objects
		return this.getSessionAsync();
	}
	

	isAnonymous() {
		// we cache the value within the span
		// of a call materialized by a section
		if (this.isanonymous != undefined)
			return this.isanonymous;
		else {
			var session = this.getSession();
			this.isanonymous = session.isAnonymous();

			return this.isanonymous;
		}
	}
	
	async isAnonymousAsync() {
		// we cache the value within the span
		// of a call materialized by a section
		if (this.isanonymous != undefined)
			return this.isanonymous;
		else {
			var session = await this.getSessionAsync();
			this.isanonymous = await session.isAnonymousAsync(this);

			return this.isanonymous;
		}
	}
	
	isAuthenticated() {
		// we cache the value within the span
		// of a call materialized by a section
		if (this.isauthenticated != undefined)
			return this.isauthenticated;
		else {
			var session = this.getSession();
			this.isauthenticated = session.isAuthenticated();

			return this.isauthenticated;
		}
	}
	
	async isAuthenticatedAsync() {
		// we cache the value within the span
		// of a call materialized by a section
		if (this.isauthenticated != undefined)
			return this.isauthenticated;
		else {
			var session = await this.getSessionAsync();
			this.isauthenticated = await session.isAuthenticatedAsync(this);

			return this.isauthenticated;
		}
	}

	// user
	async getUserAsync() {
		var session = await this.getSessionAsync();

		if (session)
		return session.getUser();
	}
	
	async getUserUUIDAsync() {
		var session = await this.getSessionAsync();

		if (session)
		return session.getUserUUID();
	}
	


	// transient variable (that do not outlive session object,
	// sticky or not)
	async pushObjectAsync(key, object) {
		var session = await this.getSessionAsync();

		return session.pushObject(key, object);
	}
	
	pushObject(key, object) {
		var session = this.getSession();

		return session.pushObject(key, object);
	}
	
	async getObjectAsync(key) {
		var session = await this.getSessionAsync();

		return session.getObject(key);
	}
	
	getObject(key) {
		var session = this.getSession();

		return session.getObject(key);
	}
	
	async removeObjectAsync(key) {
		var session = await this.getSessionAsync();

		return session.removeObject(key);
	}

	removeObject(key) {
		var session = this.getSession();

		return session.removeObject(key);
	}


	// session variables (saved in database
	// session table)
	async setSessionVariableAsync(key, value) {
		var session = await this.getSessionAsync();
		
		return session.setSessionVariableAsync(key, value);
	}
	
	async getSessionVariableAsync(key) {
		var session = await this.getSessionAsync();

		return session.getSessionVariable(key);
	}
	
	getSessionVariable(key) {
		var session = this.getSession();

		return session.getSessionVariable(key);
	}
	
	// events
	record(eventname) {
		var global = this.global;
		var now = Date.now();

		this.events.push({name: eventname, time: now});
	}

	// clone current section for same session
	async cloneAsync(name) {
		var session = await this.getSessionAsync();
		var section = session.openSection(name);
		
		return section;
	}
	
	clone(name) {
		var session = this.getSession();
		var section = session.openSection(name);
		
		return section;
	}
	
	async guidAsync() {
		var session = await this.getSessionAsync();

		if (session)
		return session.guidAsync();
		else
		return this.global.guid();
	}
	
	guid() {
		var session = this.getSession();

		if (session)
		return session.guid();
		else
		return this.global.guid();
	}
	
	// persistence
	async isStickyAsync() {
		var session = await this.getSessionAsync();

		if (session)
		return session.isSticky();
		else
		return false;
	}
	
	isSticky() {
		var session = this.getSession();

		if (session)
		return session.isSticky();
		else
		return false;
	}
	
	close() {
		var global = this.global;

		global.log('closing session section ' + this.uuid + (this.name ? ' with name "' + this.name + '"': ''));
		
		this.record('section_closed_on');
		
		var opened_on = this.events[0].time;
		var closed_on = Date.now();
		
		global.log('session section ' +  (this.name ? '"' +this.name + '" ' : '') + 'stayed open for ' + (closed_on - opened_on) + ' ms');
			
		SessionSection.opensectionnum--;
		
		global.log('number of concurrent session section = ' + SessionSection.opensectionnum);
	}
	
};

var _SessionInitLatch = class {
	
	constructor(global, session) {
		this.global = global;
		this.session = session;
		
		this.released = false;
		this.released_at = null;
		
		this.waitstarted = null;

		this.intialization_promise = null;
	}

	// async version
	getInitializationPromise(promise) {
		return this.intialization_promise;
	}

	setInitializationPromise(promise) {
		this.intialization_promise = promise;
	}
	
	// sync version
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
	
	// static factory
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
	
	knowsSession(uuid) {
		if (!uuid) return false;

		var key = uuid.toString().toLowerCase();
		
		if (key in this.map)
		return true;
		else
		return false;
	}

	async getSessionAsync(uuid, session_section) {
		var key = uuid.toString().toLowerCase();
		
		if (key in this.map) {
			let session = this.map[key];
			
			session.ping();
			
			// time to check on the database
			let isAuthenticated = await session.isAuthenticatedAsync(session_section);
			if (isAuthenticated) {
				if (!session.checkAuthenticationStatus())
					await session.logoutAsync();
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

	async pushSessionAsync(session, bfastpush = false) {
		this.garbageAsync()
		.catch(err => {}); // spawned

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
		var array = await Session._sessionRecordAsync(global, key);
		
		if (array && (array['uuid'])) {
			session._init(array);
		}
		
		session.ping();

		await session.saveAsync();
	}
	
	removeSession(session) {
		var key = session.session_uuid.toString().toLowerCase();
		
		var global = this.global;

		var result = [];
						
		var params = [];
		
		params.push(session);

		var ret = global.invokeHooks('removeSession_hook', result, params);
		
		if (ret && result && result.length) {
			global.log('removeSession_hook result is ' + JSON.stringify(result));
		}
		
		global.log('Removing session from map: ' + key);

		delete this.map[key];
	}
	
	async removeSessionAsync(session) {
		var key = session.session_uuid.toString().toLowerCase();
		
		var global = this.global;

		var result = [];
						
		var params = [];
		
		params.push(session);

		var ret = await global.invokeAsyncHooks('removeSession_asynchook', result, params);
		
		if (ret && result && result.length) {
			global.log('removeSession_asynchook result is ' + JSON.stringify(result));
		}
		
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
		
	async garbageAsync() {
		var keys = Object.keys(this.map);

		for (var i = 0; i <  keys.length; i++) {
		    let session = this.map[keys[i]];
		    
		    if (session.isObsolete())
		    	await this.removeSessionAsync(session);
		}	
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


		this.session_time_length = global.session_time_length;
		this.session_obsolence_length = (global.session_obsolence_length > 0 ? global.session_obsolence_length : 24*60*60*1000);
		
		// object map
		this.objectmap = Object.create(null); // only in memory
		
		// variables
		this.sessionvar = Object.create(null); // saved in persistence layer
	}
	
	getGlobalInstance() {
		return this.global;
	}
	
	getSessionUUID() {
		return this.session_uuid;
	}
	
	async guidAsync() {
		return this.global.guidAsync();
	}
	
	guid() {
		return this.global.guid();
	}
	
	// persistence
	isSticky() {
		return (this.issticky !== false);
	}
	
	// sections for call contexts
	openSection(name) {
		var global = this.global;
		var sessionuuid = this.session_uuid;
		var section = Session.openSessionSection(global, sessionuuid);
		
		section.session = this;

		return section;
	}
	
	closeSection(section) {
		section.close();
	}

	_safe_session() {
		// to get session from section or session objects
		return this;
	}

	_root_session() {
		// to get the mainsession, while we have the workaround for remote authentication
		var rootsession = this;

		while(rootsession.getParentSession()) {
			rootsession = rootsession.getParentSession();
		}
		
		return rootsession;
	}
	
	async _safe_sessionAsync() {
		// to get session from section or session objects
		return this;
	}
	
	// child sessions
	getChildSessionMap() {
		// transient variables (not saved in database)
		var childsessionmap = this.getObject('childsessionmap');
		
		if (!childsessionmap) {
			childsessionmap = Object.create(null);
			this.pushObject('childsessionmap', childsessionmap);
		}

		return childsessionmap;
	}

	getChildSessions() {
		var childsessionmap = this.getChildSessionMap();
		
		var array = [];
		
		for (var key in childsessionmap) {
		    if (!childsessionmap[key]) continue;
		    
		    array.push(childsessionmap[key]);
		}
		
		return array;
	}
	
	cleanChildSessions() {
		var session = this;

		var childsessionmap = session.getObject('childsessionmap');
		
		// empty map
		if (childsessionmap) {
			childsessionmap = Object.create(null);
			session.pushObject('childsessionmap', childsessionmap);
		}
	}
	
	getParentSession() {
		var session = this;

		var parentsession = session.getObject('parentsession');
		
		if (parentsession) {
			return parentsession;
		}
	}

	isRootSession() {
		var parentsession = this.getParentSession();

		return (parentsession ? false : true);
	}

	isChildSession() {
		var parentsession = this.getParentSession();
		
		return (parentsession ? true : false);
	}

	getRootSession() {
		var parentsession = this.getParentSession();
		var rootsession = this;

		while (parentsession) {
			rootsession = parentsession;
			parentsession = rootsession.getParentSession();
		}

		return rootsession;
	}
	
	
	attachAsChild(parentsession) {
		var session = this;

		if (parentsession) {
			var childsession = session;
			
			// detach from former parent (if any)
			childsession.detachAsChild()
			
			// attach to new
			var childsessionmap = parentsession.getChildSessionMap();
			
			// put child session in parent's child session map
			var parentsessionuuid = parentsession.getSessionUUID();
			var childsessionuuid = childsession.getSessionUUID();
			
			childsessionmap[childsessionuuid] = childsession;
			childsession.pushObject('parentsession', parentsession);
			
			console.log('attaching child session ' + childsessionuuid  + '  to ' + parentsessionuuid);
		}
	}
	
	detachAsChild() {
		var session = this;

		// former parent
		var oldparentsession = this.getParentSession();
		
		if (oldparentsession) {
			var childsession = session;
			var parentsession = oldparentsession;
			
			var childsessionmap = parentsession.getChildSessionMap();
			
			// remove child session from parent's child session map
			var parentsessionuuid = parentsession.getSessionUUID();
			var childsessionuuid = childsession.getSessionUUID();
			
			delete childsessionmap[childsessionuuid];
			childsession.pushObject('parentsession', null);
			
			console.log('detaching child session ' + childsessionuuid  + '  to ' + parentsessionuuid);
		}
	}

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

	async saveAsync() {
		var global = this.global;
		
		global.log('Session.saveAsync called');

		var commonservice = global.getServiceInstance('common');
		var server = commonservice.getServerInstance();
		var persistor = server.getPersistor();
		
		var canPersistData = await persistor.canPersistDataAsync();

		if (canPersistData) {
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
			
			await persistor.putSessionAsync(array);
			
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

	async _saveStateAsync() {
		this.global.log('Session._saveStateAsync called');

		var commonservice = this.global.getServiceInstance('common');
		var server = commonservice.getServerInstance();
		var persistor = server.getPersistor();
		
		var canPersistData = await persistor.canPersistDataAsync();

		if (canPersistData) {
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
			
			await persistor.putSessionStateAsync(array);
			
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

	async _saveVariablesAsync() {
		this.global.log('Session._saveVariablesAsync called');

		var commonservice = this.global.getServiceInstance('common');
		var server = commonservice.getServerInstance();
		var persistor = server.getPersistor();
		
		var canPersistData = await persistor.canPersistDataAsync();

		if (canPersistData) {
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
			
			
			await persistor.putSessionVariablesAsync(array);
			
			/*if (sessionmutex)
				sessionmutex.release();*/
		}
		
	}
	
	_init(array) {
		this.global.log('Session._init called');

		if (array['useruuid'] !== undefined)
			this.useruuid = array['useruuid'];
		
		if (array['createdon'] !== undefined)
			this.creation_date = array['createdon'];
		
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
			var array = persistor.getSession(this.session_uuid);
			
			this._init(array);
		}
		
	}
	
	async _readAsync() {
		var commonservice = this.global.getServiceInstance('common');
		var server = commonservice.getServerInstance();
		var persistor = server.getPersistor();
		
		var canPersistData = await persistor.canPersistDataAsync();

		if (canPersistData) {
			var array = await persistor.getSessionAsync(this.session_uuid);
			
			this._init(array);
		}
		
	}
	
	getClass() {
		return Session;
	}
	


	// transient variable (that do not outlive session object,
	// sticky or not)
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


	// session variables (saved in database
	// session table)
	setSessionVariable(key, value) {
		var global = this.global;
		
		this.sessionvar[key] = value;
		
		// save sessionvariables
		this.save();
	}
	
	async setSessionVariableAsync(key, value) {
		var global = this.global;
		
		this.sessionvar[key] = value;
		
		// save sessionvariables
		await this.saveAsync();
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
	
	
	// identification and authentication
	isAnonymous() {
		var global = this.global;

		global.log('DO NOT USE Session.isAnonymous, use Session.isAnonymousAsync');
		// debugger
 		var finished = false;
		var isA = true;

		this.isAnonymousAsync()
		.then(res => {
			isA = res;
			finished = true;
		})
		.catch( err => {
			finished = true;
		});

		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce();}
		
		return isA;
	}
	
	async isAnonymousAsync(session_section) {
		var global = this.global;
		
		// invoke hooks to let services interact with the session object
		var orguseruuid = this.useruuid;
			
		var result = [];
		
		var params = [];
		
		params.push(this);
		params.push(session_section);

		var ret = global.invokeHooks('isSessionAnonymous_hook', result, params); // legacy
		ret = await global.invokeAsyncHooks('isSessionAnonymous_asynchook', result, params); 
		
		if (ret && result && result.length) {
			global.log('isSessionAnonymous_hook result is ' + JSON.stringify(result));
		}
		
		var newuseruuid = this.useruuid;
		
		if (orguseruuid != newuseruuid) {
			// a hook changed the useruuid
			await this.saveAsync();
		}

		// current check
		var user = this.getUser();
		return (user === null);
	}
	
	isAuthenticated() {
		var global = this.global;
		
		global.log('DO NOT USE Session.isAuthenticated, use Session.isAuthenticatedAsync');
		// debugger;
 		var finished = false;
		var isA = true;

		this.isAuthenticatedAsync()
		.then(res => {
			isA = res;
			finished = true;
		})
		.catch( err => {
			finished = true;
		});

		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce();}
		
		return isA;
	}
	
	async isAuthenticatedAsync(session_section) {
		var global = this.global;
		
		var isAnonymous = await this.isAnonymousAsync(session_section);
		if (isAnonymous)
			return false;
		
		// invoke hooks to let services interact with the session object
		var orgisauthenticated = this.isauthenticated;
		var orguseruuid = this.useruuid;
		
		var result = [];
		
		var params = [];
		
		params.push(this);
		params.push(session_section);

		var ret = global.invokeHooks('isSessionAuthenticated_hook', result, params); // legacy
		ret = await global.invokeAsyncHooks('isSessionAuthenticated_asynchook', result, params); 
		
		if (ret && result && result.length) {
			global.log('isSessionAuthenticated_hook result is ' + JSON.stringify(result));
		}
		
		var newisauthenticated  = this.isauthenticated;
		var newuseruuid = this.useruuid;
		
		if (orgisauthenticated != newisauthenticated) {
			// a hook changed the authentication flag
			await this.saveAsync();
		}

		// current check
		var now = Date.now();
		var session_time_length = this.session_time_length;
		
		if ((session_time_length == -1) || ((now - this.creation_date) < session_time_length)) {
			
			if (this.isauthenticated)
				return true;
			else
				return false;
		}
		else {
			if (this.authenticated)
				global.log('session ' + this.getSessionUUID() + ' has expired after ' + (now - this.creation_date) + ' from creation');

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
	
	async logoutAsync() {
		this.isauthenticated = false;
		
		await this.saveAsync();
	}
	
	isObsolete() {
		var now = Date.now();
		return ((now - this.last_ping_date) > this.session_obsolence_length)
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
	
	async impersonateUserAsync(user) {
		this.user = user;
		this.useruuid = user.getUserUUID();;
		this.isauthenticated = true;
		
		await this.saveAsync();
	}
	
	disconnectUser() {
		this.user = null;
		this.useruuid = null;
		this.isauthenticated = false;
		
		this.save();
	}
	
	async disconnectUserAsync() {
		this.user = null;
		this.useruuid = null;
		this.isauthenticated = false;
		
		await this.saveAsync();
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
	
	async getMySqlConnectionAsync() {
		var global = this.global;
		
		return global.getMySqlConnectionAsync();
	}
	
	// rest calls
	getRestConnection(rest_server_url, rest_server_api_path) {
		var RestConnection = require('./restconnection.js');
		
		return new RestConnection(this, rest_server_url, rest_server_api_path);
	}

	async getAuthKeyRestConnectionAsync(rest_server_url, rest_server_api_path, calltoken) {
		// used to get sessiontoken and calltoken set to specific authorization server
		let RestConnection = require('./restconnection.js');
		let restconnection = new RestConnection(this, rest_server_url, rest_server_api_path);

		if (calltoken)
		restconnection.addToHeader({key: 'calltoken', value: JSON.stringify(calltoken)});

		return restconnection;
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
	
	async hasSuperAdminPrivilegesAsync() {
		var isAnonymous = await this.isAnonymousAsync();
		if (isAnonymous)
			return false;
		
		var isAuthenticated = await this.isAuthenticatedAsync();
		if (!isAuthenticated)
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
	
	static async createBlankSessionAsync(global) {
		var session = new Session(global);
		session.session_uuid = session.guid();
		
		var sessionmap = Session.getSessionMap(global);

		await sessionmap.pushSessionAsync(session);
		
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
	
	// getSession sync version
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
				.catch(function (err) {
					global.log("error in session initialization for sessionuuid " + sessionuuid + ": " + err);
					
					session.initializationfinished = true;
					
					return Promise.reject("error in session initialization for sessionuuid " + sessionuuid + ": " + err);
				});
				
				global.log('session initialization promise created for session ' + sessionuuid);
				
				sessionlatch.await(10000, function() {
					global.log('session going out of initialization latch for session ' + sessionuuid + ' SYNC VERSION');
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
			
			global.log('session object initialized for session ' + sessionuuid + ' call ' + calluuid + ' SYNC VERSION');
		}
		

		
		return session;
	}


	// getSession async version
	static async _sessionRecordAsync(global, sessionuuid) {
		var commonservice = global.getServiceInstance('common');
		var server = commonservice.getServerInstance();
		var persistor = server.getPersistor();
		
		global.log('Session._sessionRecord called for ' + sessionuuid);

		var canPersisData = await persistor.canPersistDataAsync();

		if (canPersisData) {
			global.log('Session._sessionRecord reading in persistor session ' + sessionuuid);
			var array = await persistor.getSessionAsync(sessionuuid);
			global.log('Session._sessionRecord session ' + sessionuuid + ' array is ' + JSON.stringify(array));
		}
		else {
			global.log('Session._sessionRecord session ' + sessionuuid + ' persistor says can not persist data');
		}
		
		return array;
	}
	

	static async _initStickySessionObject(global, session, session_section) {
		try {
			let sessionuuid = session.session_uuid;
			global.log('starting initialization of sticky session object for ' + sessionuuid);

			// check to see if it's in the persistence layer
			let array = await Session._sessionRecordAsync(global, sessionuuid);
			
			if (array && (array['uuid'])) {
				session._init(array);
			}
			
			session.ping();

			await session.saveAsync();

			// invoke hooks to let services interact with the new session object
			let result = [];
			
			let params = [];
			
			params.push(session);
			params.push(session_section);

			let ret = global.invokeHooks('createSession_hook', result, params); // legacy synchroneous hooks
			ret = await global.invokeAsyncHooks('createSession_asynchook', result, params); // recommended async implementation
			
			if (ret && result && result.length) {
				global.log('createSession_hook result is ' + JSON.stringify(result));
			}
			
			session.isready = true; // end of pseudo lock on session initialization
			
			global.log('sticky session ' + sessionuuid + ' is now ready!');

			return true;
		}
		catch(e) {
			let error = 'exception in session creation promise: ' + e;
			global.log(error);
			
			throw error;
		}
	}

	static async _initTransientSessionObject(global, session, calluuid, session_section) {
		try {
			let sessionuuid = session.session_uuid;
			global.log('starting initialization of non sticky session object for ' + sessionuuid + ' call ' + calluuid);

			// check to see if it's in the persistence layer
			let array = await Session._sessionRecordAsync(global, sessionuuid);
			
			if (array && (array['uuid'])) {
				session._init(array);
			}
			
			//session.ping();

			//await session.saveAsync();

			// invoke hooks to let services interact with the new session object
			let result = [];
			
			let params = [];
			
			params.push(session);
			params.push(session_section);

			let ret = global.invokeHooks('createSession_hook', result, params); // legacy synchroneous hooks
			ret = await global.invokeAsyncHooks('createSession_asynchook', result, params); // recommended async implementation
			
			if (ret && result && result.length) {
				global.log('createSession_hook result is ' + JSON.stringify(result));
			}
			
			session.isready = true;
			
			global.log('non sticky session object for ' + sessionuuid + ' call ' + calluuid + ' is ready');

			return true;
		}
		catch(e) {
			let error = 'exception in session creation promise: ' + e;
			global.log(error);

			throw error;
		}
	}
	
	static knowsSession(global, sessionuuid) {
		if (!sessionuuid)
		return false;

		var sessionmap = Session.getSessionMap(global);

		return sessionmap.knowsSession(sessionuuid);
	}

	static async getSessionAsync(global, sessionuuid, session_section) {
		var session;
		
		if (!sessionuuid) {
			// create on-the-fly a new session object
			return new Session(global);
		}
		
		if (global.areSessionsSticky()) {
			// sticky sessions (stateful server mode)
			var sessionmap = Session.getSessionMap(global);
			
			var key = sessionuuid.toString();
			var mapvalue = await sessionmap.getSessionAsync(key, session_section);
			
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
				await sessionmap.pushSessionAsync(session, true); // fast push to avoid calls to mysql
				
			}
			
			if (session.isready === false) {
				session.initializationfinished = false;
				
				global.log('creating session initialization promise for sticky session ' + sessionuuid);
				
				// we may go through this section several times because of issues with re-entrance
				// and nodejs/javascript mono-threaded approach of stacking execution bits
				
				/// create a latch to start unstacking calls once one of them has finished the initialization
				let sessionlatch = _SessionInitLatch.get(session);
				
				global.log('session sessionlatch retrieved for sticky session ' + sessionuuid);
				
				let initializationpromise;
				
				initializationpromise = sessionlatch.getInitializationPromise();

				if (!initializationpromise) {
					initializationpromise = Session._initStickySessionObject(global, session, session_section)
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

					sessionlatch.setInitializationPromise(initializationpromise);
				}

				
				global.log('session initialization promise created for session ' + sessionuuid);
				
				await initializationpromise
				. then( () => {
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
			
			let initializationfinished = false;
			
			global.log('creating session initialization promise for non sticky session ' + sessionuuid + ' call ' + calluuid);
			let initializationpromise = Session._initTransientSessionObject(global, session, calluuid, session_section)
			.then( (res) => {
				global.log('session ' + sessionuuid + ' is now ready!');

				initializationfinished = true;
			})
			.catch( (err) => {
				console.log("error in session initialization for sessionuuid " + sessionuuid + ": " + err);
				
				initializationfinished = true;
			});
			
			global.log('session initialization promise created for session ' + sessionuuid);

			await initializationpromise;

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
	
	static async putSessionAsync(global, session) {
		var sessionuuid = session.getSessionUUID();
		
		if (Session.getSession(global, sessionuuid))
			throw 'session has already been pushed: ' + sessionuuid;
		
		var sessionmap = Session.getSessionMap(global);
		
		await sessionmap.pushSessionAsync(session);
	}
	
	static openSessionSection(global, sessionuuid, sectionname, calltoken) {
		return new SessionSection(global, sessionuuid, sectionname, calltoken);
	}

}


module.exports = Session;