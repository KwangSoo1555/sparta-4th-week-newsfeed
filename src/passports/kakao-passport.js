import passport from 'passport';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { prisma } from '../utils/prisma.util.js';
import { USER_CONSTANT } from '../constants/user-constant.js';

passport.use(
  new KakaoStrategy(
    {
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_SECRET_KEY,
      callbackURL: process.env.KAKAO_CALLBACK_URL,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        profile.id = String(profile.id);
        let user = await prisma.user.findFirst({
          where: { socialId: profile.id },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: profile._json.kakao_account.email,
              nickname: profile.displayName,
              socialId: profile.id,
              provider: USER_CONSTANT.USER_PROVIDER.KAKAO,
            },
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: id },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export { passport as kakaoPassport };
