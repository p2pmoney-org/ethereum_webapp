/**
 * 
 */
'use strict';


class Service {
	
	constructor() {
		this.name = 'admin';
		this.global = null; // filled by Global on service registration
		
		this.adminserver = null;
	}
	
	loadService() {
		this.global.log('loadService called for service ' + this.name);
		
	}

	startAdminUI(app) {
		var global = this.global;
		
		global.log('startAdminUI called for ' + this.name);

		var express = require('express');
		var path = require('path');
		var favicon = require('serve-favicon');
		var logger = require('morgan');
		var cookieParser = require('cookie-parser');
		var bodyParser = require('body-parser');
		
		var adminapproot = '../../../app/admin'
		
		var AdminRoutes = require( adminapproot + '/routes/adminroutes.js');
		var adminroutes = new AdminRoutes(global);
		//var index = require( adminapproot + '/routes/index');
		//var users = require( adminapproot + '/routes/users');


		// view engine setup
		app.set('views', path.join(__dirname,  adminapproot + '/views'));
		app.set('view engine', 'pug');

		// uncomment after placing your favicon in /public
		//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
/*		app.use(logger('dev'));
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: false }));
		app.use(cookieParser());*/
		
		// static files
		app.use('/admin/public/', express.static(path.join(__dirname,  adminapproot + '/public')));

		app.use('/admin', adminroutes.router());
		//app.use('/admin/users', users);

		// catch 404 and forward to error handler
		/*app.use(function(req, res, next) {
		  var err = new Error('Not Found');
		  err.status = 404;
		  next(err);
		});*/

		// error handler
		app.use(function(err, req, res, next) {
		  // set locals, only providing error in development
		  res.locals.message = err.message;
		  res.locals.error = req.app.get('env') === 'development' ? err : {};

		  // render the error page
		  res.status(err.status || 500);
		  res.render('error');
		});
		
	}
	
	getAdminServer() {
		if (this.adminserver)
			return this.adminserver;
		
		var global = this.global;
		var AdminServer = require('./model/admin-server.js');
		
		this.adminserver = new AdminServer(global);
		
		return this.adminserver;
	}

}

module.exports = Service;