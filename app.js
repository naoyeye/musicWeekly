/*global $, Modernizr, require, __dirname, module*/

/*
* @Author: hanjiyun
* @Date:   2014-05-22 16:46:34
* @Last Modified by:   Jiyun
* @Last Modified time: 2015-06-21 16:27:01
*/


var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var everyauthCN = require('everyauth-cn');

everyauthCN.douban.scope('douban_basic_common,shuo_basic_w,shuo_basic_r');

// everyauthCN.douban.redirectPath('/connect/douban/callback');

var routes = require('./app/routes/index');
var admin = require('./app/routes/admin');

var app = express();

// everyauthCN.helpExpress(app);

require('./app/config/auth-settings');


everyauthCN.debug = true;

// everyauthCN.everymodule.findUserById( function (req, userId, callback) {

//     // use the request in some way ...

//     // callback has the signature, function (err, user) {...}
//     console.log('userId', userId);
// });

// var usersById = {};
// var nextUserId = 0;

// // everyauthCN.everymodule.findUserById( function (userId, callback) {
// //   User.findById(userId, callback);
// //   // callback has the signature, function (err, user) {...}
// // });
// everyauthCN.everymodule.findUserById( function (id, callback) {
//     callback(null, usersById[id]);
// });


// function addUser (source, sourceUser) {
//     var user;
//     if (arguments.length === 1) { // password-based
//         user = sourceUser = source;
//         user.id = ++nextUserId;
//         return usersById[nextUserId] = user;
//     } else { // non-password-based
//         user = usersById[++nextUserId] = {id: nextUserId};
//         user[source] = sourceUser;
//     }
//     return user;
// }

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'app/public/img/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('musicweekly'));
// app.use(session());
app.use(session({
    secret: 'everyauth-cn',
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
}));
app.use(express.static(path.join(__dirname, 'app/public')));
app.use('/src', express.static(path.join(__dirname, 'app/src')));
app.use(everyauthCN.middleware());




// routes
app.use('/', routes);
app.use('/admin', admin);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
