/**
 * 
 */
'use strict';

// instantiating global object
var Global = require('./includes/global.js');

var global = Global.getGlobalInstance();

global.log("Started service: " + global.service_name);

global.initServer();



var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('../api/routes/index');
var users = require('../api/routes/users');


var app = express();

// dapp

var dapp_root_dir = (global.dapp_root_dir ? global.dapp_root_dir : '');

global.log("DAPP root directory is " + dapp_root_dir);

//app.use(express.static(dapp_root_dir + '/app'));
app.use("/", express.static(dapp_root_dir + '/app'));
app.use("/contracts", express.static(dapp_root_dir + '/build/contracts'));

// prevent caching to let /api being called
app.disable('etag');

app.use(logger('dev'));

/*
// view engine setup
app.set('views', path.join(__dirname, '../app/views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../app/public')));

app.use('/ui', index);
app.use('/ui/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
*/

//add body-parser as middle-ware for posts.
var BodyParser = require("body-parser");

app.use(BodyParser.urlencoded({ extended: true }));
app.use(BodyParser.json());

//
//routes

//load routes
global.log("Loading routes")
var routes = require('../api/routes/routes.js'); //importing routes
routes(app); //register the routes



module.exports = app;

// www
//#!/usr/bin/env node

/**
 * Module dependencies.
 */

//var app = require('../app');
var debug = require('debug')('ethereum_securities_webapp:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || global.server_listening_port);
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

global.log('Listening on port: ' + port);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
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

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

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

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

