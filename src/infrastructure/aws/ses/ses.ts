import { SendEmailCommand, SendEmailCommandInput, SESClient } from '@aws-sdk/client-ses';
import * as config from '../../../config';

const sesClient = new SESClient({
  region: config.awsConfig.region,
  credentials: {
    accessKeyId: config.awsConfig.accessKeyId,
    secretAccessKey: config.awsConfig.secretAccessKey,
  },
});

export const sendMail = async (template: SendEmailCommandInput) => {
  try {
    const data = await sesClient.send(new SendEmailCommand(template));
    return data;
  } catch (error) {
    console.log(error);
  }
};
