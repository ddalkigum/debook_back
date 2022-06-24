const awsConfig = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
  adminEmail: process.env.ADMIN_EMAIL,
  bucketName: process.env.S3_BUCKET_NAME,
};

export default awsConfig;
