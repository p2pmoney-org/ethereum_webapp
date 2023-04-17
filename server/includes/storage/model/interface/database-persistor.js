/**
 * 
 */
'use strict';


class DataBasePersistor {
	constructor(service) {
		this.service = service;
		this.global = service.global;
	}

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

	
	getUserKeyContent(useruuid, key) {
		var global = this.global;
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('storage_users');
		var _useruuid = mysqlcon.escape(useruuid);
		var _key = mysqlcon.escape(key);
		
		var sql = "SELECT * FROM " + tablename + " WHERE " + tablename + ".UserUUID=" + _useruuid + " AND " + tablename + ".Key=" + _key + ";";
		
		// open connection
		mysqlcon.open();
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		
		var array = [];
		
		if (result) {
			var rows = (result['rows'] ? result['rows'] : []);
			
			if (rows[0]) {
				var row = rows[0];
				
				array['useruuid'] = row.UserUUID;
				array['key'] = row.Key;
				array['content'] = row.Content;
			}
			
		}
		
		
		// close connection
		mysqlcon.close();
			
			
		return array;
		
	}
	
	async getUserKeyContentAsync(useruuid, key) {
		var global = this.global;
		
		var mysqlcon = await global.getMySqlConnectionAsync();
		
		var tablename = mysqlcon.getTableName('storage_users');
		var _useruuid = mysqlcon.escape(useruuid);
		var _key = mysqlcon.escape(key);
		
		var sql = "SELECT * FROM " + tablename + " WHERE " + tablename + ".UserUUID=" + _useruuid + " AND " + tablename + ".Key=" + _key + ";";
		
		// open connection
		await mysqlcon.openAsync();
		
		// execute query
		var result = await mysqlcon.executeAsync(sql);
		
		
		var array = [];
		
		if (result) {
			var rows = (result['rows'] ? result['rows'] : []);
			
			if (rows[0]) {
				var row = rows[0];
				
				array['useruuid'] = row.UserUUID;
				array['key'] = row.Key;
				array['content'] = row.Content;
			}
			
		}
		
		
		// close connection
		await mysqlcon.closeAsync();
			
			
		return array;
		
	}
	
	putUserKeyContent(useruuid, key, content) {
		var global = this.global;
		

		var mysqlcon = global.getMySqlConnection();
		
		var contentstring = mysqlcon.escape(content);
		
		var tablename = mysqlcon.getTableName('storage_users');
		
		var sql;
		
		// open connection
		mysqlcon.open();
		
		var _current = this.getUserKeyContent(useruuid, key);
		
		if (_current.key !== undefined) {
			sql = `UPDATE ` +  tablename + ` SET
					  Content = ` + contentstring + `
				WHERE ` + tablename + `.UserUUID = '` + _current.useruuid + `' AND ` + tablename + `.Key='` + _current.key + `';`;
		}
		else {
			
			sql = `INSERT INTO ` +  tablename + ` (
			  UserUUID,
			  ` + tablename + `.Key,
			  Content
			  )
			  VALUES (
			  '` + useruuid + `',
			  '` + key + `',
			  ` + contentstring + `
			  );`;
		}
		
		
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
	}
	
	async putUserKeyContentAsync(useruuid, key, content) {
		var global = this.global;
		

		var mysqlcon = await global.getMySqlConnectionAsync();
		
		var contentstring = mysqlcon.escape(content);
		
		var tablename = mysqlcon.getTableName('storage_users');
		
		var sql;
		
		// open connection
		await mysqlcon.openAsync();
		
		var _current = await this.getUserKeyContentAsync(useruuid, key);
		
		if (_current.key !== undefined) {
			sql = `UPDATE ` +  tablename + ` SET
					  Content = ` + contentstring + `
				WHERE ` + tablename + `.UserUUID = '` + _current.useruuid + `' AND ` + tablename + `.Key='` + _current.key + `';`;
		}
		else {
			
			sql = `INSERT INTO ` +  tablename + ` (
			  UserUUID,
			  ` + tablename + `.Key,
			  Content
			  )
			  VALUES (
			  '` + useruuid + `',
			  '` + key + `',
			  ` + contentstring + `
			  );`;
		}
		
		
		
		// execute query
		var result = await mysqlcon.executeAsync(sql);
		
		// close connection
		await mysqlcon.closeAsync();
	}
	
	removeUserKeyContent(useruuid, key) {
		var global = this.global;
		
		var userarray = this._getUserArrayFromUUID(useruuid);
		
		if (!userarray)
			throw 'could not find user with uuid ' + useruuid;
		
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('storage_users');
		var _useruuid = mysqlcon.escape(useruuid);
		var _key = mysqlcon.escape(key);
		
		var sql;
		
		// open connection
		mysqlcon.open();
		
		sql = `DELETE FROM ` +  tablename + ` WHERE ` + tablename + `.UserUUID=` + _useruuid + ` AND ` + tablename + `.Key=` + _key + `;`;
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
	}

	async removeUserKeyContentAsync(useruuid, key) {
		var global = this.global;
		
		var userarray = await this._getUserArrayFromUUIDAsync(useruuid);
		
		if (!userarray)
			throw 'could not find user with uuid ' + useruuid;
		
		
		var mysqlcon = await global.getMySqlConnectionAsync();
		
		var tablename = mysqlcon.getTableName('storage_users');
		var _useruuid = mysqlcon.escape(useruuid);
		var _key = mysqlcon.escape(key);
		
		var sql;
		
		// open connection
		await mysqlcon.openAsync();
		
		sql = `DELETE FROM ` +  tablename + ` WHERE ` + tablename + `.UserUUID=` + _useruuid + ` AND ` + tablename + `.Key=` + _key + `;`;
		
		// execute query
		var result = await mysqlcon.executeAsync(sql);
		
		// close connection
		await mysqlcon.closeAsync();
	}
}


module.exports = DataBasePersistor;