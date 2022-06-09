import aws from 'aws-sdk';

export type UploadType = 'profile' | 'party';

export interface IS3Client {
  get: () => aws.S3;
}
