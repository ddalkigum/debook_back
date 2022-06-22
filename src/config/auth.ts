const DEFAULT_JWT_SIGN_KEY = 'goback';

const authConfig = {
  jwtSignKey: process.env.JWT_SIGN_KEY || DEFAULT_JWT_SIGN_KEY,
  issuer: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://...',
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  maxAge: {
    accessToken: 1000 * 60 * 60,
    refreshToken: 1000 * 60 * 60 * 24 * 30,
  },
};

export default authConfig;
