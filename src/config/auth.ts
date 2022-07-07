const DEFAULT_JWT_SIGN_KEY = 'debook';

const authConfig = {
  jwtSignKey: process.env.JWT_SIGN_KEY || DEFAULT_JWT_SIGN_KEY,
  issuer: process.env.NODE_ENV === 'production' ? 'https://api.debook.me' : 'http://localhost:3000',
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,

  maxAge: {
    accessToken: 1000 * 60 * 60,
    refreshToken: 1000 * 60 * 60 * 24 * 30,
  },
};

export default authConfig;
