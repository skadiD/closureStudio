import type { AxiosError, AxiosResponse } from 'axios';
import {
    DEFAULT_REQUEST_ERROR_CODE,
    DEFAULT_REQUEST_ERROR_MSG,
    NETWORK_ERROR_CODE,
    NETWORK_ERROR_MSG,
    ERROR_STATUS,
    REQUEST_TIMEOUT_CODE,
    REQUEST_TIMEOUT_MSG
} from "./config";
type ErrorStatus = keyof typeof ERROR_STATUS;
export async function handleServiceResult<T = any>(error: Service.RequestError | null, data: any) {
    if (error) {
        const fail: Service.FailedResult = {
            error,
            data: null,
            message: 'error',
            code: error.code as number
        };
        return fail;
    }
    const success: Service.SuccessResult<T> = {
        error: null,
        data,
        message: 'success',
        code: 1
    };
    return success;
}
export function handleBackendError(backendResult: Record<string, any>) {
    const error: Service.RequestError = {
        type: 'backend',
        code: backendResult['code'],
        msg: backendResult['message']
    };
    alert(error.msg);
    return error;
}
/**
 * 处理请求成功后的错误
 * @param response - 请求的响应
 */
export function handleResponseError(response: AxiosResponse) {
    const error: Service.RequestError = {
        type: 'axios',
        code: DEFAULT_REQUEST_ERROR_CODE,
        msg: DEFAULT_REQUEST_ERROR_MSG
    };

    if (!window.navigator.onLine) {
        // 网路错误
        Object.assign(error, { code: NETWORK_ERROR_CODE, msg: NETWORK_ERROR_MSG });
    } else {
        // 请求成功的状态码非200的错误
        const errorCode: ErrorStatus = response.status as ErrorStatus;
        const msg = ERROR_STATUS[errorCode] || DEFAULT_REQUEST_ERROR_MSG;
        Object.assign(error, { type: 'http', code: errorCode, msg });
    }
    alert(error);
    return error;
}
/**
 * 处理axios请求失败的错误
 * @param axiosError - 错误
 */
declare namespace Common {
    /**
     * 策略模式
     * [状态, 为true时执行的回调函数]
     */
    type StrategyAction = [boolean, () => void];

    /** 选项数据 */
    type OptionWithKey<K> = { value: K; label: string };
}
/**
 * 策略模式
 * @param actions 每一种可能执行的操作
 */
export function exeStrategyActions(actions: Common.StrategyAction[]) {
    actions.some(item => {
        const [flag, action] = item;
        if (flag) action();
        return flag;
    });
}
export function handleAxiosError(axiosError: AxiosError) {
    const error: Service.RequestError = {
        type: 'axios',
        code: DEFAULT_REQUEST_ERROR_CODE,
        msg: DEFAULT_REQUEST_ERROR_MSG
    };
    const actions: Common.StrategyAction[] = [
        [
            // 网路错误
            !window.navigator.onLine || axiosError.message === 'Network Error',
            () => {
                Object.assign(error, { code: NETWORK_ERROR_CODE, msg: NETWORK_ERROR_MSG });
            }
        ],
        [
            // 超时错误
            axiosError.code === REQUEST_TIMEOUT_CODE && axiosError.message.includes('timeout'),
            () => {
                Object.assign(error, { code: REQUEST_TIMEOUT_CODE, msg: REQUEST_TIMEOUT_MSG });
            }
        ],
        [
            // 请求不成功的错误
            Boolean(axiosError.response),
            () => {
                const errorCode: ErrorStatus = (axiosError.response?.status as ErrorStatus) || 'DEFAULT';
                const msg = ERROR_STATUS[errorCode];
                Object.assign(error, { code: errorCode, msg });
            }
        ]
    ];
    exeStrategyActions(actions);
    alert(error.msg);
    return error;
}