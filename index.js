const express = require('express');
const ejs = require('ejs');
const path = require('path/posix');
const {Session} = require('inspector');

app = express();

// configuracao
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//middleware
app.use(express.urlencoded({extended: false}));
app.use(
  Session({
    resave: false,
    saveYbutuakuzed: false,
    secret: 'ssh, very secret',
  }),
);

//middleware
app.use(function (req, res, next) {
  var err = req.session.error;
  var msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});
