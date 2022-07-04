const DEFAULT_PORT = '3001';

const serverConfig = {
  port: process.env.PORT || DEFAULT_PORT,
  baseURL: process.env.BASE_URL,
  kakaoRestKey: process.env.KAKAO_REST_API_KEY,
  slackBotToken: process.env.SLACK_BOT_TOKEN,
};

export default serverConfig;
