/**
 * 
 */
'use strict';


class DataBasePersistor {
	constructor(session) {
		this.session = session;
		this.global = session.global;
	}
	
	_getUserArrayFromUUID(useruuid) {
		var global = this.global;
		var session = this.session;
		var array = {};
		
		if (!useruuid)
			return array;
		
		var mysqlcon = session.getMySqlConnection();
		
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
	
	getTansactionLogs(ethereum_transaction_uuid) {
		var global = this.global;
		var session = this.session;
		
		var mysqlcon = session.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('ethereum_transactions_logs');
		var _ethereum_transaction_uuid = mysqlcon.escape(ethereum_transaction_uuid);
		
		var sql = "SELECT * FROM " + tablename + " WHERE "+ tablename + ".transaction_uuid = " + _ethereum_transaction_uuid + ";";
		
		// open connection
		mysqlcon.open();
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		
		var lines = [];
		
		
		if (result) {
			var rows = (result['rows'] ? result['rows'] : []);
			
			for (var i = 0; i < rows.length; i++) {
				var row = rows[i];
				var line = [];
				
				line['transactionuuid'] = row['transaction_uuid'];
				line['userid'] = row['UserId'];
				line['method'] = row['method'];
				line['action'] = row['action'];
				line['creationdate'] = row['CreationDate'];
				line['log'] = row['log'];
				line['transactionhash'] = row['transactionHash'];
				
				lines.push(key);
			}
			
		}
		
		
		// close connection
		mysqlcon.close();
			
			
		return lines;
		
	}
	
	getUserTansactionLogs(useruuid) {
		var global = this.global;
		var session = this.session;
		
		var userarray = ( useruuid ? this._getUserArrayFromUUID(useruuid) : {id: -1});
		var _userid = userarray['id'];
		
		if (_userid == -1)
			return [];

		var mysqlcon = session.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('ethereum_transactions_logs');
		
		var sql = "SELECT * FROM " + tablename + " WHERE "+ tablename + ".UserId = " + _userid + ";";
		
		// open connection
		mysqlcon.open();
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		
		var lines = [];
		
		
		if (result) {
			var rows = (result['rows'] ? result['rows'] : []);
			
			for (var i = 0; i < rows.length; i++) {
				var row = rows[i];
				var line = [];
				
				line['transactionuuid'] = row['transaction_uuid'];
				line['userid'] = row['UserId'];
				line['method'] = row['method'];
				line['action'] = row['action'];
				line['creationdate'] = row['CreationDate'];
				line['log'] = row['log'];
				line['transactionhash'] = row['transactionHash'];
				
				lines.push(line);
			}
			
		}
		
		
		// close connection
		mysqlcon.close();
			
			
		return lines;
		
	}

	putTransactionLog(ethereum_transaction_uuid, method, action, log, transactionHash) {
		var global = this.global;
		var session = this.session;
		
		var user = this.session.getUser();
		var useruuid = (user ? user.getUserUUID() : null);
		var userarray = ( useruuid ? this._getUserArrayFromUUID(useruuid) : {id: -1});
		
		var mysqlcon = session.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('ethereum_transactions_logs');
		
		var sql;
		
		var CreationDate = mysqlcon.escape(new Date());
		
		// open connection
		mysqlcon.open();
		
		sql = `INSERT INTO ` +  tablename + ` (
				transaction_uuid,
				UserId,
				method,
				action,
				CreationDate,
				log,
				transactionHash
		  )
		  VALUES (
		  '` + ethereum_transaction_uuid + `',
		  ` + userarray['id'] + `,
		  '` + method + `',
		  ` + action + `,
		  ` + CreationDate + `,
		  '` + log + `',
		  ` + (transactionHash ? `'` + transactionHash + `'` : `NULL`) + `
		  );`;
		
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
	}
	
	getTansactionHash(ethereum_transaction_uuid) {
		var global = this.global;
		var session = this.session;
		
		var mysqlcon = session.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('ethereum_transactions_logs');
		var _ethereum_transaction_uuid = mysqlcon.escape(ethereum_transaction_uuid);
		
		var sql = "SELECT * FROM " + tablename + " WHERE "+ tablename + ".transaction_uuid = " + _ethereum_transaction_uuid + " AND "+ tablename + ".action = 1000;";
		
		// open connection
		mysqlcon.open();
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		
		var transactionHash;
		
		
		if (result) {
			var rows = (result['rows'] ? result['rows'] : []);
			
			if (rows[0]) {
				var row = rows[0];
				
				transactionHash = row['transactionHash'];
			}
			
		}
		
		
		// close connection
		mysqlcon.close();
			
			
		return transactionHash;
		
	}

}


module.exports = DataBasePersistor;