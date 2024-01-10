import { ISendMailSES, sendMail } from "../server/lib/awsSES";

(async function () {
  const emailVerifyUrl = `http://tomomi.site/`;
  const emailData: ISendMailSES = {
    title: {
      Charset: "UTF-8",
      Data: "[jong-cms] 이메일 인증 확인 메일 입니다.",
    },
    contents: {
      Data: `<div style="font-family: 'Pretendard' !important; width: 540px; height: 600px; border-top: 4px solid #415765; margin: 100px auto; padding: 30px 0; box-sizing: border-box;">
            <h1 style="margin: 0; padding: 0 5px; font-size: 28px; font-weight: 400;">
              <span style="font-size: 15px; margin: 0 0 10px 3px;">tomomi.site </span><br />
              <span style="color: {$point_color};">메일인증</span> 안내입니다.
            </h1>
            <p style="font-size: 16px; line-height: 26px; margin-top: 50px; padding: 0 5px;">
              안녕하세요.<br />
              tomomi.site 에 가입해 주셔서 진심으로 감사드립니다.<br />
              아래 <b style="color: #415765;">'메일 인증'</b> 버튼을 클릭하여 메일 인증을 완료해 주세요.<br />
              감사합니다.
            </p>
          
            <a style="color: #FFF; text-decoration: none; text-align: center;" href="${emailVerifyUrl}" target="_blank"><p style="display: inline-block; width: 210px; height: 45px; margin: 30px 5px 40px; background: #415765; line-height: 45px; vertical-align: middle; font-size: 16px;">메일 인증</p></a>
          
            <div style="border-top: 1px solid #DDD; padding: 5px;">
              <p style="font-size: 13px; line-height: 21px; color: #555;">
                만약 버튼이 정상적으로 클릭되지 않는다면, 아래 링크를 브라우저 주소창에 복사하여 접속해 주세요.<br />
                ${emailVerifyUrl}
              </p>
            </div>
          </div>`,
    },
    fromAddress: `no-reqply@tomomi.site`,
    toAddresses: ["ghks18g@gmail.com"],
    replyToAddresses: ["ghks18g@gmail.com"],
  };
  await sendMail(emailData);
})();
