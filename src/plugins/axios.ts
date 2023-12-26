import axios from "axios";
import type { Ref } from "vue";
import type { AxiosInstance, AxiosError } from "axios";
import { handleAxiosError } from "./axiosHelper";
import { config } from "./sse";
export const service = axios.create({
  baseURL: "https://api.arknights.host/",
});
const user = localStorage.getItem("closureV3_user");

if (user != null) {
  service.defaults.headers.common["Authorization"] =
    "Bearer " + JSON.parse(user)?.user?.Token;
}
service.interceptors.response.use(
  (response) => {
    if (response.data?.data === undefined) {
      // quota
      let message = "成功";
      if (response.data?.err) {
        message = response.data?.err
      }
      const data: any = {
        message: message,
        code: response.data?.err ? (response.data.code ?? 0) : 1,
        data: response.data,
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
      code: error.code as number,
    };
    return fail;
  }
);
type RequestMethod = "get" | "post" | "put" | "delete";
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
async function getRequestResponse(params: {
  instance: AxiosInstance;
  method: RequestMethod;
  url: string;
  data?: any;
}) {
  const { instance, method, url, data } = params;
  let res: any;
  if (method === "get" || method === "delete") {
    res = await instance[method](url);
  } else {
    res = await instance[method](url, data);
  }
  return res;
}

async function asyncRequest<T>(
  param: RequestParam
): Promise<Service.RequestResult<T>> {
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
    data: param.data,
  })) as Service.RequestResult<T>;

  return res;
}
function post<T>(url: string, data?: any) {
  return asyncRequest<T>({ url, method: "post", data });
}
function get<T>(url: string) {
  return asyncRequest<T>({ url, method: "get" });
}
function captcha<T>(url: string, token: string, data?: any) {
  return asyncRequest<T>({ url, method: "post", token, data });
}
function sse<T>(url: string) {
  return asyncRequest<T>({ url, method: "get", isSSE: true });
}
export default service;
const AuthServer: string = "https://passport.ltsc.vip/api/v1/";
const RegistryServer: string = "https://registry.ltsc.vip/";
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

const Auth_Login = (params: { email: string; password: string }) =>
  post<ApiUser.Auth>(`${AuthServer}login`, params);
const Auth_Register = (params: {
  email: string;
  password: string;
  noise: string;
  sign: string;
}) => post<ApiUser.Auth>(`${AuthServer}register`, params);
const Auth_Info = () => get(`${AuthServer}info`);
const fetchCron = () => get("Nodes"); // Cron
const fetchAnnounce = () => get("Common/Announcement"); // Announce

const fetchGameLogs = (account: string, id: number) =>
  get<ApiGame.GameLogs>(`game/log/${account}/${id}`);
const fetchGameList = () => get<ApiGame.Game[]>(`game`); // GameList
const fetchGameScreen = (account: string, platform: string) =>
  get(`Game/Screenshot/${account}/${platform}`); // GetScreen
const fetchDetails = (account: string, platform: string) =>
  get(`Game/${account}/${platform}`); // GetDetails
const fetchGameConf = (account: string, platform: string) =>
  get(`Game/Config/${account}/${platform}`); // GetConf
const LoadMapList = () => get("System/Maps"); // GetMapList
const fechSystemLog = () => get("System/LogFile"); // GetLog
const doGameDataUpdate = () => post("System/GameDataUpdate", {}); // UpdateData
const doEditAnnounce = (params: any) => post("Common/Announcement", params); // EditAnnounce
const fetchStatus = () => get("System/Status"); // Status
const LoadTableStage = () => load("Stage");
const TableStage_ = () => load("stage_table");
const TableItems_ = () => load("item_table");
const LoadTableItems = () => load("Items");

const AdminResetPasswd = (account: string, password: string) =>
  post(`System/Password/${account}/${password}`, {}); // ResetPasswd
const AdminBan = (account: string, code: string) =>
  post(`System/Account/Status/${account}/${code}`, {}); // Ban
const apiGeetestSet = (account: string, platform: number, params: any) =>
  post(`Game/Captcha/${account}/${platform}`, params); // Geetest

const fetchSytemConfig = () => get<ApiSystem.Config>("system/config");
const fetchSytemList = () => get<ApiSystem.Hall[]>("system/apCostList");

const doGameLogin = (token: string, account: string) =>
  captcha(`game/login/${account}`, token, null); // GameLogin
const doAddGame = (slot: string, token: string, params: any) =>
  captcha(`${RegistryServer}api/slots/gameAccount?uuid=${slot}`, token, params); // GameCreate
const doUpdateGamePasswd = (slot: string, token: string, params: any) =>
  captcha(`${RegistryServer}api/slots/gameAccount?uuid=${slot}`, token, params); // GameCreate

const doDelGame = (slot: string, token: string) =>
  captcha(`${RegistryServer}api/slots/gameAccount?uuid=${slot}`, token, {
    account: null,
  });

const doUpdateGameConf = (account: string, game: ApiGame.Config) =>
  post(`game/config/${account}`, {
    config: game,
  });
const doUpdateCaptcha = (account: string, captcha: any) =>
    post(`game/config/${account}`, {
      captcha_info: captcha,
    });
const Auth_Refresh = () => get<ApiUser.Auth>(`${AuthServer}refreshToken`); // RefreshToken
const Auth_Verify = (code: string) => post(`${AuthServer}phone`, { code }); // RealSMS

// qq bind
const fetchQQBindCode = () => get(`${AuthServer}qq`); // QQBindCode // get qqcode

const fetchUserSlots = () =>
  get<Registry.UserInfo>(`${RegistryServer}api/users/me`); // UserSlots
const fetchGameListBySSE = () => sse<ApiGame.Game[]>("sse/game"); // 实验性获取 GameList
const fetchGameDetails = (account: string) =>
  get<ApiGame.Detail>(`game/${account}`);
export { Auth_Login, Auth_Register, Auth_Verify, Auth_Info, Auth_Refresh };
export {
  fetchSytemConfig,
  fetchSytemList,
  fetchGameList,
  fetchGameListBySSE,
  fetchUserSlots,
  fetchGameDetails,
};
export { doAddGame, doGameLogin, doDelGame, doUpdateGamePasswd, doUpdateGameConf, fetchQQBindCode };
export { doUpdateCaptcha, fetchGameLogs };
export { load };
