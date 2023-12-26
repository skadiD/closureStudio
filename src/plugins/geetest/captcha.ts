import {Type} from "../../components/toast/enmu";
import {setMsg} from "../common";
import {doUpdateCaptcha} from "../axios";

const captchaConfig = {
  config: {
    captchaId: "d8551513acc423d24401e9622cddd45c",
    product: "bind",
  },
  handler: (obj: any) => {},
};

const updateCaptchaHandler = (onSuccess: (geetestResult: string) => void) => {
  captchaConfig.handler = (obj: any) => {
    window.captchaObj = obj;
    obj.appendTo("#captcha").onSuccess(() => {
      const result: object = window.captchaObj.getValidate();
      if (!result) {
        setMsg("请完成验证", Type.Warning);
        return;
      }
      const resultStr = JSON.stringify(result);
      onSuccess(resultStr);
    });
  };
  window.initGeetest4(captchaConfig.config, captchaConfig.handler);
};

export const gameCaptcha = (account: string, data: ApiGame.CaptchaInfo) => {
  // @ts-ignore
  if (window["initGeetest"] === undefined) {
    console.log("没有初始化Geetest")
    return
  }
  setMsg('加载验证码中...', Type.Info)
  // @ts-ignore
  window.initGeetest({
    gt: data.gt,
    challenge: data.challenge,
    offline: false,
    product: "bind",
    width: "300px",
    https: true,
  }, (captchaObj: any) => {
    captchaObj.onReady(() => {
      captchaObj.verify();
    })
    captchaObj.onSuccess(() => {
      const validate = captchaObj.getValidate();
      setMsg('提交成功，正在登录...', Type.Success)
      doUpdateCaptcha(account, {
        challenge: data.challenge,
        geetest_challenge: validate.geetest_challenge,
        geetest_seccode: validate.geetest_seccode,
        geetest_validate: validate.geetest_validate,
      }).then()
      captchaObj.destroy(); // 这里是销毁实例，处理完逻辑最终销毁
    })
    captchaObj.onError(() => {
      setMsg('验证码加载失败', Type.Warning)
    })
  })
}
export default updateCaptchaHandler;
