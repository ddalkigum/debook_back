const awsConfig = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
  bucketName: process.env.S3_BUCKET_NAME,
  email: {
    auth: 'verify@debook.me',
    noti: 'notify@debook.me',
  },
};

export default awsConfig;
