const express = require('express');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const GitHubStrategy = require('passport-github2');
const cors = require('cors');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "https://eviluator-auth.herokuapp.com/auth/github/callback"
},
  (accessToken, refreshToken, profile, done) => {
    process.nextTick(function () {
      // typically we want to associate GitHub account with a user record here
      return done(null, profile);
    });
  }
));

const server = express();

server.use(cors({
  allowedHeaders: ['X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'],
  origin: ['http://localhost:3000', 'https://eviluator-client.herokuapp.com/'],
  credentials: true
}));
server.use(session({ secret: 'wowsosecret', resave: false, saveUninitialized: false }));
server.use(passport.initialize());
server.use(passport.session());
server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json());





//update this right here is the problem
// const checkAuthentication = (req, res, next) => {
//   if (req.isAuthenticated()) {
//     next();
//   } else {
//     next();
//     // res.redirect('/')
//   }
// }

server.get('/', (req, res) => {
  res.send('<h1>hi</h1>');
});

server.get('/auth/github', passport.authenticate('github', { scope: ['user'] }));

server.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
  res.redirect('https://eviluator-client.herokuapp.com/');
});

server.get('/account', (req, res) => {
  if (req.isAuthenticated()) return res.json({user: req.user});
  res.json({user: null});
});

server.get('/logout', (req, res) => {
  req.logout();
  res.redirect('https://eviluator-client.herokuapp.com/');
});

const PORT = process.env.PORT || 3030;
const HOST = process.env.HOST || '0.0.0.0';
server.listen(PORT);