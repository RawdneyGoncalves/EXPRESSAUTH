
const express = require('express');
const hash = require('pbkdf2-password')
const path = require('path');
const session = require('express-session');
const ejs = require('ejs');
const app = module.exports = express();
const PORT = process.env.PORT || 3000

//config 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middleware 

app.use(express.urlencoded({extended: false}));
app.use(session({
    resave:false, 
    saveUninitialized: false, 
    secret: 'shhhh, very secret'
}));
// messagem middleware

app.use(function(req, res, next){
    const err = req.session.error;
    const msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
    if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
    next();
  });

  // database
const users = { 
    rawdney: { name: 'rawdney'}
};

//salth 

hash({ password: '29042002' }, function (err, pass, salt, hash) {
    if (err) throw err;
    // local armazenada a senha: 
    users.rawdney.salt = salt;
    users.rawdney.hash = hash;
  });

  // Authenticate 

function authenticate(name, pass, fn) {
    if (!module.parent) console.log('authenticating %s:%s', name, pass);
    const user = users[name];
    if (!user) return fn(null, null)
  
    hash({ password: pass, salt: user.salt }, function (err, pass, salt, hash) {
      if (err) return fn(err);
      if (hash === user.hash) return fn(null, user)
      fn(null, null)
    });
  }
  
  function restrict(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.session.error = 'Acesso negado, verifique a senha!';
      res.redirect('/login');
    }
  }
  
  app.get('/', function(req, res){
    res.redirect('/login');
  });
  
  app.get('/restricted', restrict, function(req, res){
    res.send('uau, você está em uma área restrita  use: <a href="/logout">logout</a>, para desconectar :)');
  });
  
  app.get('/logout', function(req, res){
    req.session.destroy(function(){
      res.redirect('/');
    });
  });
  
  app.get('/login', function(req, res){
    res.render('login');
  });
  
  app.post('/login', function (req, res, next) {
    authenticate(req.body.username, req.body.password, function(err, user){
      if (err) return next(err)
      if (user) {
        req.session.regenerate(function(){
          req.session.user = user;
          req.session.success = 'Logado: ' + user.name
            + ' clique em  <a href="/logout">logout</a> para desconectar. '
            + ' você está logado <a href="/restricted">/restricted</a>.';
          res.redirect('back');
        });
      } else {
        req.session.error = 'Login falhou, verifique seu login/senha e tente novamente'
          + ' login e senha.'
          + ' (use "rawdney" ou "foobar")';
        res.redirect('/login');
      }
    });
  });

  if (!module.parent) {
    app.listen(PORT, () => 
    console.log(`Servidor rodando na porta ${PORT}`));
  }
