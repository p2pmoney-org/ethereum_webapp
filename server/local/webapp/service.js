/**
 * 
 */
'use strict';
var webapp;

class Service {
	
	constructor() {
		this.name = 'ethereum_webapp';
		this.global = null;
		
		this.app = null;
		this.server = null;
		this.debug = null;
		
		this.port = null;

		this.apikeys = [];
	}
	
	loadService() {
		this.global.log('loadService called for service ' + this.name);
		
		var path = require('path');

		var global = this.global;
		var config = global.config;

		this.dapp_root_base_dir = (config && (typeof config["dapp_root_dir"] != 'undefined') ? config["dapp_root_dir"] : null);
		
		this.overload_dapp_files = (config && (typeof config["overload_dapp_files"] != 'undefined') ? config["overload_dapp_files"] : 0);
		
		this.webapp_app_dir = (config && (typeof config["webapp_app_dir"] != 'undefined') ? config["webapp_app_dir"] : path.join(global.execution_dir, './webapp/app'));
		this.copy_dapp_files = (config && (typeof config["copy_dapp_files"] != 'undefined') ? config["copy_dapp_files"] : 0);
		
		this.dapp_root_exec_dir = (this.copy_dapp_files == 1 ? path.join(this.webapp_app_dir, '../') : this.dapp_root_base_dir);
		
		this.rest_server_url = (config && (typeof config["rest_server_url"] != 'undefined') ? config["rest_server_url"] :"http://localhost:8000");
		this.rest_server_api_path = (config && (typeof config["rest_server_api_path"] != 'undefined') ? config["rest_server_api_path"] :"/dapp/api");

		this.dapp_index_url = (config && (typeof config["dapp_index_url"] != 'undefined') ? config["dapp_index_url"] : this.rest_server_url + "/dapp/index.html");

		if (this.copy_dapp_files == 1) {
			global.log("Copying DAPP app directory")
			// copy dapp files to webapp dir
			this.copyDappFiles();
		}
		
		if (this.overload_dapp_files == 1) {
			global.log("Overloading DAPP files")
			// copy files to standard dapp
			this.overloadDappFiles();
		}
		
		this.RequestValidator = require('./model/requestvalidator.js');

		var apikeysjson = global.readJson("apikeys");
		
		for(var key in apikeysjson)
			this.apikeys.push(apikeysjson[key]);		
	}
	
	// optional  service functions
	registerHooks() {
		console.log('registerHooks called for ' + this.name);
		
		var global = this.global;
		
		global.registerHook('installWebappConfig_hook', this.name, this.installWebappConfig_hook);
	}
	
	installWebappConfig_hook(result, params) {
		var global = this.global;

		global.log('installWebappConfig_hook called for ' + this.name);
		

		var session = params[0];
		var config = params[1];
		
		config.dapp_root_dir="/home/appuser/usr/local/ethereum_dapp";
		config.overload_dapp_files=1;
		config.copy_dapp_files=1;
		config.webapp_app_dir="/home/appuser/var/lib/ethereum_webapp/app";
		
		result.push({service: this.name, handled: true});
	}
	
	//
	// hooks
	//
	
	// functions
	getApiKeys() {
		return this.apikeys;
	}
	
	copyDappFiles() {
		var global = this.global;
		var path = require('path');
		var fs = require('fs');
		
		var sourcedir = path.join(this.dapp_root_base_dir, './app');
		var destdir = this.webapp_app_dir;
		
		global.copydirectory(sourcedir, destdir);
		
		// compiled contracts
		
		// remove copied simlink, if any
		var contractslink =  path.join(this.webapp_app_dir, './contracts');
		if (global._checkFileExist(fs, contractslink) ) {
			fs.unlink(contractslink);
		}
		
		sourcedir = path.join(this.dapp_root_base_dir, './build');
		destdir = path.join(this.webapp_app_dir, '../build');
		
		global.copydirectory(sourcedir, destdir);
		
	}
	
	overloadDappFiles() {
		var global = this.global;
		var fs = require('fs');
		var path = require('path');
		
		var sourcepath;
		var destdir;
		
		
		// replace xtr-config.js
		sourcepath = global.base_dir + '/dapp/js/src/xtra/xtra-config.js';
		destdir = (this.copy_dapp_files ? path.join(this.webapp_app_dir, './js/src/xtra') : path.join(this.dapp_root_exec_dir, './app/js/src/xtra'));
		
		global.copyfile(fs, path, sourcepath, destdir);
		
		
		
		
		// copy files from xtra/interface (e.g.  ethereum-node-access.js)
		var sourcedir = global.base_dir + '/dapp/js/src/xtra/interface';
		
		if (global._checkFileExist(fs, sourcedir)) {
			destdir = (this.copy_dapp_files ? path.join(this.webapp_app_dir, './js/src/xtra/interface') : path.join(this.dapp_root_exec_dir, './app/js/src/xtra/interface'));
			
			global.copydirectory(sourcedir, destdir);
		}
		
		// copy modules in includes/modules
		var sourcedir = global.base_dir + '/dapp/includes/modules';
		
		if (global._checkFileExist(fs, sourcedir)) {
			destdir = (this.copy_dapp_files ? path.join(this.webapp_app_dir, './includes/modules') : path.join(this.dapp_root_exec_dir, './app/includes/modules'));
			
			global.copydirectory(sourcedir, destdir);
		}
		
		// copy modules in dapps
		var sourcedir = global.base_dir + '/dapp/dapps';
		
		if (global._checkFileExist(fs, sourcedir)) {
			destdir = (this.copy_dapp_files ? path.join(this.webapp_app_dir, './dapps') : path.join(this.dapp_root_exec_dir, './app/dapps'));
			
			global.copydirectory(sourcedir, destdir);
		}
	}

	getServedDappDirectory() {
		if (this.copy_dapp_files == 1) {
			var path = require('path');

			return path.join(this.webapp_app_dir, '/../');
		}
		else {
			if (this.dapp_root_exec_dir) {
				return this.dapp_root_exec_dir;
			}
			else {
				return global.execution_dir + '/webapp';
			}
		}
	}
	
	getServedDappIndexUrl() {
		return this.dapp_index_url;
	}
	
	startWebApp() {
		var global = this.global;
		webapp = this;
		
		var express = require('express');
		var path = require('path');
		var favicon = require('serve-favicon');
		var logger = require('morgan');
		var cookieParser = require('cookie-parser');
		var bodyParser = require('body-parser');

		var app = express();
		
		this.app = app;

		var dapp_root_dir = this.getServedDappDirectory();


		//app.use(express.static(dapp_root_dir + '/app'));
		app.use("/", express.static(dapp_root_dir + '/app'));
		app.use("/contracts", express.static(dapp_root_dir + '/build/contracts'));

		// prevent caching to let /api being called
		app.disable('etag');

		app.use(logger('dev'));

		// allow Cross Origin Resource Share
		app.use(function(req, res, next) {
			var origin = "*"; // domain allowed to cross
			var headers = "Origin, X-Requested-With, Content-Type, Accept"; // standard fields
			headers += ", sessiontoken, accesstoken, apikey"; // specific fields
			
			res.header("Access-Control-Allow-Origin", origin);
			res.header("Access-Control-Allow-Headers", headers);
			res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
			
			next();
		});

		return app;
	}

	startMiddleware() {
		var global = this.global;
		var app = this.app;
		
		//
		// Middleware
		//

		//global.log("Adding middle-ware to validate requests")

		// add middle-ware to check requests (apikey,..)
		// (should be done before loading routes!)
		var RequestValidator = this.RequestValidator;

		var requestvalidator = new RequestValidator(global, this);

		app.use(function(req, res, next) { return requestvalidator.validate(req, res, next);})

		//add body-parser as middle-ware for posts.
		var BodyParser = require("body-parser");

		app.use(BodyParser.urlencoded({ extended: true }));
		app.use(BodyParser.json());

		//
		// routes for REST APIs
		//

		//load routes
		global.log("Loading routes");
		
		var apiroot = '../../../api';
		
		var routes = require( apiroot + '/routes/routes.js'); //importing routes
		routes(app, global); //register the routes


		// export if require used on this file
		//module.exports = app;

		// www
		//#!/usr/bin/env node

		/**
		 * Module dependencies.
		 */

		//var app = require('../app');
		var debug = require('debug')('ethereum_securities_webapp:server');
		var http = require('http');
		
		this.debug = debug;

		/**
		 * Get port from environment and store in Express.
		 */

		var port = this.normalizePort(process.env.PORT || global.server_listening_port);
		this.port = port;
		app.set('port', port);

		/**
		 * Create HTTP server.
		 */

		var server = http.createServer(app);
		
		this.server = server;

		/**
		 * Listen on provided port, on all network interfaces.
		 */

		global.log('Listening on port: ' + port);

		server.listen(port);
		server.on('error', this.onError);
		server.on('listening', this.onListening);

		return app;
	}
	
	// service functions
	getContractArtifactFullPath(artifactpath) {
		var path = require('path');
		
		var global = this.global;
		
		var dapp_root_dir = this.dapp_root_exec_dir;
		
		var truffle_relative_build_dir = './build';
		
		var build_dir = path.join(dapp_root_dir, truffle_relative_build_dir);
		
		return path.join(build_dir, artifactpath);
	}
	
	getContractArtifactContent(artifactpath) {
		var fs = require('fs');

		var global = this.global;
		
		
		var jsonPath;
		var jsonFile;

		try {
			jsonPath = this.getContractArtifactFullPath(artifactpath);

			global.log("reading artifact " + jsonPath);
			
			//jsonFile = fs.readFileSync(jsonPath, 'utf8');
			jsonFile = fs.readFileSync(jsonPath);
			
		}
		catch(e) {
			global.log('exception reading json file: ' + e.message); 
		}
		
		return jsonFile;
	}
	
	/**
	 * Normalize a port into a number, string, or false.
	 */

	normalizePort(val) {
	  var port = parseInt(val, 10);

	  if (isNaN(port)) {
	    // named pipe
	    return val;
	  }

	  if (port >= 0) {
	    // port number
	    return port;
	  }

	  return false;
	}

	/**
	 * Event listener for HTTP server "error" event.
	 */

	onError(error) {
	  if (error.syscall !== 'listen') {
	    throw error;
	  }
	  
	  var port = this.port;

	  var bind = typeof port === 'string'
	    ? 'Pipe ' + port
	    : 'Port ' + port;

	  // handle specific listen errors with friendly messages
	  switch (error.code) {
	    case 'EACCES':
	      console.error(bind + ' requires elevated privileges');
	      process.exit(1);
	      break;
	    case 'EADDRINUSE':
	      console.error(bind + ' is already in use');
	      process.exit(1);
	      break;
	    default:
	      throw error;
	  }
	}

	/**
	 * Event listener for HTTP server "listening" event.
	 */

	onListening() {
	  var addr = webapp.server.address();
	  var bind = typeof addr === 'string'
	    ? 'pipe ' + addr
	    : 'port ' + addr.port;
	  webapp.debug('Listening on ' + bind);
	}


}



module.exports = Service;
