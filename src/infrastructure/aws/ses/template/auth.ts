import { SendEmailCommandInput } from '@aws-sdk/client-ses';
import * as config from '../../../../config';

export const getAuthEmailTemplate = (
  userEmail: string,
  code: string,
  baseURL: string,
  isSignup: boolean
): SendEmailCommandInput => {
  const buttonText = isSignup ? '회원가입하기' : '로그인하기';
  const redirectURL = `${baseURL}?code=${code}`;
  const emailTitle = isSignup ? '회원가입' : '로그인';

  return {
    Destination: { ToAddresses: [userEmail] },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `
          <div style="width: 600px; height: 400px;
            border: 1px solid #e6e6e6; 
            border-radius: 12px; ">
      
            <h1 style="width: fit-content;display: block; margin: 0 auto; margin-top: 20px;">Debook</h1>
            
            <div style="text-align: center; margin-top: 20px; width: 600px;">
              <span style="color: gray"><strong>안녕하세요!</strong> 혹시 본인이 보낸 요청이 아니라면,</br> 이 메일을 무시해주세요</span>
            </div>
        
            <a href="${redirectURL}" style="
              display: block;
              width: 600px;
              text-align: center;
              font-size: 1rem;
              padding: 1rem 0;
              background: #009AFE;
              color: whitesmoke;
              font-weight: bold;
              cursor: pointer;
              border-radius: 12px;
              margin-top: 20px;
              text-decoration: none;
            ">${buttonText}</a>
      
            <div style="margin-top: 20px; text-align: center;">
              <p style="margin-top: 20px;">위 버튼이 눌리지 않으면 <a href="${redirectURL}">여기</a>를 클릭해주세요 </p>
              <p>이 링크는 한시간동안 유효합니다</p>
            </div>
          </div>`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `Debook${emailTitle}`,
      },
    },
    Source: config.awsConfig.adminEmail,
  };
};

export const joinEmailTemplate = (userEmail: string): SendEmailCommandInput => {
  const redirectURL = `${config.clientConfig.baseURL}/notification`;

  return {
    Destination: { ToAddresses: [userEmail] },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `
          <div style="width: 600px; height: 400px;
            border: 1px solid #e6e6e6; 
            border-radius: 12px; ">
      
            <h1 style="width: fit-content;display: block; margin: 0 auto; margin-top: 20px;">Debook</h1>
            
            <div style="text-align: center; margin-top: 20px; width: 600px;">
              <span style="color: gray">새로운 가입요청이 있습니다</span>
            </div>
        
            <a href="${redirectURL}" style="
              display: block;
              width: 600px;
              text-align: center;
              font-size: 1rem;
              padding: 1rem 0;
              background: #009AFE;
              color: whitesmoke;
              font-weight: bold;
              cursor: pointer;
              border-radius: 12px;
              margin-top: 20px;
              text-decoration: none;
            ">확인하기</a>
      
            <div style="margin-top: 20px; text-align: center;">
              <p style="margin-top: 20px;">위 버튼이 눌리지 않으면 <a href="${redirectURL}">여기</a>를 클릭해주세요 </p>
            </div>
          </div>`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `Debook 그룹 가입 신청`,
      },
    },
    Source: config.awsConfig.adminEmail,
  };
};
