import S3 from 'aws-sdk/clients/s3';
import { IS3Client } from './interface';
import * as config from '../../../config';
import { injectable } from 'inversify';

@injectable()
export default class S3Client implements IS3Client {
  private s3 = new S3({
    accessKeyId: config.awsConfig.accessKeyId,
    secretAccessKey: config.awsConfig.secretAccessKey,
    region: config.awsConfig.region,
  });

  public deleteContent = (nickname: string) => {
    this.s3.deleteObjects(
      {
        Bucket: config.awsConfig.bucketName,
        Delete: {
          Objects: [{ Key: `image/profile/${nickname}/` }],
        },
      },
      (error, data) => {
        if (error) console.log(error);
        console.log(data);
      }
    );
  };

  public get = () => {
    return this.s3;
  };
}
