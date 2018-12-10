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
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('users');
		
		var sql = "SELECT * FROM " + tablename + " WHERE UserUUID = '" + useruuid + "';";
		
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
	
	getUserArray(username) {
		var global = this.global;
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('users');
		
		var sql = "SELECT * FROM " + tablename + " WHERE UserName = '" + username + "';";
		
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
	
	putUserArray(array) {
		var global = this.global;
		
		var useruuid = array['useruuid'];
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
		
		var current = this.getUserArrayFromUUID(useruuid);
		
		if (current.uuid !== undefined) {
			sql = `UPDATE ` +  tablename + ` SET
					  UserEmail = '` + useremail + `',
					  AccountStatus = ` + accountstatus + `,
					  RegistrationDate = ` + registrationon + `,
					  LastModificationOn = ` + lastmodificationon + `,
					  UserName = '` + username + `'
				WHERE UserId = ` + current.id + `;`;
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
		
		var password = array['password'];
		var hashmethod = array['hashmethod'];
		var salt = array['salt'];

		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('users');
		
		var sql;
		
		// open connection
		mysqlcon.open();
		
		var current = this.getUserArrayFromUUID(useruuid);
		
		if (current.uuid !== undefined) {
			sql = `UPDATE ` +  tablename + ` SET
					  Password = '` + password + `',
					  HashMethod = ` + hashmethod + `,
					  Salt = '` + salt + `'
				WHERE UserId = ` + current.id + `;`;
			
			// execute query
			var result = mysqlcon.execute(sql);
		}
		else {
			throw 'could not find user with uuid ' + useruuid;
		}
		
		
		// close connection
		mysqlcon.close();
	}
	
	getUserKeysFromUserUUID(useruuid) {
		var global = this.global;
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('users');
		var keystablename = mysqlcon.getTableName('keys');
		
		var sql = "SELECT * FROM " + tablename;
		sql += " INNER JOIN " + keystablename;
		sql += " ON " + tablename + ".UserId=" + keystablename + ".UserId";
		sql += " WHERE "+ tablename + ".UserUUID = '" + useruuid + "';";
		
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

	getUserKeysFromUserName(username) {
		var global = this.global;
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('users');
		var keystablename = mysqlcon.getTableName('keys');
		
		var sql = "SELECT * FROM " + tablename;
		sql += " INNER JOIN " + keystablename;
		sql += " ON " + tablename + ".UserId=" + keystablename + ".UserId";
		sql += " WHERE "+ tablename + ".UserName = '" + username + "';";
		
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
	
	putUserKey(useruuid, keyuuid, privatekey, publickey, address, rsapublickey, type, description) {
		var global = this.global;
		
		var userarray = this.getUserArrayFromUUID(useruuid);
		
		if ((!userarray) || (!userarray['id']))
			throw 'could not find user with uuid ' + useruuid;
		
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('keys');
		
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
		  '` + keyuuid + `',
		  ` + userarray['id'] + `,
		  '` + useruuid + `',
		  ` + type + `,
		  ` + (privatekey ? `'` + privatekey + `'` : `NULL`) + `,
		  ` + (publickey ? `'` + publickey + `'` : `NULL`) + `,
		  ` + (address ? `'` + address + `'` : `NULL`) + `,
		  ` + (rsapublickey ? `'` + rsapublickey + `'` : `NULL`) + `,
		  ` + (description ? `'` + description + `'` : `NULL`) + `
		  );`;
		
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
	}
	
	updateUserKey(useruuid, keyuuid, description) {
		var global = this.global;
		
		var userarray = this.getUserArrayFromUUID(useruuid);
		
		if ((!userarray) || (!userarray['id']))
			throw 'could not find user with uuid ' + useruuid;
		
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('keys');
		
		var sql;
		
		// open connection
		mysqlcon.open();
		
		sql = `UPDATE ` +  tablename + ` SET
		  Description = '` + description + `'
				WHERE UserId = ` + userarray['id'] + ` AND ` + tablename + `.KeyUUID = '` + keyuuid + `';`;;
		
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
	}
	
	removeUserKey(useruuid, keyuuid) {
		var global = this.global;
		
		var userarray = this.getUserArrayFromUUID(useruuid);
		
		if (!userarray)
			throw 'could not find user with uuid ' + useruuid;
		
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('keys');
		
		var sql;
		
		// open connection
		mysqlcon.open();
		
		sql = `DELETE FROM ` +  tablename + ` WHERE KeyUUID='` + keyuuid + `' AND UserId=` + userarray['id'] + `;`;
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
	}
}


module.exports = DataBasePersistor;