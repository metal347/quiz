var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');

var routes = require('./routes/index');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser('Quiz 2015'));     // semilla 'Quiz 2015' para cifrar cookie
app.use(session());

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// tiempo de sesión sin actividad: 2 min
app.use(function(req, res, next) {
    // si estamos en una sesión
    if (req.session.user) {
        // si nos acabamos de logear, empieza el tiempo de sesión
        if (!req.session.tiempo) {
            req.session.tiempo = new Date().getTime();
        }
        else {
            // si no ha habido actividad en 2 min (120000 ms)
            if (new Date().getTime() - req.session.tiempo > 120000) {
                delete req.session.user;    // eliminamos la sesión
                delete req.session.tiempo;  // eliminamos el tiempo de sesión
            }
            else {
                req.session.tiempo = new Date().getTime();  // empieza de nuevo el tiempo de sesión
            }
        }
    }
    next();
});

// Helpers dinamicos:
app.use(function(req, res, next) {
    // guarda la ruta de cada solicitud HTTP en la variable session.redir para poder redireccionar a la vista anterior después de hacer login o logout
    if (!req.path.match(/\/login|\/logout/)) {
        req.session.redir = req.path;
    }

    // Hacer visible req.session en las vistas
    res.locals.session = req.session;
    next();
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        errors: []
    });
});

module.exports = app;