import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { injectable } from 'inversify';
import * as config from '../../../config';
import { ISES } from './interface';
import { getAuthEmailTemplate, joinEmailTemplate } from './template/auth';

@injectable()
export default class SES implements ISES {
  private client: SESClient = new SESClient({
    region: config.awsConfig.region,
    credentials: {
      accessKeyId: config.awsConfig.accessKeyId,
      secretAccessKey: config.awsConfig.secretAccessKey,
    },
  });

  public sendAuthEmail = async (userEmail: string, code: string, isSignup: boolean, baseURL: string) => {
    const template = getAuthEmailTemplate(userEmail, code, baseURL, isSignup);
    const command = new SendEmailCommand(template);
    await this.client.send(command);
  };

  public sendJoinEmail = async (userEmail: string) => {
    const template = joinEmailTemplate(userEmail);
    const command = new SendEmailCommand(template);
    await this.client.send(command);
  };
}
