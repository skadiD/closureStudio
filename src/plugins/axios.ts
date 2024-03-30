import axios from "axios";
import type { Ref } from "vue";
import type { AxiosInstance, AxiosError } from "axios";
import { handleAxiosError } from "./axiosHelper";
import { config } from "./sse";
export const service = axios.create({
    baseURL: "https://api.ltsc.vip/"
});
const user = localStorage.getItem("closureV3_user");

if (user != null) {
    service.defaults.headers.common["Authorization"] = "Bearer " + JSON.parse(user)?.user?.Token;
}
service.interceptors.response.use(
    (response) => {
        if (response.data?.data === undefined) {
            // quota
            let message = "成功";
            if (response.data?.err) {
                message = response.data?.err;
            }
            const data: any = {
                message: message,
                code: response.data?.err || !response.data?.available ? response.data.code ?? 0 : 1,
                data: response.data
            };
            return data;
        }
        return response.data;
    },
    (axiosError: AxiosError) => {
        const error = handleAxiosError(axiosError);
        config.value.isUnderMaintenance = true;
        const fail: Service.FailedResult = {
            error,
            data: null,
            message: "error",
            code: error.code as number
        };
        return fail;
    }
);
type RequestMethod = "get" | "post" | "put" | "delete" | "patch";
interface RequestParam {
    url: string;
    method: RequestMethod;
    data?: any;
    token?: string;
    isSSE?: boolean;
}
interface RequestResultHook<T = any> {
    data: Ref<T | null>;
    error: Ref<Service.RequestError | null>;
    loading: Ref<boolean>;
    network: Ref<boolean>;
}
async function getRequestResponse(params: { instance: AxiosInstance; method: RequestMethod; url: string; data?: any }) {
    const { instance, method, url, data } = params;
    let res: any;
    if (method === "get" || method === "delete") {
        res = await instance[method](url);
    } else {
        res = await instance[method](url, data);
    }
    return res;
}

async function asyncRequest<T>(param: RequestParam): Promise<Service.RequestResult<T>> {
    const { url } = param;
    if (param.token) {
        service.defaults.headers["X-Platform"] = "website";
        service.defaults.headers["token"] = param.token;
    } else {
        delete service.defaults.headers["X-Platform"];
        delete service.defaults.headers["token"];
    }
    if (param.isSSE) {
        service.defaults.headers["Accept"] = "text/event-stream";
    } else {
        delete service.defaults.headers["Accept"];
    }
    const method = param.method || "get";
    const res = (await getRequestResponse({
        instance: service,
        method,
        url,
        data: param.data
    })) as Service.RequestResult<T>;

    return res;
}
function put<T>(url: string, data?: any) {
    return asyncRequest<T>({ url, method: "put", data });
}
function post<T>(url: string, data?: any) {
    return asyncRequest<T>({ url, method: "post", data });
}
function patch<T>(url: string, data?: any) {
    return asyncRequest<T>({ url, method: "patch", data });
}
function get<T>(url: string) {
    return asyncRequest<T>({ url, method: "get" });
}
function captchaGet<T>(url: string, token: string, data?: any) {
    return asyncRequest<T>({ url, method: "get", token, data });
}
function captchaPost<T>(url: string, token: string, data?: any) {
    return asyncRequest<T>({ url, method: "post", token, data });
}
function sse<T>(url: string) {
    return asyncRequest<T>({ url, method: "get", isSSE: true });
}
export default service;
const AuthServer: string = "https://passport.ltsc.vip/api/v1/";
const RegistryServer: string = "https://registry.ltsc.vip/";
const TicketsServer: string = "https://ticket.arknights.host/";
function del(url: string, params: any) {
    return new Promise((resolve) => {
        service.delete(url, { data: params }).then((res) => {
            resolve(res);
        });
    });
}

function load<T>(fileName: string): Promise<T> {
    return new Promise((resolve, reject) => {
        axios
            .get(`/data/${fileName}.json`)
            .then((res) => resolve(res.data as T))
            .catch((error) => reject(error));
    });
}
// idServer
const Auth_Login = (params: { email: string; password: string }) => post<ApiUser.Auth>(`${AuthServer}login`, params);
const Auth_Register = (params: { email: string; password: string; code: string; noise: string; sign: string }) => post<ApiUser.Auth>(`${AuthServer}register`, params);

const Auth_ResetPassword = (params: { email: string; phone: string; newPasswd: string }) => post<ApiUser.Auth>(`${AuthServer}forget`, params);

// idServer admin
const QueryUser = (value: string) => get<ApiUser.User[]>(`${AuthServer}admin/users/query?value=${value}`);
const SendSMS = (params: { uuid: string; phone: string }) => post<string>(`${AuthServer}admin/users/sms`, params);
const UpdateUserPermission = (uuid: string, permission: number) => post(`${AuthServer}admin/permission?uuid=${uuid}&permission=${permission}`);
const SendCodeOnRegister = (params: { email: string }) => post(`${AuthServer}mail/register/code`, params);
const Auth_Info = () => get(`${AuthServer}info`);
const fetchCron = () => get("Nodes"); // Cron
const fetchAnnounce = () => get("Common/Announcement"); // Announce

const fetchGameLogs = (account: string, id: number) => get<ApiGame.GameLogs>(`game/log/${account}/${id}`);
const fetchGameLogsAdmin = (account: string, uuid: string, id: number) => get<ApiGame.GameLogs>(`game/log/${account}/${id}?uuid=${uuid}`);
const fetchGameList = () => get<ApiGame.Game[]>(`game`); // GameList
const fetchGameScreen = (account: string, platform: string) => get(`Game/Screenshot/${account}/${platform}`); // GetScreen
const fetchDetails = (account: string, platform: string) => get(`Game/${account}/${platform}`); // GetDetails
const fetchGameConf = (account: string, platform: string) => get(`Game/Config/${account}/${platform}`); // GetConf

const apiGeetestSet = (account: string, platform: number, params: any) => post(`Game/Captcha/${account}/${platform}`, params); // Geetest

const fetchSytemConfig = () => get<ApiSystem.Config>("system/config");
const fetchSytemList = () => get<ApiSystem.Hall[]>("system/apCostList");

const doGameLogin = (token: string, account: string) => captchaPost(`game/login/${account}`, token, null); // GameLogin

const doAddGame = (slot: string, token: string, params: any) => captchaPost(`${RegistryServer}api/slots/gameAccount?uuid=${slot}`, token, params); // GameCreate
const doUpdateGamePasswd = (slot: string, token: string, params: any) => captchaPost(`${RegistryServer}api/slots/gameAccount?uuid=${slot}`, token, params); // GameCreate
const doDelGame = (slot: string, token: string) =>
    captchaPost(`${RegistryServer}api/slots/gameAccount?uuid=${slot}`, token, {
        account: null
    });
const doDelGameAdmin = (slot: string, token: string) =>
    captchaPost(`${RegistryServer}api/slots/gameAccount?uuid=${slot}`, token, {
        account: null
    });
const doFindAccount = (gameAccount: string, token: string) => captchaGet(`${RegistryServer}api/users/findEmail?gameAccount=${gameAccount}`, token);
const DelQuotaGameAdmin = (userId: string, params: { uuid: string; gameAccount: string | null }) => post<string>(`${RegistryServer}api/mgm/slots/slot?uid=${userId}`, params);

const doUpdateGameConf = (account: string, game: ApiGame.Config) =>
    post(`game/config/${account}`, {
        config: game
    });
const doUpdateCaptcha = (account: string, captcha: any) =>
    post(`game/config/${account}`, {
        captcha_info: captcha
    });
const Auth_Refresh = () => get<ApiUser.Auth>(`${AuthServer}refreshToken`); // RefreshToken
const Auth_Verify = (code: string) => post(`${AuthServer}phone`, { code }); // RealSMS

// qq bind
const fetchQQBindCode = () => get(`${AuthServer}qq`); // QQBindCode // get qqcode

const fetchUserSlots = () => get<Registry.UserInfo>(`${RegistryServer}api/users/me`); // UserSlots
const fetchUserSlotsAdmin = (uid: string) => get<Registry.Slot[]>(`${RegistryServer}api/mgm/slots/slots?uid=${uid}`); // fetch someones slots with admin

const fetchGameListBySSE = () => sse<ApiGame.Game[]>("sse/game"); // 实验性获取 GameList
const fetchGameDetails = (account: string) => get<ApiGame.Detail>(`game/${account}`);

// ---------------------- ticket ----------------------
const GetTicketById = (id: string) => get<TicketSystem.Ticket>(`${TicketsServer}tickets/${id}`); // getTIckets
const GetTickets = () => get<TicketSystem.Ticket[]>(`${TicketsServer}tickets`); // getTIckets
const GetReplys = (id: string) => get<TicketSystem.Ticket[]>(`${TicketsServer}tickets/${id}/replies`); // getTIckets
const UpdateTicketById = (id: string, data: TicketSystem.updateTicket) => put(`${TicketsServer}tickets/${id}`, data); // getTIckets
const ReplyTicket = (id: string, data: TicketSystem.createTicket) => post(`${TicketsServer}tickets/${id}/replies`, data); // getTIckets
const PostTicket = (data: TicketSystem.createTicket) => post(`${TicketsServer}tickets/`, data); // getTIckets

export { Auth_Login, Auth_Register, Auth_ResetPassword, Auth_Verify, Auth_Info, Auth_Refresh, QueryUser, SendSMS, UpdateUserPermission, SendCodeOnRegister };
export { fetchSytemConfig, fetchSytemList, fetchGameList, fetchGameListBySSE, fetchUserSlots, fetchGameDetails, fetchUserSlotsAdmin, fetchGameLogsAdmin, DelQuotaGameAdmin, doFindAccount };
export { doAddGame, doGameLogin, doDelGame, doUpdateGamePasswd, doUpdateGameConf, fetchQQBindCode };
export { doUpdateCaptcha, fetchGameLogs };
export { load };

export { GetTickets, UpdateTicketById, GetTicketById, ReplyTicket, GetReplys, PostTicket };
