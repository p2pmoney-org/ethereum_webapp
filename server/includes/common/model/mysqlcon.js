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
		this.isconnecting = false;
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

	async isActiveAsync() {
		await this.openAsync();
		
		var isactive = this.connectionactive;
		
		await this.closeAsync();
		
		return isactive;
	}

	async _connectAsync() {
		var global = this.global;
		
		global.log("connecting to mysql database");
		
		try {
			var mysql = require('mysql');
			
			var host = this.host;
			var port = this.port;
			var database = this.database;
			var user = this.username;
			var password = this.password;

			if (this.connection) {
				global.log("warning: race condition when connecting to mysql database");
			}
			else {
				this.connection = mysql.createConnection({
					host: host,
					port: port,
					database: database,
					user: user,
					password: password
				});

				// catch errors
				this.connection.on('error', (err) => {
					global.log("error on connection to mysql database: " + err);
					try {
						global.log("error on connection opencount was: " + this.opencount);
						if (this.connection) {
							console.log('ending connection on error');
							this.connection.end();
							this.connection = null;
							this.connectionactive = false;
						}
						else {
							console.log('this.connection was null!');
							this.connectionactive = false;
						}	
					}
					catch(e) {
						global.log("exception in onConnectionError: " + e);
					}
				});
			}


			// connects
			if (!this.connection._connection_promise) {
				this.isconnecting = true;

				this.connection._connection_promise = new Promise((resolve, reject) => {
					this.connection.connect((err) => {
						if (err) {
							global.log("error connecting to mysql database: " + err);
							
							this.connectionactive = false;
							this.isconnecting = false;
							resolve(false);
						}
						else {
							global.log("successfully connected to mysql database: " + database);
		
							this.connectionactive = true;
							this.isconnecting = false;
							resolve(true);
						}
					
					});
				});
			}
			
		}
		catch(e) {
			this.connectionactive = false;
			
			global.log("exception connecting to mysql database; " + e);
		}

		return this.connection._connection_promise;
	}
	
	_connect() {
		var global = this.global;
		
		global.log("connecting to mysql database");
		global.log("OBSOLETE: use _connectAsync!!!");
		
		var finished = false;

		try {
			this._connectAsync()
			.then( () => {
				finished = true;
			})
			.catch(err => {
				finished = true;
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

	async getMysqlServerVersionAsync() {
		var global = this.global;
		var output = false;
		
		var sql = 'SELECT VERSION();';
		
		await this.openAsync();
		
		var result = await this.executeAsync(sql);
		
		if (result) {
			output = result.rows[0]['VERSION()'];
		}
		
		await this.closeAsync();
		
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

	async openAsync() {
		if (this.opencount > 0) {
			this.opencount++;
			console.log('incrementing connection to mysql server ' + this.opencount);
			return;
		}
		
		console.log('opening connection to mysql server');
		await this._connectAsync();
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
	
	async closeAsync() {
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
		
		if (!this.connection) {
			await this._connectAsync();
		}
		
		var global = this.global;

		global.log("executing mysql query; " + queryString);

		var result = {};

		if (!this.connectionactive)
			return result;
		
		return new Promise((resolve, reject) => {
			this.connection.query(queryString, (err, rows, fields) => {
				if (!err) {
					result['rows'] = rows;
					result['fields'] = fields;
					resolve(result);
				}
				else {
					global.log("error in MySqlConnection.executeAsync: " + err);
					reject(err);
				}
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
		
		return this.connection.escape(val);
	}
	
	async escapeAsync(val) {
		if (!this.connection) {
			await this._connectAsync();
		}

		return this.connection.escape(val);
	}
	
	escapeId(id) {
		if (!this.connection)
			this._connect();
		
		return this.connection.escapeId(id);
	}
	
	async escapeIdAsync(id) {
		if (!this.connection) {
			await this._connectAsync();
		}

		return this.connection.escapeId(id);
	}
		
}

module.exports = MySqlConnection;