const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let [user] = await User.findOrCreate({
        where: { googleId: profile.id },
        defaults: {
          username: profile.displayName,
          email: profile.emails[0].value
        }
      });
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // Redirect to frontend with token
    res.redirect(`http://localhost:5173/login-success?token=${token}`);
  });

module.exports = router;
