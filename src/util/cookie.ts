import { Response } from 'express';
import * as config from '../config';

const domainList = ['.debook.me', undefined];

export const setCookie = (response: Response, accessToken: string, refreshToken?: string) => {
  domainList.forEach((domain) => {
    response.cookie('accessToken', accessToken, {
      domain,
      httpOnly: true,
      maxAge: config.authConfig.maxAge.accessToken,
    });

    if (refreshToken) {
      response.cookie('refreshToken', refreshToken, {
        domain,
        httpOnly: true,
        maxAge: config.authConfig.maxAge.accessToken,
      });
    }
  });
};

export const unSetCookie = (response: Response) => {
  domainList.forEach((domain) => {
    response.cookie('accessToken', '', {
      domain,
      maxAge: 0,
    });
    response.cookie('refreshToken', '', {
      domain,
      maxAge: 0,
    });
  });
};
