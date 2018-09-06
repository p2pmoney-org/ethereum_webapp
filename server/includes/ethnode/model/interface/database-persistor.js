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
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('users');
		
		var sql = "SELECT * FROM " + tablename + " WHERE UserUUID = '" + useruuid + "';";
		
		// open connection
		mysqlcon.open();
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		
		var array = {};
		
		if (result) {
			var rows = result['rows'];
			
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
	
	putTransactionLog(ethereum_transaction_uuid, method, action, log) {
		var global = this.global;
		var session = this.session;
		
		var user = this.session.getUser();
		var useruuid = (user ? user.getUserUUID() : null);
		var userarray = ( useruuid ? this._getUserArrayFromUUID(useruuid) : {id: -1});
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('ethereum_transactions_logs');
		
		var sql;
		
		var CreationDate = mysqlcon.escape(new Date());
		
		// open connection
		mysqlcon.open();
		
		sql = `INSERT INTO ` +  tablename + ` (
				ethereum_transaction_uuid,
				UserId,
				method,
				action,
				CreationDate,
				log
		  )
		  VALUES (
		  '` + ethereum_transaction_uuid + `',
		  ` + userarray['id'] + `,
		  '` + method + `',
		  ` + action + `,
		  ` + CreationDate + `,
		  '` + log + `'
		  );`;
		
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
	}
	
}


module.exports = DataBasePersistor;