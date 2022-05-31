import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { IS3Client, UploadType } from './interface';
import * as config from '../../../config';
import * as util from '../../../util';
import { injectable } from 'inversify';

@injectable()
export default class S3Client implements IS3Client {
  private s3 = new aws.S3({
    accessKeyId: config.awsConfig.accessKeyId,
    secretAccessKey: config.awsConfig.secretAccessKey,
    region: config.awsConfig.region,
  });

  public uploadImage = async (type: UploadType, nickname: string) => {
    multer({
      storage: multerS3({
        s3: this.s3,
        cacheControl: 'max-age-31536000',
        bucket: 'goback',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (request: any, file, callback) => {
          const id = util.uuid.generageUUID();
          callback(null, `images/${nickname}/${type}/${id}.png`);
        },
      }),
    });
  };
}
