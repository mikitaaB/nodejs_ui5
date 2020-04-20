var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var mongoose = require("mongoose");
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var cors = require("cors");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var personsRouter = require("./routes/persons");
var uploadRouter = require('./routes/uploadRouter');

var passport = require('passport');
var authenticate = require('./authenticate');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/persons', personsRouter.getPersons);
app.get('/persons/:id', personsRouter.getPersonById);
app.post('/persons', personsRouter.postPerson);
app.put('/persons/:id', personsRouter.putPerson);
app.delete('/persons/:id', personsRouter.deletePerson);

app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}));

app.use(passport.initialize());
app.use(passport.session());

// app.use('/persons', personsRouter);
app.use('/users', usersRouter);
app.use('/', indexRouter);
app.use('/imageUpload',uploadRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

module.exports = app;
