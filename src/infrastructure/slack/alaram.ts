import { WebClient } from '@slack/web-api';
import { ISlackClient } from './interface';
import * as config from '../../config';
import { injectable } from 'inversify';
import { BaseError } from '../../common/error';
import { Request } from 'express';

@injectable()
export default class SlackClient implements ISlackClient {
  private web = new WebClient(config.serverConfig.slackBotToken);

  public sendAlaram = async (error, request: Request, response, next) => {
    try {
      if (!(error instanceof BaseError)) {
        const contextMessage = `context: ${JSON.stringify(request.body)}`;
        const urlPathMessage = `path: ${request.path}`;
        const queryMessage = `query: ${JSON.stringify(request.query)}`;

        await this.web.chat.postMessage({
          text: `Error\n\r${urlPathMessage}\n\r${queryMessage}\n\r${contextMessage}\n\rname: ${error.name}\n\rmessage: ${error.message}\n\r\`\`\`stack: ${error.stack}\`\`\``,
          channel: 'C03MZ1LUJAG',
        });
      }
    } finally {
      next(error);
    }
  };
}
