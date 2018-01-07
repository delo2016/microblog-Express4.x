var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var fs = require('fs');

var routes = require('./routes/index');
var users = require('./routes/users');
var posts = require('./routes/posts');
var MongoStore = require('connect-mongo')(session);
var settings = require('./setting');

var app = express();

var debug = require('debug')('my-application');

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), ()=> {
  debug('Express server listening on port ' + server.address().port);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    resave: true,  
    saveUninitialized: true,  
    cookie: {maxAge:3600000},  
    secret: settings.cookieSecret, 
    db: settings.db
}));

app.use(flash());

app.use((req,res,next)=>{
  res.locals.user=req.session.user;

  var err = req.flash('error');
  var success = req.flash('success');

  res.locals.error = err.length ? err : null;
  res.locals.success = success.length ? success : null;
   
  next();
});


app.use('/', routes);
// var routePath = path.join(__dirname, 'routes/')
// fs.readdir(routePath,(err,files)=>{
//     if(err) return;
//     files.forEach(item => {
//         let routeName = item.split('.');
//         app.use('/'+routeName[0],require('./routes/'+routeName[0]));
//     });
// });

app.use('/users', users);
app.use('/posts',posts);


/// catch 404 and forwa/users/rding to error handler
app.use((req, res, next)=> {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


/// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next)=> {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next)=> {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
