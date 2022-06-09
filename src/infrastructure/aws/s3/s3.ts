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

  public get = () => {
    return this.s3;
  };
}
