import { Type } from "../../components/toast/enum";
import { setMsg } from "../common";
import { doUpdateCaptcha } from "../axios";

const captchaConfig = {
  config: {
    captchaId: "3d50c20b712aaf5c4390a663f1912941",
    product: "bind",
  },
  handler: (obj: any) => { },
};

// const geeTestLoginGameOnSuccess = (gameAccount: string) => {
//   return (geeTestToken: string) => {
//       doGameLogin(geeTestToken, gameAccount);
//   };
// };
const startCaptcha = (myFunc: (geeTestResult: string) => Promise<void>) => {
  let isDone = false;     // 仅用一个标志位表示是否完成验证
  let errorMessage = "";  // 存储错误信息

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
          await myFunc(geeTestResultStr); // 调用传入的异步函数，并等待其执行完毕
        } catch (e) {
          errorMessage = `执行 myFunc 时出错: ${(e as Error).message}`;
        }
      } else {
        setMsg("请完成验证", Type.Warning);
        errorMessage = "请完成验证";  // 验证结果为空时，设置错误信息
      }
      isDone = true; // 标记验证流程结束
    });

    // 监听验证失败
    obj.onError(() => {
      errorMessage = "验证码加载失败，请稍后再试"; // 设置错误信息
      isDone = true; // 标记验证流程结束
    });
  });

  // 使用 while 循环等待验证结果
  return new Promise<void>((resolve, reject) => {
    const checkStatus = async () => {
      while (!isDone) {
        // 使用 setTimeout 代替繁忙等待，避免阻塞 UI 渲染
        await new Promise((res) => setTimeout(res, 1000));
      }

      // 如果 myFunc 成功执行，则 resolve，否则 reject
      if (!errorMessage) {
        resolve(); // 成功时，直接 resolve
      } else {
        reject(new Error(errorMessage)); // 如果失败则 reject 并返回错误信息
      }
    };
    checkStatus();
  });
};


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
