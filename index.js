const express = require('express');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const GitHubStrategy = require('passport-github2');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:3030/auth/github/callback"
},
  (accessToken, refreshToken, profile, done) => {
    process.nextTick(function () {
      // typically we want to associate GitHub account with a user record here
      return done(null, profile);
    });
  }
));

const server = express();

server.use(session({ secret: 'wowsosecret', resave: false, saveUninitialized: false }));
server.use(passport.initialize());
server.use(passport.session());
server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json());

const checkAuthentication = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/')
  }
}

server.get('/', (req, res) => {
  res.send('<a href="/auth/github">Hello! Please log in with GitHub!</a>')
});

server.get('/auth/github', passport.authenticate('github', { scope: ['user'] }));

server.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/account');
});

server.get('/account', checkAuthentication, (req, res) => {
  const user = req.user;
  const username = user.username;
  res.send('Hello, ' + username);
});

server.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

const PORT = process.env.PORT || 3030;
const HOST = process.env.HOST || '0.0.0.0';
server.listen(PORT, HOST, error => {
  if (error) return console.log(error);
  console.log(`OAuth server listening on http://${HOST}:${PORT}`);
});