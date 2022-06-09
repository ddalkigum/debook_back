import multer from 'multer';
import fs from 'fs';
import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { IApiResponse } from '../../common/interface';
import { IWinstonLogger } from '../../infrastructure/logger/interface';
import { TYPES } from '../../type';
import { IHttpRouter } from '../interface';
import { IMiddleware } from '../../middleware/interface';
import { IS3Client } from '../../infrastructure/aws/s3/interface';
import * as util from '../../util';

export interface SendData {
  /**
   * URL of the uploaded object.
   */
  Location: string;
  /**
   * ETag of the uploaded object.
   */
  ETag: string;
  /**
   * Bucket to which the object was uploaded.
   */
  Bucket: string;
  /**
   * Key to which the object was uploaded.
   */
  Key: string;
}

@injectable()
export default class ImageRouter implements IHttpRouter {
  @inject(TYPES.WinstonLogger) private logger: IWinstonLogger;
  @inject(TYPES.ApiResponse) private apiResponse: IApiResponse;
  @inject(TYPES.Middleware) private middleware: IMiddleware;
  @inject(TYPES.S3Client) private s3Client: IS3Client;

  private router = Router();

  public init = () => {
    this.router.post(
      '',
      multer({ dest: 'image' }).single('image'),
      async (request: Request, response: Response, next: NextFunction) => {
        await this.apiResponse.generateResponse(request, response, next, async () => {
          const s3 = this.s3Client.get();
          const imageFile = fs.readFileSync(`image/${request.file.filename}`);
          const { nickname, type } = request.body;

          const fileID = util.uuid.generageUUID();
          console.log(imageFile);
          console.log('first: ', fileID);
          const upload: any = s3.upload(
            {
              Bucket: 'goback',
              Key: `image/${type}/${nickname}/${fileID}`,
              Body: imageFile,
              ContentType: 'image/png',
            },
            (error, data) => {
              if (error) {
                throw error;
              } else {
                return data;
              }
            }
          );

          const result = await Promise.resolve(upload);
          const encodedNickname = encodeURIComponent(nickname);
          console.log('second: ', fileID);
          const imageURL = `https://cdn.debook.me/image/${type}/${encodedNickname}/${fileID}`;
          return imageURL;
        });
      }
    );
  };

  public get = () => {
    return this.router;
  };
}
