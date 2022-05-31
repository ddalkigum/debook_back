export type UploadType = 'user' | 'party';

export interface IS3Client {
  uploadImage: (type: UploadType, nickname: string) => Promise<any>;
}
