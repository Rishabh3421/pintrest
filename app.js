const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const expressSession = require('express-session');
const passport = require('passport');
const flash = require('express-flash');

// const crypto = require('crypto');
// const secret = crypto.randomBytes(64).toString('hex');

const app = express();

// Add this middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(expressSession({
  resave:false,
  saveUninitialized:false,
  secret:"ola mego"
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); 

passport.serializeUser(usersRouter.serializeUser()); // used plm to declare this in users.js
passport.deserializeUser(usersRouter.deserializeUser()); // used plm to declare this in users.js

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes setup
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });

module.exports = app;
