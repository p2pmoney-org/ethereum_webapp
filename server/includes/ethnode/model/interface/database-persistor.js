/**
 * 
 */
'use strict';


class DataBasePersistor {
	constructor(session) {
		this.session = session;
		this.global = session.global;
	}

	_getSafeUserUUID() {
		var global = this.global;
		var session = this.session;

		var ethnodeservice = global.getServiceInstance('ethnode');

		var _safe_user = ethnodeservice.getEthnodeUser(session);

		return (_safe_user ? _safe_user.getUserUUID() : null);
	}
	
	_getUserArrayFromUUID(useruuid) {
		var global = this.global;
		var session = this.session;
		var array = {id: -1};
		
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

	async _getUserArrayFromUUIDAsync(useruuid) {
		var global = this.global;
		var session = this.session;
		var array = {id: -1};
		
		if (!useruuid)
			return array;
		
		var mysqlcon = await session.getMySqlConnectionAsync();
		
		var tablename = mysqlcon.getTableName('users');
		var _useruuid = await mysqlcon.escapeAsync(useruuid);
		
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

	async getTansactionLogsAsync(ethereum_transaction_uuid) {
		var global = this.global;
		var session = this.session;
		
		var mysqlcon = await session.getMySqlConnectionAsync();
		
		var tablename = mysqlcon.getTableName('ethereum_transactions_logs');
		var _ethereum_transaction_uuid = await mysqlcon.escapeAsync(ethereum_transaction_uuid);
		
		var sql = "SELECT * FROM " + tablename + " WHERE "+ tablename + ".transaction_uuid = " + _ethereum_transaction_uuid + ";";
		
		// open connection
		await mysqlcon.openAsync();
		
		// execute query
		var result =await  mysqlcon.executeAsync(sql);
		
		
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
		await mysqlcon.closeAsync();
			
			
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

	async getUserTansactionLogsAsync(useruuid) {
		var global = this.global;
		var session = this.session;
		
		var userarray = ( useruuid ? await this._getUserArrayFromUUIDAsync(useruuid) : {id: -1});
		var _userid = userarray['id'];
		
		if (_userid == -1)
			return [];

		var mysqlcon = await session.getMySqlConnectionAsync();
		
		var tablename = mysqlcon.getTableName('ethereum_transactions_logs');
		
		var sql = "SELECT * FROM " + tablename + " WHERE "+ tablename + ".UserId = " + _userid + ";";
		
		// open connection
		await mysqlcon.openAsync();
		
		// execute query
		var result = await mysqlcon.executeAsync(sql);
		
		
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
		await mysqlcon.closeAsync();
			
			
		return lines;
		
	}

	putTransactionLog(ethereum_transaction_uuid, method, action, log, transactionHash) {
		var global = this.global;
		var session = this.session;
		
		//var user = this.session.getUser();
		//var useruuid = (user ? user.getUserUUID() : null);
		var useruuid = this._getSafeUserUUID();

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

	async putTransactionLogAsync(ethereum_transaction_uuid, method, action, log, transactionHash) {
		var global = this.global;
		var session = this.session;
		
		//var user = this.session.getUser();
		//var useruuid = (user ? user.getUserUUID() : null);
		var useruuid = this._getSafeUserUUID();

		var userarray = ( useruuid ? await this._getUserArrayFromUUIDAsync(useruuid) : {id: -1});
		
		var mysqlcon = await session.getMySqlConnectionAsync();
		
		var tablename = mysqlcon.getTableName('ethereum_transactions_logs');
		
		var sql;
		
		var CreationDate = await mysqlcon.escapeAsync(new Date());
		
		// open connection
		await mysqlcon.openAsync();
		
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
		var result = await mysqlcon.executeAsync(sql);
		
		// close connection
		await mysqlcon.close();
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

	async getTansactionHashAsync(ethereum_transaction_uuid) {
		var global = this.global;
		var session = this.session;
		
		var mysqlcon = await session.getMySqlConnectionAsync();
		
		var tablename = mysqlcon.getTableName('ethereum_transactions_logs');
		var _ethereum_transaction_uuid = await mysqlcon.escapeAsync(ethereum_transaction_uuid);
		
		var sql = "SELECT * FROM " + tablename + " WHERE "+ tablename + ".transaction_uuid = " + _ethereum_transaction_uuid + " AND "+ tablename + ".action = 1000;";
		
		// open connection
		await mysqlcon.openAsync();
		
		// execute query
		var result = await mysqlcon.executeAsync(sql);
		
		
		var transactionHash;
		
		
		if (result) {
			var rows = (result['rows'] ? result['rows'] : []);
			
			if (rows[0]) {
				var row = rows[0];
				
				transactionHash = row['transactionHash'];
			}
			
		}
		
		
		// close connection
		await mysqlcon.closeAsync();
			
			
		return transactionHash;
		
	}


}


module.exports = DataBasePersistor;