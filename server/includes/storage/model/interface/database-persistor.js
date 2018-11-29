/**
 * 
 */
'use strict';


class DataBasePersistor {
	constructor(service) {
		this.service = service;
		this.global = service.global;
	}
	
	getUserKeyContent(useruuid, key) {
		var global = this.global;
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('storage_users');
		
		var sql = "SELECT * FROM " + tablename + " WHERE " + tablename + ".UserUUID='" + useruuid + "' AND " + tablename + ".Key='" + key + "';";
		
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
	
	putUserKeyContent(useruuid, key, content) {
		var global = this.global;
		

		var mysqlcon = global.getMySqlConnection();
		
		var contentstring = mysqlcon.escape(content);
		
		var tablename = mysqlcon.getTableName('storage_users');
		
		var sql;
		
		// open connection
		mysqlcon.open();
		
		var current = this.getUserKeyContent(useruuid, key);
		
		if (current.key !== undefined) {
			sql = `UPDATE ` +  tablename + ` SET
					  Content = ` + contentstring + `
				WHERE ` + tablename + `.UserUUID = '` + current.useruuid + `' AND ` + tablename + `.Key='` + current.key + `';`;
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
	

	
	removeUserKeyContent(useruuid, key) {
		var global = this.global;
		
		var userarray = this.getUserArrayFromUUID(useruuid);
		
		if (!userarray)
			throw 'could not find user with uuid ' + useruuid;
		
		
		var mysqlcon = global.getMySqlConnection();
		
		var tablename = mysqlcon.getTableName('storage_users');
		
		var sql;
		
		// open connection
		mysqlcon.open();
		
		sql = `DELETE FROM ` +  tablename + ` WHERE ` + tablename + `.UserUUID='` + useruuid + `' AND ` + tablename + `.Key='` + key + `';`;
		
		// execute query
		var result = mysqlcon.execute(sql);
		
		// close connection
		mysqlcon.close();
	}
}


module.exports = DataBasePersistor;