import { Type } from "../../components/toast/enmu";
import { setMsg } from "../common";

const createCaptchaHandler = (onSuccess: (geetestResult:string) => void) => {
    return (obj: any) => {
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
    }
};

export default createCaptchaHandler;