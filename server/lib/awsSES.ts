require("dotenv").config();
import fetch from "node-fetch";
import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
  Destination,
  Message,
  Body,
  Content,
  SendBounceCommandOutput,
} from "@aws-sdk/client-ses";

const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
const AWS_SES_REGION = process.env.AWS_SES_REGION;
const AWS_SES_VERIFIED_SOURCE = process.env.AWS_SES_VERIFIED_SOURCE;

export interface ITextContent {
  Charset: string; // 텍스트 인코딩 ex) UTF-8, etc..
  Data: string; // 텍스트 내용 string.
}
export interface IBodyContent {
  Charset?: string; // 텍스트 인코딩 ex) UTF-8, etc..
  Data: string; // ( 텍스트 내용 or html ) string.
}
export interface ISendMailSES {
  // to do def send mail parameters ....
  title: ITextContent; // 메일 제목.
  contents: IBodyContent; // 메일 내용( Text or html )
  fromAddress: string; // 메일을 보내는 주소.
  toAddresses: string[]; // 메일을 전달 받을 주소 배열.
  cCAddresses?: string[]; // 참조 받을 메일 주소 배열.
  bCcAddresses?: string[]; // 숨은 참조 받을 메일 주소 배열.
  replyToAddresses?: string[]; // 답장을 받을 주소 배열.
  returnPath?: string; // 반송메일을 받을 주소.
}
export const sendMail = async ({
  title,
  contents,
  fromAddress = `no-reply@${AWS_SES_VERIFIED_SOURCE}`,
  toAddresses,
  cCAddresses,
  bCcAddresses,
  replyToAddresses = [`no-reply@${AWS_SES_VERIFIED_SOURCE}`],
  returnPath = `no-reply@${AWS_SES_VERIFIED_SOURCE}`,
}: ISendMailSES) => {
  // Create SES Client With 'IAM Credential'
  const client = new SESClient({
    region: AWS_SES_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY,
      secretAccessKey: AWS_SECRET_KEY,
    },
  });

  // 이메일 제목
  const subject: Content = title;

  // 이메일 내용
  const body: Body = {
    // Charset 문자 인코딩 값이 존재하면 텍스트 내용 / 존재하지 않으면 html 내용.
    Text: !!contents?.Charset ? contents : undefined,
    Html: !contents?.Charset ? contents : undefined,
  };

  const message: Message = {
    Subject: subject,
    Body: body,
  };

  // 메일을 받을 주소 정보들
  const destinationInfo: Destination = {
    ToAddresses: toAddresses, // 메일을 전달 받을 주소들...
    CcAddresses: cCAddresses, // 참조 주소들...
    BccAddresses: bCcAddresses, // 숨은 참조 주소들...
  };

  const input: SendEmailCommandInput = {
    Source: fromAddress, // 메일을 보내는 주소.
    Destination: destinationInfo,
    Message: message,
    ReturnPath: returnPath, // 반송 메일을 전달 받을 주소.
    ReplyToAddresses: replyToAddresses, // 메일을 전달 받은 사람으로부터 답장을 받을 주소들...
  };

  try {
    const sendEmailCommand = new SendEmailCommand(input);
    const res: SendBounceCommandOutput = await client.send(sendEmailCommand);
    console.log("[ awsSES ] 메일 전송 완료: ", res.$metadata);
  } catch (e) {
    // console.error("[ awsSES ] sendMail Error :", e);
    throw new Error("[ awsSES ] 메일 전송 실패, sendMail Error :", e);
  }
};
