import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import GitHubStrategy from 'passport-github2';
import User from './types/user.type';
import config from './utils/config';
import { findOrCreateController } from './controllers/authentication.controller';

passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: config.google.clientID as string,
      clientSecret: config.google.clientSecret as string,
      callbackURL: config.google.callbackURL as string,
    },
    findOrCreateController
  )
);
passport.use(
  new GitHubStrategy.Strategy(
    {
      clientID: config.github.clientID as string,
      clientSecret: config.github.clientSecret as string,
      callbackURL: config.github.callbackURL as string,
      scope: ['email', 'profile'],
    },
    findOrCreateController
  )
);
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user: User, done) {
  done(null, user);
});

export default passport;
