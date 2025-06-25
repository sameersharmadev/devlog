import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from '../db/index.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                if (!email) return done(new Error('No email found from Google'));

                const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

                let user;

                if (existing.rows.length === 0) {
                    const baseUsername = (profile.displayName || 'user').toLowerCase().replace(/\s+/g, '');
                    let username = baseUsername;
                    let suffix = 0;

                    while (true) {
                        const check = await pool.query('SELECT 1 FROM users WHERE username = $1', [username]);
                        if (check.rows.length === 0) break;

                        suffix++;
                        username = `${baseUsername}${suffix}`;
                    }

                    const avatar_url = `https://api.dicebear.com/8.x/shapes/svg?seed=${encodeURIComponent(username)}`;

                    const result = await pool.query(
                        `INSERT INTO users (username, email, password_hash, avatar_url) 
                         VALUES ($1, $2, $3, $4) 
                         RETURNING id, username, email, role, avatar_url`,
                        [username, email, 'oauth_google_user', avatar_url]
                    );

                    user = result.rows[0];
                } else {
                    user = existing.rows[0];
                }

                const token = jwt.sign(
                    { userId: user.id, role: user.role },
                    JWT_SECRET,
                    { expiresIn: '1d' }
                );

                done(null, { token });
            } catch (err) {
                console.error('Google strategy error:', err);
                done(err, null);
            }
        }
    )
);

export default passport;
