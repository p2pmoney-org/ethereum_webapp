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
		
		this.connection = null;
	}
	
	connect() {
		var global = this.global;
		
		global.log("connecting to mysql database");
		
		var mysql = require('mysql');
		
		var host = this.host;
		var port = this.port;
		var database = this.database;
		var user = this.username;
		var password = this.password;

		this.connection = mysql.createConnection({
		  host: host,
		  database: database,
		  user: user,
		  password: password
		});
		
		var finished = false;

		this.connection.connect(function(err) {
		  if (err) throw err;
		  
		  finished = true;
		});	
		
		
		// wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}
	}
	
	execute(queryString) {
		
		if (!this.connection)
			this.connect();
		
		var global = this.global;

		global.log("executing mysql query; " + queryString);

		var result = [];
		var finished = false;

		this.connection.query(queryString, function(err, rows, fields) {
		    if (err) throw err;
		 
		    result['rows'] = rows;
		    result['fields'] = fields;
		    
		    finished = true;
		    
		    //return result;
		});
		
	    // wait to turn into synchronous call
		while(!finished)
		{require('deasync').runLoopOnce();}
		
		return result;
	}
	
	
}

module.exports = MySqlConnection;