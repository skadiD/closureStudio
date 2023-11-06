import axios from "axios";
import type { Ref } from 'vue';
import type { AxiosInstance, AxiosError } from 'axios';
import { handleAxiosError, handleServiceResult } from "./axiosHelper";
import {config} from "../views/common";
const service = axios.create({
    baseURL: "https://api.arknights.host/"
});
const user = localStorage.getItem("closureV3_user");

if (user != null) {
    service.defaults.headers.common['Authorization'] = JSON.parse(user)?.user?.Token;
}
service.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (axiosError: AxiosError) => {
        const error = handleAxiosError(axiosError);
        config.value.isUnderMaintenance = true
        return handleServiceResult(error, null);
    }
);
type RequestMethod = 'get' | 'post' | 'put' | 'delete';
interface RequestParam {
    url: string;
    method: RequestMethod;
    data?: any;
    token?: string;
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
    if (method === 'get' || method === 'delete') {
        res = await instance[method](url);
    } else {
        res = await instance[method](url, data);
    }
    return res;
}

async function asyncRequest<T>(param: RequestParam): Promise<Service.RequestResult<T>> {
    const { url } = param;
    if (param.token) {
        service.defaults.headers['X-Platform'] = 'website';
        service.defaults.headers['token'] = param.token;
    }
    const method = param.method || 'get';
    const res = (await getRequestResponse({
        instance: service,
        method,
        url,
        data: param.data,
    })) as Service.RequestResult<T>;

    return res;
}
function post<T>(url: string, data?: any) {
    return asyncRequest<T>({ url, method: 'post', data });
}
function get<T>(url: string) {
    return asyncRequest<T>({ url, method: 'get' });
}
function captcha<T>(url: string, token: string, data?: any) {
    return asyncRequest<T>({ url, method: 'post', token, data });
}
export default service;
// const AuthServer: string = "http://127.0.0.1:3000/api/v1/";
const AuthServer: string = "https://passport.dzp.me/api/v1/";

function del(url: string, params: any) {
    return new Promise((resolve) => {
        service.delete(url, { data: params }).then((res) => {
            resolve(res);
        });
    });
}
function load(fileName: string) {
    return new Promise((resolve) => {
        axios.get(`/data/${fileName}.json`).then((res) => {
            resolve(res.data);
        });
    });
}

const Auth_Login = (params: {email: string, password: string}) => post<ApiUser.Auth>(`${AuthServer}login`, params );
const Auth_Register = (params: {email: string, password: string, noise: string, sign: string}) =>
    post<ApiUser.Auth>(`${AuthServer}register`, params);
const Auth_Verify = (code: string) => get(`${AuthServer}verify?code=${code}`);
const Auth_Info = () => get(`${AuthServer}info`);
const fetchCron = () => get("Nodes"); // Cron
const fetchAnnounce = () => get("Common/Announcement"); // Announce

const doGameLogin = (params: any) => post("Game/Login", params); // GameLogin
const fetchGameLog = (account: string, platform: string) => get(`Game/Log/${account}/${platform}/0`); // GameLog
const fetchGameList = () => get<ApiUser.Game[]>(`game`); // GameList
const doDelGame = (params: any) => del("Game", params); // Del
const fetchGameScreen = (account: string, platform: string) =>
    get(`Game/Screenshot/${account}/${platform}`); // GetScreen
const fetchDetails = (account: string, platform: string) =>
    get(`Game/${account}/${platform}`); // GetDetails
const fetchGameConf = (account: string, platform: string) =>
    get(`Game/Config/${account}/${platform}`); // GetConf
const LoadMapList = () => get("System/Maps"); // GetMapList
const fechSystemLog = () => get("System/LogFile"); // GetLog
const doGameDataUpdate = () => post("System/GameDataUpdate", {}); // UpdateData
const doEditAnnounce = (params: any) =>
    post("Common/Announcement", params); // EditAnnounce
const fetchStatus = () => get("System/Status"); // Status
const LoadTableStage = () => load("Stage");
const TableStage_ = () => load("stage_table");
const TableItems_ = () => load("item_table");
const LoadTableItems = () => load("Items");

const AdminResetPasswd = (account: string, password: string) =>
    post(`System/Password/${account}/${password}`, {}); // ResetPasswd
const AdminBan = (account: string, code: string) =>
    post(`System/Account/Status/${account}/${code}`, {}); // Ban
const apiGeetestSet = (account: string, platform: number, params: any) => post(`Game/Captcha/${account}/${platform}`, params) // Geetest

const fetchSytemConfig = () => get<ApiSystem.Config>('system/config')
const fetchSytemList = () => get<ApiSystem.Hall[]>('system/apCostList')


const doAddGame = (token: string, params: any) => captcha("game", token, params); // GameCreate

export { Auth_Login, Auth_Register, Auth_Verify, Auth_Info }
export { fetchSytemConfig, fetchSytemList, fetchGameList }
export { doAddGame, doGameLogin, doDelGame, doGameDataUpdate, doEditAnnounce }
export { LoadMapList, LoadTableStage, LoadTableItems }
export { AdminResetPasswd, AdminBan, }