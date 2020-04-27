/**
 * 
 */
'use strict';


class MySqlConnection {
	
	constructor(global, host, port, database, username, password) {
		this.global = global;
		
		this.host = host;
		this.port = port;
		this.database = database;
		this.username = username;
		this.password = password;
		
		this.table_prefix = null;
		
		this.connection = null;
		this.opencount = 0;
		this.connectionactive = false;
	}
	
	clone() {
		var connection = new MySqlConnection(this.global, this.host, this.port, this.database, this.username, this.password);
		
		return connection;
	}
	
	isActive() {
		this.open();
		
		var isactive = this.connectionactive;
		
		this.close();
		
		return isactive;
	}
	
	_connect() {
		var global = this.global;
		
		global.log("connecting to mysql database");
		
		var finished = false;

		try {
			var mysql = require('mysql');
			
			var self = this;
			
			var host = this.host;
			var port = this.port;
			var database = this.database;
			var user = this.username;
			var password = this.password;

			this.connection = mysql.createConnection({
				host: host,
				port: port,
				database: database,
				user: user,
				password: password
			});
			
			this.connection.connect(function(err) {
				if (err) {
					global.log("error connecting to mysql database: " + err);
					
					self.connectionactive = false;
					finished = true;

					//throw err;
				}
				else {
					global.log("successfully connected to mysql database: " + database);

					self.connectionactive = true;
					finished = true;
				}
			
			});	
			
		}
		catch(e) {
			this.connectionactive = false;
			finished = true;
			
			global.log("exception connecting to mysql database; " + e);
		}
		
		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce(this);}
	}
	
	getMysqlServerVersion() {
		var global = this.global;
		var output = false;
		
		var sql = 'SELECT VERSION();';
		
		this.open();
		
		var result = this.execute(sql);
		
		if (result) {
			output = result.rows[0]['VERSION()'];
		}
		
		this.close();
		
		return output;
	}
	
	open() {
		if (this.opencount > 0) {
			this.opencount++;
			console.log('incrementing connection to mysql server ' + this.opencount);
			return;
		}
		
		console.log('opening connection to mysql server');
		this._connect();
		this.opencount = 1;
	}
	
	close() {
		this.opencount--;
		console.log('decrementing connection to mysql server ' + this.opencount);
		
		if (this.opencount <= 0) {
			if (this.connection) {
				console.log('ending connection to mysql server');
				this.connection.end();
				this.connection = null;
				this.connectionactive = false;
			}
			
			this.opencount = 0;
		}
		
	}
	
	setTablePrefix(prefix) {
		this.table_prefix = prefix;
	}
	
	getTableName(tablename) {
		if (this.table_prefix) {
			return this.database + '.' + this.table_prefix + tablename;
		}
		else {
			return this.database + '.' + tablename;
		}
	}
	
	
	execute(queryString) {
		
		if (!this.connection)
			this._connect();
		
		var global = this.global;

		global.log("executing mysql query; " + queryString);

		var result = {};

		if (!this.connectionactive)
			return result;
		
		var finished = false;

		this.connection.query(queryString, function(err, rows, fields) {
			// if (err) throw err;
			
			if (!err) {
				result['rows'] = rows;
				result['fields'] = fields;
			}
			else {
				global.log("error in MySqlConnection.execute: " + err);
			}
			
			finished = true;
			
			return result;
		});
		
		// wait to turn into synchronous call
		while(!finished)
		{global.deasync().runLoopOnce(this);}
		
		return result;
	}
	
	async executeAsync(queryString) {
		
		if (!this.connection)
			this._connect();
		
		var global = this.global;

		global.log("executing mysql query; " + queryString);

		var result = {};

		if (!this.connectionactive)
			return result;
		
		return new Promise((resolve, reject) => {
			this.connection.query(queryString, function(err, rows, fields) {
				// if (err) throw err;
				
				if (!err) {
					result['rows'] = rows;
					result['fields'] = fields;
				}
				else {
					global.log("error in MySqlConnection.executeAsync: " + err);
				}
				
				resolve(result);
			});
		})
		.then((res) => {
			return result;
		})
		.catch(err => {
			return result;
		});
	}
	
	escape(val) {
		if (!this.connection)
			this._connect();
		
		/*if (!this.connectionactive)
			return val;*/
		
		return this.connection.escape(val);
	}
	
	escapeId(id) {
		if (!this.connection)
			this._connect();
		
		/*if (!this.connectionactive)
			return id;*/
		
		return this.connection.escapeId(id);
	}
	
	
}

module.exports = MySqlConnection;