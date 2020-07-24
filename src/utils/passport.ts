import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStragtegy }  from 'passport-google-oauth20'

export const facebookPassportConfig = () => {
  return passport.use(
    new FacebookStrategy(
      {
        clientID: String(process.env.FACEBOOK_APP_ID),
        clientSecret: String(process.env.FACEBOOK_APP_SECRET),
        callbackURL: `http://${process.env.HOST}:${process.env.PORT}/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'name', 'emails'],
        passReqToCallback: true,
      },
      (req, accessToken, refreshToken, profile, done) => {
        try {
          if (profile) {
            req.user = profile;
            done(null, profile);
          }
        } catch (error) {
          done(error);
        }
      }
    )
  );
};

export const googlePassportConfig = () => {
  return passport.use(
    new GoogleStragtegy(
      {
        clientID: String(process.env.GOOGLE_CLIENT_ID),
        clientSecret: String(process.env.GOOGLE_CLIENT_SECRET),
        callbackURL: `http://${process.env.HOST}:${process.env.PORT}/auth/google/callback`,
        passReqToCallback: true,
      },
      (req, accessToken, refreshToken, profile, done) => {
        try {
          if (profile) {
            req.user = profile;
            done(undefined, profile);
          }
        } catch (error) {
          done(error);
        }
      }
    )
  );
};