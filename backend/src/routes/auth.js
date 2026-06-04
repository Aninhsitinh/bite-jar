const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const router = express.Router();

passport.use(new GoogleStrategy({
    clientID: (process.env.GOOGLE_CLIENT_ID || "").trim(),
    clientSecret: (process.env.GOOGLE_CLIENT_SECRET || "").trim(),
    callbackURL: `${(process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '')}/api/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
      if (!email) {
        return done(new Error("No email found in Google profile"), null);
      }
      
      // 1. Tìm theo googleId
      let user = await prisma.users.findUnique({
        where: { googleId: profile.id }
      });

      // 2. Nếu không thấy, tìm theo email (để gộp tài khoản)
      if (!user) {
        user = await prisma.users.findUnique({
          where: { email: email }
        });

        if (user) {
          // Cập nhật googleId cho user đã có sẵn email
          user = await prisma.users.update({
            where: { id: user.id },
            data: { googleId: profile.id }
          });
        }
      }

      // 3. Nếu vẫn không thấy, tạo mới hoàn toàn
      if (!user) {
        user = await prisma.users.create({
          data: {
            googleId: profile.id,
            username: profile.displayName,
            email: email,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }

      return done(null, user);
    } catch (err) {
      console.error('[OAuth Error]:', err);
      // Truyền lỗi chi tiết để route callback có thể bắt được
      return done(err, null);
    }
  }
));

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err) {
        // Thay vì crash văng ra Internal Server Error, ta trả về JSON chi tiết để dễ debug
        return res.status(500).json({ 
          success: false, 
          message: 'Internal Server Error during Google Auth', 
          error: err.message || err.toString() 
        });
      }
      if (!user) {
        return res.redirect(`${(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')}/login?error=auth_failed`);
      }
      
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
      res.redirect(`${frontendUrl}/login-success?token=${token}`);
    })(req, res, next);
  });

module.exports = router;
