var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var debug = require('debug')('myapp:sserver');

var fs = require("fs");
var dbname = "database.db";
var exists = fs.existsSync(dbname);

if(!exists) {
    console.log("Creating DB file.");
    fs.openSync(dbname, "w");
}

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(dbname);

db.serialize(function() {
    if(!exists) {
        db.run("CREATE TABLE People (Nickname TEXT UNIQUE NOT NULL, PasswordHash TEXT, Expiration INTEGER NOT NULL)");
    }
});

var sapp = express();

// create HTTPS server
var https = require('https');
var privateKey = fs.readFileSync('keys/domain.key', 'utf8');
var certificate = fs.readFileSync('keys/signed.crt', 'utf8');
var options = {key: privateKey, cert: certificate};
var sserver = https.createServer(options, sapp);
sserver.timeout = 5*60000; // 5 minutes
var io = require('socket.io')(sserver);
sserver.listen(3443);
sserver.on('error', onError);
sserver.on('listening', onListening);

var limiter = require("express-rate-limit")();

// view engine setup
sapp.set('views', path.join(__dirname, 'views'));
sapp.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//sapp.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
sapp.use(logger('dev'));
sapp.use(bodyParser.json());
sapp.use(bodyParser.urlencoded({ extended: true }));
sapp.use(cookieParser());
sapp.use(express.static(path.join(__dirname, 'public')));

//var auth = require('basic-auth')
//hasher = require("crypto-js/hmac-sha256");
//decoder = require("crypto-js/enc-base64");
//function hash (pass) { return decoder.stringify(hasher(pass, "asedfgl152O")); };
//
//sapp.use(
//function(req, res, next) {
//    // require credentials (user-password) on every page!
//    var credentials = auth(req);
//
//    if (credentials)
//    {
//        var hashPass = hash(credentials.pass);
//        for (var i=0; i<userDB.length; i++)
//        if (credentials.name == userDB[i][0] && hashPass == userDB[i][1])
//        {
//            console.log("logged in user", userDB[i][0]);
//            req.userID = i;
//            return next();
//        }
//    } 
//    res.statusCode = 401;
//    res.setHeader('WWW-Authenticate', 'Basic realm="Metamorp"');
//    // limit the amount of times we can fail to login!
//    limiter(req, res, function() {res.end("failed");});
//});

require('./routes/secure')(sapp, io, limiter, db);

// catch 404 and forward to error handler
sapp.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
if (sapp.get('env') === 'development') {
  // will print stacktrace
  sapp.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
sapp.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

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
  var addr = sserver.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

module.exports = sapp;
