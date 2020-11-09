/**
 * 
 */
'use strict';


class DataBasePersistor {
	constructor(service) {
		this.service = service;
		this.global = service.global;
	}
	
	getUsers() {
		var global = this.global;
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('users');
		
		var sql = "SELECT * FROM " + tablename + ";";
		
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
				
				rowarray['userid'] = row.UserId;
				rowarray['useruuid'] = row.UserUUID;
				rowarray['username'] = row.UserName;
				rowarray['useremail'] = row.UserEmail;
				rowarray['password'] = row.Password;
				rowarray['hashmethod'] = row.HashMethod;
				rowarray['salt'] = row.Salt;
				rowarray['accountstatus'] = row.AccountStatus;
				
				array.push(rowarray);
			}
			
		}
		
		
		// close connection
		mysqlcon.close();
			
			
		return array;
		
	}
	
	getUserArrayFromUUID(useruuid) {
		var global = this.global;
		var array = {};
		
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
	
	getUserArray(username) {
		var global = this.global;
		
		if (!username)
			return;
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('users');
		var _username = mysqlcon.escape(username);
		
		var sql = "SELECT * FROM " + tablename + " WHERE UserName = " + _username + ";";
		
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
				array['altloginmethod'] = row.AltLoginMethod;
				array['salt'] = row.Salt;
				array['accountstatus'] = row.AccountStatus;
			}
			
		}
		
		
		// close connection
		mysqlcon.close();
			
			
		return array;
	}
	
	putUserArray(array) {
		var global = this.global;
		
		var useruuid = array['useruuid'];
		
		if (!useruuid)
			return;
		
		var username = array['username'];
		var useremail = array['useremail'];
		
		var hashmethod = array['hashmethod'];
		var salt = (array['salt'] ? array['salt'] : this.global.generateUUID(16));
		var accountstatus = array['accountstatus'];

		var altloginmethod = (array['altloginmethod'] ? array['altloginmethod'] : 'none');

		var mysqlcon = global.getMySqlConnection();
		
		var registrationon = mysqlcon.escape((array['registrationon'] ? new Date(array['registrationon']) : new Date()));
		var lastmodificationon = mysqlcon.escape((array['lastmodificationon'] ? new Date(array['lastmodificationon']) : new Date()));
		
		var tablename = mysqlcon.getTableName('users');
		
		var sql;
		
		// open connection
		mysqlcon.open();
		
		var _current = this.getUserArrayFromUUID(useruuid);
		
		if (_current.uuid !== undefined) {
			sql = `UPDATE ` +  tablename + ` SET
					  UserEmail = '` + useremail + `',
					  AccountStatus = ` + accountstatus + `,
					  RegistrationDate = ` + registrationon + `,
					  LastModificationOn = ` + lastmodificationon + `,
					  UserName = '` + username + `'
				WHERE UserId = ` + _current.id + `;`;
		}
		else {
			
			sql = `INSERT INTO ` +  tablename + ` (
			  UserUUID,
			  UserEmail,
			  AltLoginMethod,
			  Salt,
			  AccountStatus,
			  RegistrationDate,
			  LastModificationOn,
			  UserName
			  )
			  VALUES (
			  '` + useruuid + `',
			  '` + useremail + `',
			  '` + altloginmethod + `',
			  '` + salt + `',
			  ` + accountstatus + `,
			  ` + registrationon + `,
			  ` + lastmodificationon + `,
			  '` + username + `'
			  );`;
		}
		
		
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
	}
	
	putUserPassword(useruuid, array) {
		var global = this.global;
		
		if (!useruuid)
			return;
		
		var password = array['password'];
		var hashmethod = array['hashmethod'];
		var salt = array['salt'];

		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('users');
		
		var sql;
		
		// open connection
		mysqlcon.open();
		
		var _current = this.getUserArrayFromUUID(useruuid);
		
		if (_current.uuid !== undefined) {
			sql = `UPDATE ` +  tablename + ` SET
					  Password = '` + password + `',
					  HashMethod = ` + hashmethod + `,
					  Salt = '` + salt + `'
				WHERE UserId = ` + _current.id + `;`;
			
			// execute query
			var result = mysqlcon.execute(sql);
		}
		else {
			throw new Error('could not find user with uuid ' + useruuid);
		}
		
		
		// close connection
		mysqlcon.close();
	}
	
	getUserKeysFromUserUUID(useruuid) {
		var global = this.global;
		
		var keys = [];
		
		if (!useruuid)
			return keys;
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('users');
		var keystablename = mysqlcon.getTableName('keys');
		var _useruuid = mysqlcon.escape(useruuid);
		
		var sql = "SELECT * FROM " + tablename;
		sql += " INNER JOIN " + keystablename;
		sql += " ON " + tablename + ".UserId=" + keystablename + ".UserId";
		sql += " WHERE "+ tablename + ".UserUUID = " + _useruuid + ";";
		
		// open connection
		mysqlcon.open();
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		
		
		if (result) {
			var rows = (result['rows'] ? result['rows'] : []);
			
			for (var i = 0; i < rows.length; i++) {
				var row = rows[i];
				var key = [];
				
				key['id'] = row['KeyId'];
				key['uuid'] = row['KeyUUID'];
				key['keyid'] = row['KeyId'];
				key['keyuuid'] = row['KeyUUID'];
				key['useruuid'] = row['UserUUID'];
				key['type'] = row['Type'];
				key['private_key'] = row['PrivateKey'];
				key['address'] = row['Address'];
				key['public_key'] = row['PublicKey'];
				key['rsa_public_key'] = row['RsaPublicKey'];
				key['description'] = row['Description'];
				
				keys.push(key);
			}
			
		}
		
		
		// close connection
		mysqlcon.close();
			
			
		return keys;
		
	}

	getUserKeysFromUserName(username) {
		var global = this.global;
		
		if (!username)
			return;
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('users');
		var keystablename = mysqlcon.getTableName('keys');
		var _username = mysqlcon.escape(username);
		
		var sql = "SELECT * FROM " + tablename;
		sql += " INNER JOIN " + keystablename;
		sql += " ON " + tablename + ".UserId=" + keystablename + ".UserId";
		sql += " WHERE "+ tablename + ".UserName = " + _username + ";";
		
		// open connection
		mysqlcon.open();
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		
		var keys = [];
		
		
		if (result) {
			var rows = (result['rows'] ? result['rows'] : []);
			
			for (var i = 0; i < rows.length; i++) {
				var row = rows[i];
				var key = [];
				
				key['id'] = row['KeyId'];
				key['uuid'] = row['KeyUUID'];
				key['keyid'] = row['KeyId'];
				key['keyuuid'] = row['KeyUUID'];
				key['useruuid'] = row['UserUUID'];
				key['type'] = row['Type'];
				key['private_key'] = row['PrivateKey'];
				key['address'] = row['Address'];
				key['public_key'] = row['PublicKey'];
				key['rsa_public_key'] = row['RsaPublicKey'];
				key['description'] = row['Description'];
				
				keys.push(key);
			}
			
		}
		
		
		// close connection
		mysqlcon.close();
			
			
		return keys;
		
	}
	
	getUserKeyFromUserKeyUUID(useruuid, keyuuid) {
		var global = this.global;
		
		if (!useruuid)
			return;
		
		var mysqlcon = global.getMySqlConnection();
		
		var usertablename = mysqlcon.getTableName('users');
		var keystablename = mysqlcon.getTableName('keys');
		var _useruuid = mysqlcon.escape(useruuid);
		var _keyuuid = mysqlcon.escape(keyuuid);
		
		var sql = "SELECT * FROM " + usertablename;
		sql += " INNER JOIN " + keystablename;
		sql += " ON " + usertablename + ".UserId=" + keystablename + ".UserId";
		sql += " WHERE "+ usertablename + ".UserUUID = " + _useruuid;
		sql += " AND "+ keystablename + ".KeyUUID = " + _keyuuid + ";";
		
		// open connection
		mysqlcon.open();
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		var key = [];
		
		if (result) {
			var rows = (result['rows'] ? result['rows'] : []);
			
			var row = rows[0];
			
			key['id'] = row['KeyId'];
			key['uuid'] = row['KeyUUID'];
			key['keyid'] = row['KeyId'];
			key['keyuuid'] = row['KeyUUID'];
			key['useruuid'] = row['UserUUID'];
			key['type'] = row['Type'];
			key['private_key'] = row['PrivateKey'];
			key['address'] = row['Address'];
			key['public_key'] = row['PublicKey'];
			key['rsa_public_key'] = row['RsaPublicKey'];
			key['description'] = row['Description'];
			
		}
		
		
		// close connection
		mysqlcon.close();
			
			
		return key;
		
	}


	
	putUserKey(useruuid, keyuuid, privatekey, publickey, address, rsapublickey, type, description) {
		var global = this.global;
		
		if (!useruuid)
			return;
		
		var _userarray = this.getUserArrayFromUUID(useruuid);
		
		if ((!_userarray) || (!_userarray['id']))
			throw new Error('could not find user with uuid ' + useruuid);
		
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('keys');
		var _useruuid = mysqlcon.escape(useruuid);
		var _keyuuid = mysqlcon.escape(keyuuid);
		var _privatekey = (privatekey ? mysqlcon.escape(privatekey) : null);
		var _publickey = (publickey ? mysqlcon.escape(publickey) : null);
		var _address = (address ? mysqlcon.escape(address) : null);
		var _rsapublickey = (rsapublickey ? mysqlcon.escape(rsapublickey) : null);
		var _description = (description ? mysqlcon.escape(description) : null);
		
		var sql;
		
		// open connection
		mysqlcon.open();
		
		sql = `INSERT INTO ` +  tablename + ` (
		  KeyUUID,
		  UserId,
		  UserUUID,
		  Type,
		  PrivateKey,
		  PublicKey,
		  Address,
		  RsaPublicKey,
		  Description
		  )
		  VALUES (
		  ` + _keyuuid + `,
		  ` + _userarray['id'] + `,
		  ` + _useruuid + `,
		  ` + type + `,
		  ` + (_privatekey ? _privatekey : `NULL`) + `,
		  ` + (_publickey ? _publickey : `NULL`) + `,
		  ` + (_address ? _address : `NULL`) + `,
		  ` + (_rsapublickey ? _rsapublickey : `NULL`) + `,
		  ` + (_description ? _description : `NULL`) + `
		  );`;
		
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
	}
	
	updateUserKey(useruuid, keyuuid, description) {
		var global = this.global;
		
		var _userarray = this.getUserArrayFromUUID(useruuid);
		
		if ((!_userarray) || (!_userarray['id']))
			throw new Error('could not find user with uuid ' + useruuid);
		
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('keys');
		var _keyuuid = mysqlcon.escape(keyuuid);
		var _description = mysqlcon.escape(description);
		
		var sql;
		
		// open connection
		mysqlcon.open();
		
		sql = `UPDATE ` +  tablename + ` SET
		  Description = ` + _description + `
				WHERE UserId = ` + _userarray['id'] + ` AND ` + tablename + `.KeyUUID = ` + _keyuuid + `;`;;
		
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
	}
	
	deactivateUserKey(useruuid, keyuuid) {
		var global = this.global;
		
		var _userarray = this.getUserArrayFromUUID(useruuid);
		
		if ((!_userarray) || (!_userarray['id']))
			throw new Error('could not find user with uuid ' + useruuid);
		
		var _userkey = this.getUserKeyFromUserKeyUUID(useruuid, keyuuid);
		
		switch(_userkey['type']) {
			case 0:
				_userkey['type'] = -10;
				break;
			case 1:
				_userkey['type'] = -11;
				break;
			default:
				return;
		}

		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('keys');
		var _keyuuid = mysqlcon.escape(keyuuid);
		
		var sql;
		
		// open connection
		mysqlcon.open();
		
		sql = `UPDATE ` +  tablename + ` SET
		  Type = '` + _userkey['type'] + `'
				WHERE UserId = ` + _userarray['id'] + ` AND ` + tablename + `.KeyUUID = ` + _keyuuid + `;`;;
		
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
	}
	
	reactivateUserKey(useruuid, keyuuid) {
		var global = this.global;
		
		var _userarray = this.getUserArrayFromUUID(useruuid);
		
		if ((!_userarray) || (!_userarray['id']))
			throw new Error('could not find user with uuid ' + useruuid);
		
		var _userkey = this.getUserKeyFromUserKeyUUID(useruuid, keyuuid);
		
		switch(_userkey['type']) {
			case -10:
				_userkey['type'] = 0;
				break;
			case -11:
				_userkey['type'] = 1;
				break;
			default:
				return;
		}

		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('keys');
		var _keyuuid = mysqlcon.escape(keyuuid);
		
		var sql;
		
		// open connection
		mysqlcon.open();
		
		sql = `UPDATE ` +  tablename + ` SET
		  Type = '` + _userkey['type'] + `'
				WHERE UserId = ` + _userarray['id'] + ` AND ` + tablename + `.KeyUUID = ` + _keyuuid + `;`;;
		
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
	}
	
	removeUserKey(useruuid, keyuuid) {
		var global = this.global;
		
		var _userarray = this.getUserArrayFromUUID(useruuid);
		
		if (!_userarray)
			throw new Error('could not find user with uuid ' + useruuid);
		
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('keys');
		var _keyuuid = mysqlcon.escape(keyuuid);
		
		var sql;
		
		// open connection
		mysqlcon.open();
		
		sql = `DELETE FROM ` +  tablename + ` WHERE KeyUUID=` + _keyuuid + ` AND UserId=` + _userarray['id'] + `;`;
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
	}
}


module.exports = DataBasePersistor;