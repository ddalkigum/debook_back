const DEFAULT_JWT_SIGN_KEY = 'goback';

const authConfig = {
  jwtSignKey: process.env.JWT_SIGN_KEY || DEFAULT_JWT_SIGN_KEY,
};

export default authConfig;
