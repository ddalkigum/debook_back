const DEFAULT_JWT_SIGN_KEY = 'goback';

const authConfig = {
  jwtSignKey: process.env.JWT_SIGN_KEY || DEFAULT_JWT_SIGN_KEY,
  googleClientID: process.env.GOOGLE_CLIENT_ID,
};

export default authConfig;
