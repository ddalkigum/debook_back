import { WebClient } from '@slack/web-api';
import { ISlackClient } from './interface';
import * as config from '../../config';
import { injectable } from 'inversify';
import { BaseError } from '../../common/error';

@injectable()
export default class SlackClient implements ISlackClient {
  private web = new WebClient(config.serverConfig.slackBotToken);

  public sendAlaram = (error, request, response, next) => {
    try {
      if (!(error instanceof BaseError)) {
        this.web.chat.postMessage({
          text: `Error\n\rname: ${error.name}\n\rmessage: ${error.message}\n\r\`\`\`stack: ${error.stack}\`\`\``,
          channel: 'C03MZ1LUJAG',
        });
      }
    } finally {
      next(error);
    }
  };
}
