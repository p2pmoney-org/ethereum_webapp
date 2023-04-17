/**
 * 
 */
'use strict';


class DataBasePersistor {
	constructor(service) {
		this.service = service;
		this.global = service.global;
	}
	
	canPersistData() {
		var global = this.global;
		var mysqlcon = global.getMySqlConnection();

		return mysqlcon.isActive();
	}
	
	async canPersistDataAsync() {
		var global = this.global;
		var mysqlcon = await global.getMySqlConnectionAsync();

		return mysqlcon.isActive();
	}
	
	getGlobalParameters(key) {
		var global = this.global;
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('globalparameters');
		var _key = mysqlcon.escape(key);
		
		var sql = "SELECT * FROM " + tablename + " WHERE \`Key\` = " + _key + ";";
		
		// open connection
		mysqlcon.open();
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		
		var array = [];
		
		if (result) {
			var rows = (result['rows'] ? result['rows'] : []);
			
			for (var i = 0; i < rows.length; i++) {
				var row = rows[i];
				var rowarray = {};
				
				rowarray['key'] = row.Key;
				rowarray['type'] = row.Type;
				rowarray['value'] = row.Value;
				
				array.push(rowarray);
			}
			
		}
		
		
		// close connection
		mysqlcon.close();
			
			
		return array;
	}

	async getGlobalParametersAsync(key) {
		var global = this.global;
		
		var mysqlcon = await global.getMySqlConnectionAsync();
		
		var tablename = mysqlcon.getTableName('globalparameters');
		var _key = mysqlcon.escape(key);
		
		var sql = "SELECT * FROM " + tablename + " WHERE \`Key\` = " + _key + ";";
		
		// open connection
		await mysqlcon.openAsync();
		
		// execute query
		var result = await mysqlcon.executeAsync(sql);
		
		
		var array = [];
		
		if (result) {
			var rows = (result['rows'] ? result['rows'] : []);
			
			for (var i = 0; i < rows.length; i++) {
				var row = rows[i];
				var rowarray = {};
				
				rowarray['key'] = row.Key;
				rowarray['type'] = row.Type;
				rowarray['value'] = row.Value;
				
				array.push(rowarray);
			}
			
		}
		
		
		// close connection
		await mysqlcon.closeAsync();
			
			
		return array;
	}
	
	putGlobalParameter(key, type, value) {
		var global = this.global;
		
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('globalparameters');
		
		var sql;
		
		// open connection
		mysqlcon.open();
		
		sql = `INSERT INTO ` +  tablename + ` (
					\`Key\`,
					\`Type\`,
					\`Value\` 
		  )
		  VALUES (
		  '` + key + `',
		  ` + type + `,
		  '` + value + `'
		  );`;
		
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
	}

	async putGlobalParameterAsync(key, type, value) {
		var global = this.global;
		
		
		var mysqlcon = await global.getMySqlConnectionAsync();
		
		var tablename = mysqlcon.getTableName('globalparameters');
		
		var sql;
		
		// open connection
		await mysqlcon.openAsync();
		
		sql = `INSERT INTO ` +  tablename + ` (
					\`Key\`,
					\`Type\`,
					\`Value\` 
		  )
		  VALUES (
		  '` + key + `',
		  ` + type + `,
		  '` + value + `'
		  );`;
		
		
		// execute query
		var result = await mysqlcon.executeAsync(sql);
		
		// close connection
		await mysqlcon.closeAsync();
	}
	
	updateGlobalParameters(key, type, value) {
		var global = this.global;
		
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('globalparameters');
		var _key = mysqlcon.escape(key);
		var _value = mysqlcon.escape(value);
		
		var sql;
		
		// open connection
		mysqlcon.open();
		
		sql = `UPDATE ` +  tablename + ` SET
		  \`Type\` = ` + type + `,
		  \`Value\` = ` + _value + `
		  WHERE  \`Key\` = ` + _key + `;`;

		
		// execute query
		var result = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
	}

	async updateGlobalParametersAsync(key, type, value) {
		var global = this.global;
		
		
		var mysqlcon = await global.getMySqlConnectionAsync();
		
		var tablename = mysqlcon.getTableName('globalparameters');
		var _key = mysqlcon.escape(key);
		var _value = mysqlcon.escape(value);
		
		var sql;
		
		// open connection
		await mysqlcon.openAsync();
		
		sql = `UPDATE ` +  tablename + ` SET
		  \`Type\` = ` + type + `,
		  \`Value\` = ` + _value + `
		  WHERE  \`Key\` = ` + _key + `;`;

		
		// execute query
		var result = await mysqlcon.executeAsync(sql);
		
		// close connection
		await mysqlcon.closeAsync();
	}
	
	// sessions
	_getUserArrayFromUUID(useruuid) {
		var global = this.global;
		var array = {id: -1};
		
		if (!useruuid)
			return array;
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('users');
		var _useruuid = mysqlcon.escape(useruuid);
		
		var sql = "SELECT * FROM " + tablename + " WHERE UserUUID = " + _useruuid + ";";
		
		// open connection
		mysqlcon.open();
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		
		if (result) {
			var rows = (result['rows'] ? result['rows'] : []);
			
			if (rows[0]) {
				var row = rows[0];
				
				array['id'] = row.UserId;
				array['uuid'] = row.UserUUID;
				array['userid'] = row.UserId;
				array['useruuid'] = row.UserUUID;
				array['username'] = row.UserName;
				array['useremail'] = row.UserEmail;
				array['password'] = row.Password;
				array['hashmethod'] = row.HashMethod;
				array['salt'] = row.Salt;
				array['accountstatus'] = row.AccountStatus;
			}
			
		}
		
		
		// close connection
		mysqlcon.close();
			
			
		return array;
	}

	async _getUserArrayFromUUIDAsync(useruuid) {
		var global = this.global;
		var array = {id: -1};
		
		if (!useruuid)
			return array;
		
		var mysqlcon = await global.getMySqlConnectionAsync();
		
		var tablename = mysqlcon.getTableName('users');
		var _useruuid = mysqlcon.escape(useruuid);
		
		var sql = "SELECT * FROM " + tablename + " WHERE UserUUID = " + _useruuid + ";";
		
		// open connection
		await mysqlcon.openAsync();
		
		// execute query
		var result = await mysqlcon.executeAsync(sql);
		
		
		if (result) {
			var rows = (result['rows'] ? result['rows'] : []);
			
			if (rows[0]) {
				var row = rows[0];
				
				array['id'] = row.UserId;
				array['uuid'] = row.UserUUID;
				array['userid'] = row.UserId;
				array['useruuid'] = row.UserUUID;
				array['username'] = row.UserName;
				array['useremail'] = row.UserEmail;
				array['password'] = row.Password;
				array['hashmethod'] = row.HashMethod;
				array['salt'] = row.Salt;
				array['accountstatus'] = row.AccountStatus;
			}
			
		}
		
		
		// close connection
		await mysqlcon.closeAsync();
			
			
		return array;
	}

	_getUserArrayFromId(userid) {
		var global = this.global;
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('users');
		var _userid = mysqlcon.escape(userid);
		
		var sql = "SELECT * FROM " + tablename + " WHERE UserId = " + _userid + ";";
		
		// open connection
		mysqlcon.open();
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		
		var array = {};
		
		if (result) {
			var rows = (result['rows'] ? result['rows'] : []);
			
			if (rows[0]) {
				var row = rows[0];
				
				array['id'] = row.UserId;
				array['uuid'] = row.UserUUID;
				array['userid'] = row.UserId;
				array['useruuid'] = row.UserUUID;
				array['username'] = row.UserName;
				array['useremail'] = row.UserEmail;
				array['password'] = row.Password;
				array['hashmethod'] = row.HashMethod;
				array['salt'] = row.Salt;
				array['accountstatus'] = row.AccountStatus;
				
			}
			
		}
		
		
		// close connection
		mysqlcon.close();
			
			
		return array;
	}

	async _getUserArrayFromIdAsync(userid) {
		var global = this.global;
		
		var mysqlcon = await global.getMySqlConnectionAsync();
		
		var tablename = mysqlcon.getTableName('users');
		var _userid = mysqlcon.escape(userid);
		
		var sql = "SELECT * FROM " + tablename + " WHERE UserId = " + _userid + ";";
		
		// open connection
		await mysqlcon.openAsync();
		
		// execute query
		var result = await mysqlcon.executeAsync(sql);
		
		
		var array = {};
		
		if (result) {
			var rows = (result['rows'] ? result['rows'] : []);
			
			if (rows[0]) {
				var row = rows[0];
				
				array['id'] = row.UserId;
				array['uuid'] = row.UserUUID;
				array['userid'] = row.UserId;
				array['useruuid'] = row.UserUUID;
				array['username'] = row.UserName;
				array['useremail'] = row.UserEmail;
				array['password'] = row.Password;
				array['hashmethod'] = row.HashMethod;
				array['salt'] = row.Salt;
				array['accountstatus'] = row.AccountStatus;
				
			}
			
		}
		
		
		// close connection
		await mysqlcon.closeAsync();
			
			
		return array;
	}

	getSession(sessionuuid) {
		var global = this.global;
		
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('sessions');
		var _sessionuuid = mysqlcon.escape(sessionuuid);
		
		var sql = "SELECT * FROM " + tablename + " WHERE SessionUUID = " + _sessionuuid + ";";
		
		// open connection
		mysqlcon.open();
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		
		var array = {};
		
		if (result) {
			var rows = (result['rows'] ? result['rows'] : []);
			
			if (rows[0]) {
				var row = rows[0];
				
				array['id'] = row.SessionId;
				array['uuid'] = row.SessionUUID;
				array['sessionid'] = row.SessionId;
				array['sessionuuid'] = row.SessionUUID;
				array['userid'] = row.UserId;
				array['createdon'] = row.CreatedOn.getTime();
				array['lastpingon'] = row.LastPingOn.getTime();
				array['isauthenticated'] = (row.IsAuthenticated == 1 ? true : false);
				array['sessionvariables'] = row.SessionVariables;
				
				if (array['userid'] != -1) {
					var sessionuserarray = this._getUserArrayFromId(array['userid']);
					
					array['useruuid'] = (sessionuserarray ? sessionuserarray['useruuid'] : null);
				}
				else {
					array['useruuid'] = null;
				}
			}
			
		}
		
		
		// close connection
		mysqlcon.close();
		
		return array;
	}

	async getSessionAsync(sessionuuid) {
		var global = this.global;
		
		
		var mysqlcon = await global.getMySqlConnectionAsync();
		
		var tablename = mysqlcon.getTableName('sessions');
		var _sessionuuid = mysqlcon.escape(sessionuuid);
		
		var sql = "SELECT * FROM " + tablename + " WHERE SessionUUID = " + _sessionuuid + ";";
		
		// open connection
		await mysqlcon.open();
		
		// execute query
		var result = await mysqlcon.executeAsync(sql);
		
		
		var array = {};
		
		if (result) {
			var rows = (result['rows'] ? result['rows'] : []);
			
			if (rows[0]) {
				var row = rows[0];
				
				array['id'] = row.SessionId;
				array['uuid'] = row.SessionUUID;
				array['sessionid'] = row.SessionId;
				array['sessionuuid'] = row.SessionUUID;
				array['userid'] = row.UserId;
				array['createdon'] = row.CreatedOn.getTime();
				array['lastpingon'] = row.LastPingOn.getTime();
				array['isauthenticated'] = (row.IsAuthenticated == 1 ? true : false);
				array['sessionvariables'] = row.SessionVariables;
				
				if (array['userid'] != -1) {
					var sessionuserarray = await this._getUserArrayFromIdAsync(array['userid']);
					
					array['useruuid'] = (sessionuserarray ? sessionuserarray['useruuid'] : null);
				}
				else {
					array['useruuid'] = null;
				}
			}
			
		}
		
		// close connection
		await mysqlcon.closeAsync();
		
		return array;
	}
	
	putSession(array) {
		var global = this.global;
		
		var sessionuuid = array['sessionuuid'];
		
		var useruuid = array['useruuid'];
		
		var userarray = ( useruuid ? this._getUserArrayFromUUID(useruuid) : {id: -1});
		var userid = (userarray['id'] ? userarray['id'] : -1);
		
		var mysqlcon = global.getMySqlConnection();
		
		var createdon = mysqlcon.escape(new Date(array['createdon']));
		var lastpingon = mysqlcon.escape(new Date(array['lastpingon']));
		var isauthenticated = (array['isauthenticated'] == true ? 1 : 0);;
		var sessionvariables = array['sessionvariables'];

		
		var tablename = mysqlcon.getTableName('sessions');
		
		var sql;
		
		// open connection
		mysqlcon.open();
		
		var _current = this.getSession(sessionuuid);
		
		if (_current.uuid !== undefined) {
			sql = `UPDATE ` +  tablename + ` SET
					  UserId = ` + userid + `,
					  LastPingOn = ` + lastpingon + `,
					  IsAuthenticated = ` + isauthenticated + `,
					  SessionVariables = ` + (sessionvariables ? `'` + sessionvariables + `'` : `''`) + `
				WHERE SessionId = ` + _current.id + `;`;
		}
		else {
			var salt = this.global.generateUUID(16);
			
			sql = `INSERT INTO ` +  tablename + ` (
					  SessionUUID,
					  UserId,
					  CreatedOn,
					  LastPingOn,
					  IsAuthenticated,
					  SessionVariables
			  )
			  VALUES (
					  '` + sessionuuid + `',
					  ` + userid + `,
					  ` + createdon + `,
					  ` + lastpingon + `,
					  ` + isauthenticated + `,
					  ` + (sessionvariables ? `'` + sessionvariables + `'` : `''`) + `
			  );`;
		}
		
		
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
	}

	async putSessionAsync(array) {
		var global = this.global;
		
		var sessionuuid = array['sessionuuid'];
		
		var useruuid = array['useruuid'];
		
		var userarray = ( useruuid ? await this._getUserArrayFromUUIDAsync(useruuid) : {id: -1});
		var userid = (userarray['id'] ? userarray['id'] : -1);
		
		var mysqlcon = global.getMySqlConnection();
		
		var createdon = mysqlcon.escape(new Date(array['createdon']));
		var lastpingon = mysqlcon.escape(new Date(array['lastpingon']));
		var isauthenticated = (array['isauthenticated'] == true ? 1 : 0);;
		var sessionvariables = array['sessionvariables'];

		
		var tablename = mysqlcon.getTableName('sessions');
		
		var sql;
		
		// open connection
		await mysqlcon.openAsync();
		
		var _current = await this.getSessionAsync(sessionuuid);
		
		if (_current.uuid !== undefined) {
			sql = `UPDATE ` +  tablename + ` SET
					  UserId = ` + userid + `,
					  LastPingOn = ` + lastpingon + `,
					  IsAuthenticated = ` + isauthenticated + `,
					  SessionVariables = ` + (sessionvariables ? `'` + sessionvariables + `'` : `''`) + `
				WHERE SessionId = ` + _current.id + `;`;
		}
		else {
			var salt = this.global.generateUUID(16);
			
			sql = `INSERT INTO ` +  tablename + ` (
					  SessionUUID,
					  UserId,
					  CreatedOn,
					  LastPingOn,
					  IsAuthenticated,
					  SessionVariables
			  )
			  VALUES (
					  '` + sessionuuid + `',
					  ` + userid + `,
					  ` + createdon + `,
					  ` + lastpingon + `,
					  ` + isauthenticated + `,
					  ` + (sessionvariables ? `'` + sessionvariables + `'` : `''`) + `
			  );`;
		}
		
		
		
		// execute query
		var result = await mysqlcon.executeAsync(sql);
		
		// close connection
		await mysqlcon.closeAsync();
	}
	
	putSessionState(array) {
		var global = this.global;
		
		var sessionuuid = array['sessionuuid'];
		
		var useruuid = array['useruuid'];
		
		var userarray = ( useruuid ? this._getUserArrayFromUUID(useruuid) : {id: -1});
		var userid = (userarray['id'] ? userarray['id'] : -1);
		
		var mysqlcon = global.getMySqlConnection();
		
		var createdon = mysqlcon.escape(new Date(array['createdon']));
		var lastpingon = mysqlcon.escape(new Date(array['lastpingon']));
		var isauthenticated = (array['isauthenticated'] == true ? 1 : 0);;

		
		var tablename = mysqlcon.getTableName('sessions');
		
		var sql;
		
		// open connection
		mysqlcon.open();
		
		var _current = this.getSession(sessionuuid);
		
		if (_current.uuid !== undefined) {
			sql = `UPDATE ` +  tablename + ` SET
					  UserId = ` + userid + `,
					  LastPingOn = ` + lastpingon + `,
					  IsAuthenticated = ` + isauthenticated + `
				WHERE SessionId = ` + _current.id + `;`;
		}
		else {
			var salt = this.global.generateUUID(16);
			
			sql = `INSERT INTO ` +  tablename + ` (
					  SessionUUID,
					  UserId,
					  CreatedOn,
					  LastPingOn,
					  IsAuthenticated
			  )
			  VALUES (
					  '` + sessionuuid + `',
					  ` + userid + `,
					  ` + createdon + `,
					  ` + lastpingon + `,
					  ` + isauthenticated + `
			  );`;
		}
		
		
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
	}

	async putSessionStateAsync(array) {
		var global = this.global;
		
		var sessionuuid = array['sessionuuid'];
		
		var useruuid = array['useruuid'];
		
		var userarray = ( useruuid ? await this._getUserArrayFromUUIDAsync(useruuid) : {id: -1});
		var userid = (userarray['id'] ? userarray['id'] : -1);
		
		var mysqlcon = await global.getMySqlConnectionAsync();
		
		var createdon = mysqlcon.escape(new Date(array['createdon']));
		var lastpingon = mysqlcon.escape(new Date(array['lastpingon']));
		var isauthenticated = (array['isauthenticated'] == true ? 1 : 0);;

		
		var tablename = mysqlcon.getTableName('sessions');
		
		var sql;
		
		// open connection
		await mysqlcon.openAsync();
		
		var _current = await this.getSessionAsync(sessionuuid);
		
		if (_current.uuid !== undefined) {
			sql = `UPDATE ` +  tablename + ` SET
					  UserId = ` + userid + `,
					  LastPingOn = ` + lastpingon + `,
					  IsAuthenticated = ` + isauthenticated + `
				WHERE SessionId = ` + _current.id + `;`;
		}
		else {
			var salt = this.global.generateUUID(16);
			
			sql = `INSERT INTO ` +  tablename + ` (
					  SessionUUID,
					  UserId,
					  CreatedOn,
					  LastPingOn,
					  IsAuthenticated
			  )
			  VALUES (
					  '` + sessionuuid + `',
					  ` + userid + `,
					  ` + createdon + `,
					  ` + lastpingon + `,
					  ` + isauthenticated + `
			  );`;
		}
		
		
		
		// execute query
		var result = await mysqlcon.executeAsync(sql);
		
		// close connection
		await mysqlcon.closeAsync();
	}
	
	putSessionVariables(array) {
		var global = this.global;
		
		var sessionuuid = array['sessionuuid'];
		
		var mysqlcon = global.getMySqlConnection();
		
		var sessionvariables = array['sessionvariables'];

		
		var tablename = mysqlcon.getTableName('sessions');
		
		var sql;
		
		// open connection
		mysqlcon.open();
		
		var _current = this.getSession(sessionuuid);
		
		if (_current.uuid !== undefined) {
			sql = `UPDATE ` +  tablename + ` SET
					  SessionVariables = ` + (sessionvariables ? `'` + sessionvariables + `'` : `''`) + `
				WHERE SessionId = ` + _current.id + `;`;
			
			// execute query
			var result = mysqlcon.execute(sql);
		}
		
		
		// close connection
		mysqlcon.close();
	}

	async putSessionVariablesAsync(array) {
		var global = this.global;
		
		var sessionuuid = array['sessionuuid'];
		
		var mysqlcon = await global.getMySqlConnectionAsync();
		
		var sessionvariables = array['sessionvariables'];

		
		var tablename = mysqlcon.getTableName('sessions');
		
		var sql;
		
		// open connection
		await mysqlcon.openAsync();
		
		var _current = await this.getSessionAsync(sessionuuid);
		
		if (_current.uuid !== undefined) {
			sql = `UPDATE ` +  tablename + ` SET
					  SessionVariables = ` + (sessionvariables ? `'` + sessionvariables + `'` : `''`) + `
				WHERE SessionId = ` + _current.id + `;`;
			
			// execute query
			var result = await mysqlcon.executeAsync(sql);
		}
		
		
		// close connection
		await mysqlcon.close();
	}
	
}


module.exports = DataBasePersistor;