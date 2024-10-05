import { Type } from "../../components/toast/enum";
import { setMsg } from "../common";
import { doUpdateCaptcha } from "../axios";

const googleRecaptchaSiteKey = "6LfrMU0mAAAAADoo9vRBTLwrt5mU0HvykuR3l8uN"

type GeeTestResult = {
  geetest_challenge: string;
  geetest_validate: string;
  geetest_seccode: string;
};

interface GeetestInstance {
  onReady: (callback: () => void) => void; // 加载完成时的回调
  verify: () => void; // 触发验证
  onSuccess: (callback: () => void) => void; // 验证成功时的回调
  onError: (callback: () => void) => void; // 出错时的回调
  getValidate: () => GeeTestResult | null; // 获取验证结果
}

const captchaConfig = {
  config: {
    captchaId: "3d50c20b712aaf5c4390a663f1912941",
    product: "bind",
  },
  handler: (obj: any) => { },
};

export async function startCaptchaC<T>(myFunc: (captchaToken: string) => Promise<T>): Promise<T> {
  try {
    if (!window.grecaptcha) {
      const result = await startRecaptcha(myFunc);
      return result;
    }
    const result = await startGeeTest(myFunc);
    return result;
  } catch (error) {
    setMsg("人机验证大失败", Type.Error);
    throw error;
  }
}


async function startRecaptcha<T>(myFunc: (captchaToken: string) => Promise<T>): Promise<T> {
  try {
    const token = await window.grecaptcha.execute(googleRecaptchaSiteKey, { action: "submit" });
    if (!token) {
      throw new Error("reCAPTCHA token is empty");
    }
    return await myFunc(token);
  } catch (error) {
    // 更详细的错误处理
    console.error("Failed to execute reCAPTCHA:", error);
    throw new Error(`Failed to execute reCAPTCHA: ${(error as Error).message}`);
  }
}

async function startGeeTest<T>(myFunc: (captchaToken: string) => Promise<T>): Promise<T> {
  // 创建一个新的 Promise 来控制整个 Geetest 流程
  return new Promise<T>((resolve, reject) => {
    let myFuncResult: T | null = null; // 存储 myFunc 的执行结果

    // 初始化 Geetest 验证组件
    window.initGeetest4(captchaConfig.config, (obj: any) => {
      window.captchaObj = obj;
      obj.appendTo("#captcha");

      // 当验证码组件准备就绪时显示验证码
      obj.onReady(() => {
        window.captchaObj.showCaptcha();
      });

      // 当用户完成验证时处理结果
      obj.onSuccess(async () => {
        const result = window.captchaObj.getValidate();
        if (result) {
          const geeTestResultStr = JSON.stringify(result); // 将验证结果序列化为字符串
          try {
            myFuncResult = await myFunc(geeTestResultStr); // 调用传入的异步函数，并等待其执行完毕
            resolve(myFuncResult); // 执行成功时，直接 resolve
          } catch (e) {
            reject(new Error(`执行 myFunc 时出错: ${(e as Error).message}`)); // 异常时 reject 错误信息
          }
        } else {
          setMsg("请完成验证", Type.Warning);
          reject(new Error("请完成验证")); // 验证结果为空时，直接 reject
        }
      });

      // 监听验证失败
      obj.onError(() => {
        reject(new Error("验证码加载失败，请稍后再试")); // 验证码加载失败时，直接 reject 错误信息
      });
    });
  });
}



const updateCaptchaHandler = (onSuccess: (geetestResult: string) => void) => {
  captchaConfig.handler = (obj: any) => {
    window.captchaObj = obj;
    obj.appendTo("#captcha")
    obj.onReady(() => {
      window.captchaObj.showCaptcha()
    })
    obj.onSuccess(() => {
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
